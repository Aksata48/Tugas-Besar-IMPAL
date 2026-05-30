import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper: Konversi string "HH:mm" menjadi total menit sejak tengah malam.
// Contoh: "09:30" → 570
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

// ==========================================
// 1. GET ALL BOOKINGS
// ==========================================
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        tempat: true,
        meja: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      nama: b.nama,
      nomor: b.nomor,
      tanggal: b.tanggal,
      jam: b.jam,
      jam_mulai: b.jam_mulai,
      jam_selesai: b.jam_selesai,
      status: b.status,
      lantai: b.lantai,
      nomorMeja: b.nomorMeja,
      mejaId: b.mejaId,
      total_harga: b.total_harga,
      dp_harga: b.dp_harga,
      catatan: b.catatan,
      meja: b.meja
        ? {
            id: b.meja.id,
            nomor_meja: b.meja.nomor_meja,
            nama_lantai: b.meja.nama_lantai,
            kapasitas_kursi: b.meja.kapasitas_kursi,
          }
        : null,
      tempat: { 
        id_tempat: b.tempat.id_tempat,
        nama_tempat: b.tempat.nama_tempat 
      },
    }));

    return NextResponse.json({ success: true, bookings: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// ==========================================
// 2. UPDATE BOOKING STATUS (PATCH)
// ==========================================
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !["accepted", "rejected", "pending", "pending_payment"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid" },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// ==========================================
// 3. CREATE NEW BOOKING (POST)
//
// Body JSON yang diharapkan:
// {
//   tanggal: "2024-08-17",          ← format ISO atau "YYYY-MM-DD"
//   jamMulai: "10:00",              ← format "HH:mm"
//   jamSelesai: "12:00",            ← format "HH:mm"
//   nama: "Budi Santoso",
//   nomor: "081234567890",
//   catatan: "...",                 ← opsional
//   tempatId: "uuid-tempat",
//   username: "budi123",            ← digunakan untuk lookup userId
//   lantai: "Lantai 1",            ← label teks (kompatibilitas lama)
//   nomorMeja: "Meja 01",          ← label teks (kompatibilitas lama)
//   mejaId: "cuid-meja",           ← ID relasi meja baru (opsional jika pakai sistem baru)
// }
//
// Validasi yang dilakukan:
//   1. Kelengkapan data wajib
//   2. Durasi maksimal 2 jam
//   3. Batas jam operasional tempat (waktu_buka & waktu_tutup)
//   4. Anti-overlap: cek apakah meja sudah dibooking di rentang jam yang sama
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tanggal,
      jamMulai,
      jamSelesai,
      nama,
      nomor,
      catatan,
      tempatId,
      username,
      lantai,
      nomorMeja,
      mejaId,
      total_harga,
      dp_harga,
    } = body;

    // --------------------------------------------------
    // VALIDASI 1: Kelengkapan data wajib
    // --------------------------------------------------
    if (
      !tanggal ||
      !jamMulai ||
      !jamSelesai ||
      !nama ||
      !nomor ||
      !username ||
      !tempatId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data booking tidak lengkap! Pastikan semua field wajib sudah diisi.",
        },
        { status: 400 }
      );
    }

    // Harus ada identifier meja (salah satu dari mejaId atau lantai+nomorMeja)
    if (!mejaId && (!lantai || !nomorMeja)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pilih meja terlebih dahulu. Lantai dan Nomor Meja wajib diisi.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // VALIDASI 2: Durasi maksimal 2 jam
    // --------------------------------------------------
    const menitMulai = toMinutes(jamMulai);
    const menitSelesai = toMinutes(jamSelesai);

    if (menitSelesai <= menitMulai) {
      return NextResponse.json(
        {
          success: false,
          message: "Jam selesai harus lebih besar dari jam mulai.",
        },
        { status: 400 }
      );
    }

    const durasiMenit = menitSelesai - menitMulai;
    if (durasiMenit > 120) {
      return NextResponse.json(
        {
          success: false,
          message: `Maksimal durasi booking adalah 2 jam (120 menit). Durasi Anda: ${durasiMenit} menit.`,
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // VALIDASI 3: Jam operasional tempat
    // --------------------------------------------------
    const tempat = await prisma.tempat.findUnique({
      where: { id_tempat: tempatId },
    });

    if (!tempat) {
      return NextResponse.json(
        { success: false, message: "Tempat tidak ditemukan." },
        { status: 404 }
      );
    }

    const menitBuka = toMinutes(tempat.waktu_buka);
    const menitTutup = toMinutes(tempat.waktu_tutup);

    // Toleransi: jam selesai boleh sama dengan waktu tutup (tidak boleh melewati)
    if (menitMulai < menitBuka || menitSelesai > menitTutup) {
      return NextResponse.json(
        {
          success: false,
          message: `Jam booking di luar jam operasional. Tempat buka ${tempat.waktu_buka} - ${tempat.waktu_tutup}.`,
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // VALIDASI 4: Anti-overlap / anti double-booking
    // Cek apakah meja yang sama sudah dibooking pada
    // tanggal yang sama dengan jam yang tumpang tindih.
    //
    // Rumus overlap:
    //   JamMulaiBaru < JamSelesaiLama  DAN
    //   JamSelesaiBaru > JamMulaiLama
    //
    // Mendukung dua mode: berdasarkan mejaId (sistem baru)
    // atau berdasarkan tempatId+lantai+nomorMeja (sistem lama).
    // --------------------------------------------------
    const tanggalDate = new Date(tanggal);
    // Normalisasi ke awal hari (00:00:00) agar perbandingan tanggal tepat
    const tanggalMulaiHari = new Date(tanggalDate);
    tanggalMulaiHari.setHours(0, 0, 0, 0);
    const tanggalAkhirHari = new Date(tanggalDate);
    tanggalAkhirHari.setHours(23, 59, 59, 999);

    // Kondisi filter tanggal untuk Prisma
    const filterTanggal = {
      tanggal: {
        gte: tanggalMulaiHari,
        lte: tanggalAkhirHari,
      },
    };

    // Filter identifikasi meja
    // Jika ada mejaId, gunakan itu; jika tidak, gunakan lantai+nomorMeja+tempatId
    const filterMeja = mejaId
      ? { mejaId }
      : { tempatId, lantai, nomorMeja };

    // Hanya periksa booking yang BUKAN ditolak (rejected)
    // booking pending & accepted sama-sama "menempati" slot meja
    const bookingBentrok = await prisma.booking.findFirst({
      where: {
        ...filterTanggal,
        ...filterMeja,
        status: { not: "rejected" },
        // Overlap terjadi ketika:
        //   jam_mulai booking lama < jamSelesai baru  → ada overlap di sisi kanan
        //   jam_selesai booking lama > jamMulai baru  → ada overlap di sisi kiri
        // Karena sqlite menyimpan jam sebagai String "HH:mm",
        // perbandingan string bekerja benar selama format konsisten ("09:00" < "10:00")
        jam_mulai: { lt: jamSelesai },
        jam_selesai: { gt: jamMulai },
      },
    });

    if (bookingBentrok) {
      return NextResponse.json(
        {
          success: false,
          message: `Meja sudah dipesan pada jam ${bookingBentrok.jam_mulai} - ${bookingBentrok.jam_selesai}. Pilih jam lain.`,
        },
        { status: 409 } // 409 Conflict
      );
    }

    // --------------------------------------------------
    // Lookup User berdasarkan username
    // --------------------------------------------------
    const user = await prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun tidak ditemukan. Silakan login ulang.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // Buat record Booking baru
    // --------------------------------------------------
    const booking = await prisma.booking.create({
      data: {
        tanggal: tanggalDate,
        jam: `${jamMulai} - ${jamSelesai}`,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        nama,
        nomor,
        catatan: catatan || "-",
        tempatId,
        userId: user.id,
        lantai: lantai || null,
        nomorMeja: nomorMeja || null,
        mejaId: mejaId || null,
        status: "pending",
        total_harga: total_harga ? Number(total_harga) : 0,
        dp_harga: dp_harga ? Number(dp_harga) : 0,
      },
      include: {
        tempat: true,
        meja: true,
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        namaTempat: booking.tempat.nama_tempat,
      },
    });
  } catch (error: unknown) {
    console.error("API BOOKING ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menyimpan booking. Pastikan database sudah di-push dan semua data valid.",
      },
      { status: 500 }
    );
  }
}
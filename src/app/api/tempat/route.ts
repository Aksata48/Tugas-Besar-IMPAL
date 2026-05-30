import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// 1. GET: Mengambil Semua Data Tempat
//    Sekarang menyertakan data mejas agar
//    frontend bisa menampilkan daftar meja
//    secara dinamis tanpa hardcode.
// ==========================================
export async function GET() {
  try {
    const tempat = await prisma.tempat.findMany({
      include: {
        // Sertakan data meja agar halaman booking bisa
        // mengambil layout meja langsung dari database
        mejas: {
          orderBy: [
            { nama_lantai: "asc" },
            { nomor_meja: "asc" },
          ],
        },
      },
    });
    return NextResponse.json({
      success: true,
      tempat,
    });
  } catch (error) {
    console.error("ERROR GET TEMPAT:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data tempat" },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. POST: Menyimpan Tempat Baru
//    - Menerima gambar tempat & menu sebagai
//      path file (sudah di-upload via /api/upload)
//    - Menerima lantaiData[] untuk membuat
//      meja secara massal (createMany)
//
// Body JSON yang diharapkan:
// {
//   nama_tempat, alamat, jam_buka, kisaran_harga,
//   id_kampus, latitude, longitude,
//   gambar: "/uploads/xxx.jpg",        ← path hasil /api/upload
//   menu_text: "...",                  ← opsional
//   menu_gambar: "/uploads/yyy.jpg",   ← path hasil /api/upload, opsional
//   lantaiData: [                      ← array konfigurasi meja
//     { namaLantai: "Lantai 1", jumlahMeja: 5, kapasitasPerMeja: 4 },
//     { namaLantai: "Lantai 2", jumlahMeja: 3, kapasitasPerMeja: 6 },
//   ]
// }
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("BODY POST MASUK:", body);

    const {
      nama_tempat,
      alamat,
      jam_buka,
      kisaran_harga,
      id_kampus,
      latitude,
      longitude,
      gambar,
      menu_text,
      menu_gambar,
      lantaiData, // array konfigurasi meja per lantai
      kategori, // Ambil kategori dari form input
    } = body;

    // --- Validasi wajib isi ---
    if (!nama_tempat || !alamat || !id_kampus) {
      return NextResponse.json(
        { success: false, message: "Nama, Alamat, dan Kampus wajib diisi" },
        { status: 400 }
      );
    }

    // --- Validasi menu: wajib ada minimal teks atau foto menu ---
    const hasMenuText = menu_text && menu_text.trim().length > 0;
    const hasMenuGambar = menu_gambar && menu_gambar.trim().length > 0;
    if (!hasMenuText && !hasMenuGambar) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Informasi menu wajib diisi. Masukkan minimal Deskripsi Menu atau Foto Menu.",
        },
        { status: 400 }
      );
    }

    // --- Parsing jam operasional ---
    // Input bisa berupa "08:00 - 22:00" atau "08:00-22:00"
    let waktuBuka = "08:00";
    let waktuTutup = "22:00";
    const stringJam = jam_buka || "08:00 - 22:00";
    if (stringJam && stringJam.includes("-")) {
      const parts = stringJam.split("-");
      waktuBuka = parts[0]?.trim() || "08:00";
      waktuTutup = parts[1]?.trim() || "22:00";
    }

    // --- Pemetaan Kategori dari Form ke ID Kategori Database ---
    let idKategori = "";
    if (kategori) {
      const lowerKat = kategori.toLowerCase();
      if (lowerKat === "cafe" || lowerKat === "kafe") {
        idKategori = "KAT-1";
      } else if (lowerKat === "warkop") {
        idKategori = "KAT-2";
      } else if (lowerKat === "resto" || lowerKat === "restoran") {
        idKategori = "KAT-3";
      } else if (lowerKat === "coworking" || lowerKat === "workspace") {
        idKategori = "KAT-4";
      }
    }

    // --- Buat record Tempat ---
    const tempatBaru = await prisma.tempat.create({
      data: {
        id_tempat: crypto.randomUUID(),
        nama_tempat,
        alamat: alamat || "",
        jam_buka: stringJam,
        waktu_buka: waktuBuka,
        waktu_tutup: waktuTutup,
        kisaran_harga: kisaran_harga || "murah",
        latitude: latitude || -6.9175,
        longitude: longitude || 107.6191,
        id_kampus,
        gambar: gambar || null,
        menu_text: menu_text || null,
        menu_gambar: menu_gambar || null,
        // Buat relasi TempatKategori jika kategori valid terdeteksi
        ...(idKategori ? {
          kategori: {
            create: {
              id_kategori: idKategori,
            }
          }
        } : {}),
      },
    });

    // --- Buat data Meja secara massal jika lantaiData diberikan ---
    // lantaiData adalah array of { namaLantai, jumlahMeja, kapasitasPerMeja }
    let totalMejaDbuat = 0;
    if (Array.isArray(lantaiData) && lantaiData.length > 0) {
      // Bangun flat array semua meja dari seluruh lantai
      const allMejas: {
        nomor_meja: string;
        nama_lantai: string;
        kapasitas_kursi: number;
        tempatId: string;
      }[] = [];

      for (const lantai of lantaiData) {
        const { namaLantai, jumlahMeja, kapasitasPerMeja } = lantai;
        if (!namaLantai || !jumlahMeja) continue;

        const jumlah = Number(jumlahMeja) || 0;
        const kapasitas = Number(kapasitasPerMeja) || 2;

        for (let i = 1; i <= jumlah; i++) {
          // Nomor meja diformat dengan leading zero jika < 10: "Meja 01", "Meja 02", ...
          const nomorFormatted = i < 10 ? `Meja 0${i}` : `Meja ${i}`;
          allMejas.push({
            nomor_meja: nomorFormatted,
            nama_lantai: namaLantai,
            kapasitas_kursi: kapasitas,
            tempatId: tempatBaru.id_tempat,
          });
        }
      }

      if (allMejas.length > 0) {
        const result = await prisma.meja.createMany({ data: allMejas });
        totalMejaDbuat = result.count;
      }
    }

    // Ambil tempat lengkap dengan mejas untuk dikembalikan ke frontend
    const tempatLengkap = await prisma.tempat.findUnique({
      where: { id_tempat: tempatBaru.id_tempat },
      include: {
        mejas: {
          orderBy: [{ nama_lantai: "asc" }, { nomor_meja: "asc" }],
        },
      },
    });

    return NextResponse.json({
      success: true,
      tempat: tempatLengkap,
      totalMejaDbuat,
    });
  } catch (error) {
    console.error("ERROR POST TEMPAT:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah tempat ke database" },
      { status: 500 }
    );
  }
}

// ==========================================
// 3. PATCH: Mengubah Data Tempat
//    Mendukung pembaruan gambar & menu gambar
//    via path yang sudah di-upload.
// ==========================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id_tempat,
      nama_tempat,
      alamat,
      jam_buka,
      kisaran_harga,
      latitude,
      longitude,
      gambar,
      menu_text,
      menu_gambar,
    } = body;

    if (!id_tempat) {
      return NextResponse.json(
        { success: false, message: "ID Tempat tidak ditemukan" },
        { status: 400 }
      );
    }

    // Parsing jam saat update dengan aman
    let extraJamUpdate: Record<string, string> = {};
    const stringJam = jam_buka || "08:00 - 22:00";
    if (stringJam && stringJam.includes("-")) {
      const parts = stringJam.split("-");
      extraJamUpdate.waktu_buka = parts[0]?.trim() || "08:00";
      extraJamUpdate.waktu_tutup = parts[1]?.trim() || "22:00";
    }

    const updatedTempat = await prisma.tempat.update({
      where: { id_tempat },
      data: {
        nama_tempat,
        alamat,
        jam_buka: stringJam,
        kisaran_harga,
        latitude,
        longitude,
        gambar: gambar !== undefined ? gambar : undefined,
        menu_text: menu_text !== undefined ? menu_text : undefined,
        menu_gambar: menu_gambar !== undefined ? menu_gambar : undefined,
        ...extraJamUpdate,
      },
      include: {
        mejas: { orderBy: [{ nama_lantai: "asc" }, { nomor_meja: "asc" }] },
      },
    });

    return NextResponse.json({ success: true, tempat: updatedTempat });
  } catch (error) {
    console.error("ERROR PATCH TEMPAT:", error);
    return NextResponse.json(
      { success: false, message: "Gagal edit tempat" },
      { status: 500 }
    );
  }
}

// ==========================================
// 4. DELETE: Menghapus Data Tempat
//    Cascade di schema akan otomatis menghapus
//    Meja & Booking terkait.
// ==========================================
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id_tempat } = body;

    if (!id_tempat) {
      return NextResponse.json(
        { success: false, message: "ID Tempat wajib disertakan" },
        { status: 400 }
      );
    }

    await prisma.tempat.delete({
      where: { id_tempat },
    });

    return NextResponse.json({ success: true, message: "Tempat berhasil dihapus" });
  } catch (error) {
    console.error("ERROR DELETE TEMPAT:", error);
    return NextResponse.json(
      { success: false, message: "Gagal hapus tempat" },
      { status: 500 }
    );
  }
}
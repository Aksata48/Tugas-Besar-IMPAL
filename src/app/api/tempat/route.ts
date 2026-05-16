import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// 1. GET: Mengambil Semua Data Tempat
// ==========================================
export async function GET() {
  try {
    const tempat = await prisma.tempat.findMany();
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
      jumlah_meja, 
      jumlah_lantai, 
      id_kampus,
      latitude,
      longitude,
    } = body;

    // Validasi basic wajib isi
    if (!nama_tempat || !alamat || !id_kampus) {
      return NextResponse.json(
        { success: false, message: "Nama, Alamat, dan Kampus wajib diisi" },
        { status: 400 }
      );
    }

    // Konsistensi Parsing Jam (Contoh Input: "08:00 - 22:00")
    let waktuBuka = "08:00";
    let waktuTutup = "22:00";
    const stringJam = jam_buka || "08:00 - 22:00";

    // Amankan pemecahan string jam operasional menggunakan optional chaining
    if (stringJam && stringJam.includes("-")) {
      const parts = stringJam.split("-");
      waktuBuka = parts[0]?.trim() || "08:00";
      waktuTutup = parts[1]?.trim() || "22:00";
    }

    const tempatBaru = await prisma.tempat.create({
      data: {
        id_tempat: crypto.randomUUID(), // Menggunakan UUID otomatis
        nama_tempat,
        alamat: alamat || "",
        jam_buka: stringJam, 
        waktu_buka: waktuBuka,
        waktu_tutup: waktuTutup,
        kisaran_harga: kisaran_harga || "murah",
        
        // Pastikan terkonversi menjadi Number atau null jika kosong
        jumlah_meja: jumlah_meja ? Number(jumlah_meja) : null,
        jumlah_lantai: jumlah_lantai ? Number(jumlah_lantai) : null,
        
        // Geolocation default koordinat pusat kota jika kosong
        latitude: latitude || -6.9175,
        longitude: longitude || 107.6191,
        id_kampus: id_kampus, 
        gambar: body.gambar || null,
      },
    });

    return NextResponse.json({ success: true, tempat: tempatBaru });
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
      jumlah_meja, 
      jumlah_lantai,
      latitude,
      longitude,
    } = body;

    if (!id_tempat) {
      return NextResponse.json({ success: false, message: "ID Tempat tidak ditemukan" }, { status: 400 });
    }

    // Parsing jam saat update dengan aman
    let extraJamUpdate: any = {};
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
        jumlah_meja: jumlah_meja !== undefined ? Number(jumlah_meja) : undefined,
        jumlah_lantai: jumlah_lantai !== undefined ? Number(jumlah_lantai) : undefined,
        latitude,
        longitude,
        gambar: body.gambar,
        ...extraJamUpdate
      },
    });

    return NextResponse.json({ success: true, tempat: updatedTempat });
  } catch (error) {
    console.error("ERROR PATCH TEMPAT:", error);
    return NextResponse.json({ success: false, message: "Gagal edit tempat" }, { status: 500 });
  }
}

// ==========================================
// 4. DELETE: Menghapus Data Tempat
// ==========================================
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id_tempat } = body;

    if (!id_tempat) {
      return NextResponse.json({ success: false, message: "ID Tempat wajib disertakan" }, { status: 400 });
    }

    await prisma.tempat.delete({
      where: { id_tempat },
    });

    return NextResponse.json({ success: true, message: "Tempat berhasil dihapus" });
  } catch (error) {
    console.error("ERROR DELETE TEMPAT:", error);
    return NextResponse.json({ success: false, message: "Gagal hapus tempat" }, { status: 500 });
  }
}
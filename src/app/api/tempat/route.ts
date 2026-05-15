import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// 1. GET: Mengambil Semua Data Tempat
// ==========================================
export async function GET() {
  try {
    const tempat = await prisma.tempat.findMany({
      include: {
        kampus: true,
        fasilitas: true,
        kategori: true,
      },
    });
    return NextResponse.json({ success: true, tempat });
  } catch (error) {
    console.error("ERROR GET TEMPAT:", error);
    return NextResponse.json(
      { success: false, message: "Server Error saat mengambil data" },
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
    const { 
      nama_tempat, 
      alamat, 
      jam_buka, 
      kisaran_harga, 
      jumlah_meja, 
      jumlah_lantai, 
      id_kampus 
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

    if (stringJam.includes("-")) {
      const parts = stringJam.split("-");
      waktuBuka = parts[0]?.trim() || "08:00";
      waktuTutup = parts[1]?.trim() || "22:00";
    }

    const tempatBaru = await prisma.tempat.create({
      data: {
        nama_tempat,
        alamat,
        jam_buka: stringJam, 
        waktu_buka: waktuBuka,
        waktu_tutup: waktuTutup,
        kisaran_harga: kisaran_harga || "murah",
        
        // Pastikan terkonversi menjadi Number atau null jika kosong
        jumlah_meja: jumlah_meja ? Number(jumlah_meja) : null,
        jumlah_lantai: jumlah_lantai ? Number(jumlah_lantai) : null,
        
        // Geolocation default koordinat pusat kota
        latitude: -6.9175,
        longitude: 107.6191,
        id_kampus: id_kampus, 
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
      jumlah_lantai 
    } = body;

    if (!id_tempat) {
      return NextResponse.json({ success: false, message: "ID Tempat tidak ditemukan" }, { status: 400 });
    }

    // Parsing jam saat update
    let extraJamUpdate: any = {};
    if (jam_buka && jam_buka.includes("-")) {
      const parts = jam_buka.split("-");
      extraJamUpdate.waktu_buka = parts[0]?.trim();
      extraJamUpdate.waktu_tutup = parts[1]?.trim();
    }

    const updatedTempat = await prisma.tempat.update({
      where: { id_tempat },
      data: {
        nama_tempat,
        alamat,
        jam_buka,
        kisaran_harga,
        // Konversi angka yang sudah diperbaiki typonya
        jumlah_meja: jumlah_meja !== undefined ? Number(jumlah_meja) : undefined,
        jumlah_lantai: jumlah_lantai !== undefined ? Number(jumlah_lantai) : undefined,
        ...extraJamUpdate
      },
    });

    return NextResponse.json({ success: true, tempat: updatedTempat });
  } catch (error) {
    console.error("ERROR PATCH TEMPAT:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data tempat" },
      { status: 500 }
    );
  }
}

// ==========================================
// 4. DELETE: Menghapus Tempat
// ==========================================
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_tempat } = body;

    if (!id_tempat) {
      return NextResponse.json({ success: false, message: "ID wajib dicantumkan" }, { status: 400 });
    }

    await prisma.tempat.delete({
      where: { id_tempat },
    });

    return NextResponse.json({ success: true, message: "Tempat berhasil dihapus" });
  } catch (error) {
    console.error("ERROR DELETE TEMPAT:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus tempat" },
      { status: 500 }
    );
  }
}
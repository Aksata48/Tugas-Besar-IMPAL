import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Pastikan path ke file lib prisma Anda sesuai

// 1. Menangani method GET
export async function GET(request: NextRequest) {
  try {
    const tempat = await prisma.tempat.findMany({
      include: {
        kampus: true,
        fasilitas: true,
        kategori: true,
      }
    });

    // Ubah data waktu_buka dan waktu_tutup menjadi satu string jam_buka agar kompatibel dengan frontend
    const formattedTempat = tempat.map(t => ({
      ...t,
      jam_buka: t.waktu_buka && t.waktu_tutup ? `${t.waktu_buka} - ${t.waktu_tutup}` : ""
    }));

    return NextResponse.json({ success: true, tempat: formattedTempat });
  } catch (error) {
    console.error("Error fetching tempat:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}


// 2. Menangani method POST (Menyimpan tempat baru)
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
      id_kampus,
      kategori, 
      fasilitas 
    } = body;

    // Validasi dasar
    if (!nama_tempat || !alamat || !id_kampus) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Memecah jam_buka menjadi waktu_buka dan waktu_tutup
    let waktuBuka = "";
    let waktuTutup = "";
    if (jam_buka && jam_buka.includes("-")) {
      const parts = jam_buka.split("-");
      waktuBuka = parts[0]?.trim() || "";
      waktuTutup = parts[1]?.trim() || "";
    }

    const dataCreate: any = {
      nama_tempat,
      alamat,
      waktu_buka: waktuBuka,
      waktu_tutup: waktuTutup,
      kisaran_harga,
      id_kampus,
    };

    if (jumlah_meja !== undefined && jumlah_meja !== "") {
      dataCreate.jumlah_meja = parseInt(jumlah_meja, 10);
    }
    if (jumlah_lantai !== undefined && jumlah_lantai !== "") {
      dataCreate.jumlah_lantai = parseInt(jumlah_lantai, 10);
    }

    // Menambahkan relasi nested create jika ada
    if (kategori) {
      dataCreate.kategori = kategori;
    }
    if (fasilitas) {
      dataCreate.fasilitas = fasilitas;
    }

   const tempat = await prisma.tempat.create({
  data: {
    nama_tempat: body.nama_tempat,
    alamat: body.alamat,
    jam_buka: body.jam_buka,
    kisaran_harga: body.kisaran_harga,
    jumlah_meja: body.jumlah_meja ? Number(body.jumlah_meja) : null,
    jumlah_lantai: body.jumlah_lantai ? Number(body.jumlah_lantai) : null,
  },
});

    return NextResponse.json({ success: true, tempat });
  } catch (error) {
    console.error("Error creating tempat:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan tempat" },
      { status: 500 }
    );
  }
}

// 3. Menangani method PATCH (Mengubah data tempat)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_tempat, nama_tempat, alamat, jam_buka, kisaran_harga, jumlah_meja, jumlah_lantai } = body;

    const dataUpdate: any = {};
    if (nama_tempat) dataUpdate.nama_tempat = nama_tempat;
    if (alamat) dataUpdate.alamat = alamat;
    if (kisaran_harga) dataUpdate.kisaran_harga = kisaran_harga;

    // Memecah jam_buka jika diubah
    if (jam_buka && jam_buka.includes("-")) {
      const parts = jam_buka.split("-");
      dataUpdate.waktu_buka = parts[0]?.trim() || "";
      dataUpdate.waktu_tutup = parts[1]?.trim() || "";
    }

    if (jumlah_meja !== undefined) {
      dataUpdate.jumlah_meja = jumlah_meja ? parseInt(jumlah_meja, 10) : null;
    }
    if (jumlah_lantai !== undefined) {
      dataUpdate.jumlah_lantai = jumlah_lantai ? parseInt(jumlah_lantai, 10) : null;
    }

    const tempat = await prisma.tempat.update({
  where: { id_tempat: body.id_tempat },
  data: {
    nama_tempat: body.nama_tempat,
    alamat: body.alamat,
    jam_buka: body.jam_buka,
    kisaran_harga: body.kisaran_harga,
    jumlah_meja: body.jumlah_meja ? Number(body.jumlah_meja) : null,
    jumlah_lantai: body.jumlah_lantai ? Number(body.jumlah_lantai) : null,
  },
});

    return NextResponse.json({ success: true, tempat });
  } catch (error) {
    console.error("Error updating tempat:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate tempat" },
      { status: 500 }
    );
  }
}

// 4. Menangani method DELETE (Menghapus tempat)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_tempat } = body;

    await prisma.tempat.delete({
      where: { id_tempat },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tempat:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus tempat" },
      { status: 500 }
    );
  }
}
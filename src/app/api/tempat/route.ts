import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. GET: Mengambil data
export async function GET(request: NextRequest) {
  try {
    const tempat = await prisma.tempat.findMany({
      include: {
        kampus: true,
        fasilitas: true,
        kategori: true,
      }
    });
    return NextResponse.json({ success: true, tempat });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

// 2. POST: Menyimpan tempat baru
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

    // Perbaikan Validasi: Jangan terlalu ketat jika id_kampus bisa default
    if (!nama_tempat || !alamat) {
      return NextResponse.json(
        { success: false, message: "Nama dan Alamat wajib diisi" },
        { status: 400 }
      );
    }

    // Perbaikan Logika Jam: Memecah "08:00 - 22:00" menjadi dua kolom
    let waktuBuka = "00:00";
    let waktuTutup = "00:00";
    if (jam_buka && jam_buka.includes("-")) {
      const parts = jam_buka.split("-");
      waktuBuka = parts[0]?.trim() || "00:00";
      waktuTutup = parts[1]?.trim() || "00:00";
    }

    const tempat = await prisma.tempat.create({
      data: {
        nama_tempat,
        alamat,
        // Kita simpan string aslinya DAN pecahannya untuk StatusOperasional
        jam_buka: jam_buka || "", 
        waktu_buka: waktuBuka,
        waktu_tutup: waktuTutup,
        kisaran_harga: kisaran_harga || "",
        jumlah_meja: jumlah_meja ? Number(jumlah_meja) : 0,
        jumlah_lantai: jumlah_lantai ? Number(jumlah_lantai) : 1,
        // Fallback ID Kampus jika tidak dipilih di form
        id_kampus: id_kampus || "KMP-TELU-01", 
      },
    });

    return NextResponse.json({ success: true, tempat });
  } catch (error) {
    console.error("Error POST:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan ke database" }, { status: 500 });
  }
}

// 3. PATCH: Edit tempat
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_tempat, jam_buka } = body;

    if (!id_tempat) return NextResponse.json({ success: false, message: "ID tidak ditemukan" }, { status: 400 });

    // Pecah jam lagi saat edit agar status operasional terupdate
    let extraUpdate: any = {};
    if (jam_buka && jam_buka.includes("-")) {
      const parts = jam_buka.split("-");
      extraUpdate.waktu_buka = parts[0]?.trim();
      extraUpdate.waktu_tutup = parts[1]?.trim();
    }

    const tempat = await prisma.tempat.update({
      where: { id_tempat },
      data: {
        nama_tempat: body.nama_tempat,
        alamat: body.alamat,
        jam_buka: body.jam_buka,
        kisaran_harga: body.kisaran_harga,
        jumlah_meja: body.jumlah_meja ? Number(body.jumlah_me_ja) : null,
        jumlah_lantai: body.jumlah_lantai ? Number(body.jumlah_lantai) : null,
        ...extraUpdate
      },
    });

    return NextResponse.json({ success: true, tempat });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal update" }, { status: 500 });
  }
}

// 4. DELETE
export async function DELETE(request: NextRequest) {
  try {
    const { id_tempat } = await request.json();
    await prisma.tempat.delete({ where: { id_tempat } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal hapus" }, { status: 500 });
  }
}
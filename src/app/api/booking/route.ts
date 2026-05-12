import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
      lantai,      // Data baru
      nomorMeja    // Data baru
    } = body;

    // 1. VALIDASI DATA WAJIB (Termasuk Lantai & Meja)
    if (!tanggal || !jamMulai || !jamSelesai || !nama || !nomor || !username || !tempatId || !lantai || !nomorMeja) {
      return NextResponse.json(
        { success: false, message: "Data booking tidak lengkap! Pastikan Lantai dan Meja sudah dipilih." }, 
        { status: 400 }
      );
    }

    // 2. VALIDASI DURASI (Maksimal 2 jam)
    const startHour = parseInt(jamMulai.split(":")[0]);
    const endHour = parseInt(jamSelesai.split(":")[0]);
    
    if (endHour - startHour > 2) {
      return NextResponse.json(
        { success: false, message: "Maksimal durasi booking adalah 2 jam!" }, 
        { status: 400 }
      );
    }

    // 3. CARI USER MENGGUNAKAN findFirst
    const user = await prisma.user.findFirst({
      where: { 
        username: username 
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan. Silakan login ulang." }, 
        { status: 404 }
      );
    }

    // 4. SIMPAN DATA BOOKING KE DATABASE
    const booking = await prisma.booking.create({
      data: {
        tanggal: new Date(tanggal),
        jam: `${jamMulai} - ${jamSelesai}`,
        nama: nama,
        nomor: nomor,
        catatan: catatan || "-",
        tempatId: tempatId,
        userId: user.id,
        lantai: lantai,        // Menyimpan lantai
        nomorMeja: nomorMeja,  // Menyimpan nomor meja
      },
      include: {
        tempat: true, 
      },
    });

    return NextResponse.json({ 
      success: true, 
      booking: {
        ...booking,
        namaTempat: booking.tempat.nama_tempat 
      } 
    });

  } catch (error: any) {
    console.error("API BOOKING ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan booking. Pastikan database sudah di-push." }, 
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// 1. GET ALL BOOKINGS
// ==========================================
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { tempat: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      nama: b.nama,
      nomor: b.nomor,
      tanggal: b.tanggal,
      jam: b.jam,
      status: b.status,
      lantai: b.lantai,
      nomorMeja: b.nomorMeja,
      tempat: { nama_tempat: b.tempat.nama_tempat },
    }));

    return NextResponse.json({ success: true, bookings: formatted });
  } catch (error) {
    console.error("GET BOOKING ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// ==========================================
// 2. UPDATE BOOKING STATUS (PATCH)
// ==========================================
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !["accepted", "rejected"].includes(status)) {
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
    console.error("PATCH BOOKING ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// ==========================================
// 3. CREATE NEW BOOKING (POST)
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      tanggal, jamMulai, jamSelesai, nama, nomor, 
      catatan, tempatId, username, lantai, nomorMeja 
    } = body;

    if (!tanggal || !jamMulai || !jamSelesai || !nama || !nomor || !username || !tempatId || !lantai || !nomorMeja) {
      return NextResponse.json(
        { success: false, message: "Data booking tidak lengkap! Pastikan Lantai dan Meja sudah dipilih." }, 
        { status: 400 }
      );
    }

    const startHour = parseInt(jamMulai.split(":")[0]);
    const endHour = parseInt(jamSelesai.split(":")[0]);
    
    if (endHour - startHour > 2) {
      return NextResponse.json(
        { success: false, message: "Maksimal durasi booking adalah 2 jam!" }, 
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { username: username },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan. Silakan login ulang." }, 
        { status: 404 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        tanggal: new Date(tanggal),
        jam: `${jamMulai} - ${jamSelesai}`,
        nama,
        nomor,
        catatan: catatan || "-",
        tempatId,
        userId: user.id,
        lantai,
        nomorMeja,
      },
      include: { tempat: true },
    });

    return NextResponse.json({ 
      success: true, 
      booking: { ...booking, namaTempat: booking.tempat.nama_tempat } 
    });

  } catch (error: any) {
    console.error("API BOOKING ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan booking. Pastikan database sudah di-push." }, 
      { status: 500 }
    );
  }
}

// ==========================================
// 4. DELETE BOOKING (Tambahan Keamanan)
// ==========================================
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID Booking wajib disertakan" }, { status: 400 });
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Booking berhasil dihapus" });
  } catch (error) {
    console.error("DELETE BOOKING ERROR:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus booking" }, { status: 500 });
  }
}
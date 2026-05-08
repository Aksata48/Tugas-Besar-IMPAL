import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { tanggal: "desc" },
      include: { tempat: true },
    });
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tanggal, jam, nama, nomor, tempatId } = body;
    const booking = await prisma.booking.create({
      data: {
        tanggal: new Date(tanggal),
        jam,
        nama,
        nomor,
        tempatId,
        status: "pending",
      },
    });
    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: "Booking gagal" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, message: "Status tidak valid" }, { status: 400 });
    }
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal update status" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
      },
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Booking gagal",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Ambil jamMulai dan jamSelesai dari body
    const { tanggal, jamMulai, jamSelesai, nama, nomor, tempatId } = body;

    // 2. Gabungkan menjadi satu string "jam" agar sesuai dengan kolom di database
    const jamGabungan = `${jamMulai} - ${jamSelesai}`;

    const booking = await prisma.booking.create({
      data: {
        tanggal: new Date(tanggal),
        jam: jamGabungan, // Simpan hasil gabungan ke kolom 'jam'
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
    console.log("Error Detail:", error); // Cek detail error di terminal VS Code

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
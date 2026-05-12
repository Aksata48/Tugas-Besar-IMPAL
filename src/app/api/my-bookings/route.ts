import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username login diperlukan" },
        { status: 400 }
      );
    }

    // Mencari semua booking yang dilakukan oleh USERNAME akun tersebut
    const bookings = await prisma.booking.findMany({
      where: {
        user: {
          username: username, // Mencari berdasarkan pemilik akun
        },
      },
      include: {
        tempat: true, // Sertakan data tempat/resto
      },
      orderBy: {
        createdAt: "desc", // Yang terbaru muncul di atas
      },
    });

    // Mengembalikan data hasil temuan (termasuk kolom 'nama' pelanggan di form)
    return NextResponse.json({ 
      success: true, 
      bookings 
    });
  } catch (error: any) {
    console.error("API ERROR MY-BOOKINGS:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
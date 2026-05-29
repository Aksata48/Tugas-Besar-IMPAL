import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// Next.js 16: params harus di-await karena bertipe Promise
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { tempat: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Tiket tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
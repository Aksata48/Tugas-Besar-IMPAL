import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { tempat: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Tiket tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id_tempat, nama_tempat, alamat, jam_buka, kisaran_harga } = body;

    const updated = await prisma.tempat.update({
      where: { id_tempat },
      data: {
        nama_tempat,
        alamat,
        jam_buka,
        waktu_buka: jam_buka?.split(" - ")[0] || "08:00",
        waktu_tutup: jam_buka?.split(" - ")[1] || "22:00",
        kisaran_harga,
      },
    });

    return NextResponse.json({ success: true, tempat: updated });
  } catch (error) {
    console.error("ERROR PATCH TEMPAT:", error);
    return NextResponse.json({ success: false, message: "Gagal edit tempat" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id_tempat } = body;

    await prisma.tempat.delete({
      where: { id_tempat },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ERROR DELETE TEMPAT:", error);
    return NextResponse.json({ success: false, message: "Gagal hapus tempat" }, { status: 500 });
  }
}
export async function GET() {
  try {
    const tempat = await prisma.tempat.findMany();

    return NextResponse.json({
      success: true,
      tempat,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY MASUK:", body);

     const semuaKampus = await prisma.kampus.findMany();
    console.log("KAMPUS DI DB:", semuaKampus);

    const tempatBaru = await prisma.tempat.create({
  data: {
    id_tempat: crypto.randomUUID(),
    nama_tempat: body.nama_tempat,
    alamat: body.alamat || "",
    jam_buka: body.jam_buka || "08:00 - 22:00",
    waktu_buka: body.jam_buka?.split(" - ")[0] || "08:00",
    waktu_tutup: body.jam_buka?.split(" - ")[1] || "22:00",
    kisaran_harga: body.kisaran_harga || "murah",
    latitude: -6.9175,
    longitude: 107.6191,
    id_kampus: body.id_kampus,
  },
});


    return NextResponse.json({
      success: true,
      tempat: tempatBaru,
    });

  } catch (error) {
    console.error("ERROR TEMPAT:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal tambah tempat",
      },
      { status: 500 }
    );
  }
}
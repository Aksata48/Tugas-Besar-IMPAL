import prisma from "@/lib/prisma"; // <-- Gunakan koneksi aman yang baru dibuat
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, nomor_telepon, password } = body;

    // Validasi kosong
    if (!nama || !email || !nomor_telepon || !password) {
      return NextResponse.json({ error: "Semua kolom wajib diisi!" }, { status: 400 });
    }

    const userLama = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userLama) {
      return NextResponse.json({ error: "Email sudah terdaftar!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userBaru = await prisma.user.create({
      data: {
        nama,
        email,
        nomor_telepon,
        password: hashedPassword,
      },
    });

    // Jangan kembalikan password ke frontend demi keamanan
    const { password: _, ...userTanpaPassword } = userBaru;

    return NextResponse.json({ message: "Registrasi berhasil!", user: userTanpaPassword }, { status: 201 });
    
  } catch (error) {
    console.error("Error Register API:", error); // Munculkan error di terminal untuk di-debug
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
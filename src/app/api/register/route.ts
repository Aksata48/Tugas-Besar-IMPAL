import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, role } = body;

    // 1. Validasi keamanan dasar
    if (!username || !email || !password || !role) {
      return NextResponse.json({ message: "Semua kolom wajib diisi" }, { status: 400 });
    }

    // 2. Cek apakah email sudah dipakai
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email ini sudah terdaftar, silakan gunakan email lain." }, { status: 400 });
    }

    // 3. Kunci password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Masukkan ke database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json({ message: "Registrasi berhasil" }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    // Jangan pernah kirim 'error' mentah ke NextResponse, ini yang bikin crash!
    return NextResponse.json({ message: "Terjadi kesalahan di server pangkalan data." }, { status: 500 });
  }
}
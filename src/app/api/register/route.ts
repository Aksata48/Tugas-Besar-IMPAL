import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, role } = body; 

    // 1. Validasi Input Kosong & Batas Panjang Ekstrim (Pencegahan Overload)
    if (!username || !email || !password) {
      return NextResponse.json({ message: "Semua field wajib diisi!" }, { status: 400 });
    }
    if (username.length > 20 || email.length > 50 || password.length > 32) {
      return NextResponse.json({ message: "Input melebihi batas karakter yang diizinkan." }, { status: 400 });
    }

    // 2. PENANGKAL XSS & SIMBOL (Hanya Huruf dan Angka)
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Username hanya boleh berisi huruf dan angka tanpa spasi atau simbol." },
        { status: 400 }
      );
    }

    // 3. Validasi Format Email Ketat (Hanya Provider Tertentu)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|yahoo\.co\.id|outlook\.com|hotmail\.com|icloud\.com)$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid. Gunakan provider seperti gmail, yahoo, atau outlook." },
        { status: 400 }
      );
    }

    // 4. Validasi Panjang & Kekuatan Password
    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,32}$/;
    if (!pwdRegex.test(password)) {
      return NextResponse.json(
        { message: "Password harus 8-32 karakter dan mengandung kombinasi huruf serta angka." },
        { status: 400 }
      );
    }

    // 5. Cek Email Duplikat 
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar, silakan gunakan email lain atau masuk ke akun Anda." },
        { status: 400 }
      );
    }

    // 6. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Simpan Data
    const finalRole = role === "OWNER" ? "OWNER" : "USER";

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: finalRole,
      }
    });

    // 8. Hapus field password dari response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "Registrasi berhasil! Silakan masuk.", user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
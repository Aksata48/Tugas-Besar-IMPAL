import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validasi Input Kosong (Mencegah submit jika kosong)
    if (!email || !password) {
      return NextResponse.json({ message: "Email dan Password tidak boleh kosong!" }, { status: 400 });
    }

    // 2. Batasan Panjang Ekstrim (Pencegahan Overload/Buffer)
    if (email.length > 50 || password.length > 32) {
      return NextResponse.json({ message: "Input melebihi batas karakter yang diizinkan." }, { status: 400 });
    }

    // 3. Validasi Format Email Ketat (Hanya Provider Tertentu)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|yahoo\.co\.id|outlook\.com|hotmail\.com|icloud\.com)$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid. Gunakan provider resmi seperti gmail atau yahoo." },
        { status: 400 }
      );
    }

    // 4. Cari User di Database (Skenario Negative Testing)
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan. Email belum terdaftar." },
        { status: 404 }
      );
    }

    // 5. Cek Kesesuaian Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Password yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    // 6. Hapus field password demi keamanan sebelum dikirim ke client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "Login berhasil!", user: userWithoutPassword },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
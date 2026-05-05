import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // PERBAIKAN: Tangkap data 'role' dari request body frontend
    const { username, email, password, role } = body; 

    // 1. Validasi Input Kosong (Mencegah submit data kosong)
    if (!username || !email || !password) {
      return NextResponse.json({ message: "Semua field wajib diisi!" }, { status: 400 });
    }

    // 2. PENANGKAL XSS (Sanitasi Username)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Username hanya boleh berisi huruf, angka, dan garis bawah (_), tanpa spasi atau simbol HTML." },
        { status: 400 }
      );
    }

    // 3. Validasi Panjang Password 
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password terlalu pendek, minimal harus 8 karakter." },
        { status: 400 }
      );
    }

    // 4. Validasi Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid." },
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

    // 6. Hash Password untuk Keamanan Database
    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // PERBAIKAN ROLE: Pastikan role yang masuk valid
    // Jika frontend mengirim "OWNER", jadikan OWNER. Jika tidak/kosong, jadikan "USER".
    // ==========================================
    const finalRole = role === "OWNER" ? "OWNER" : "USER";

    // 7. Simpan Data User Baru ke Database beserta Role-nya
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: finalRole, // ROLE DITAMBAHKAN DI SINI
      }
    });

    // 8. Hapus field password dari response demi keamanan
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
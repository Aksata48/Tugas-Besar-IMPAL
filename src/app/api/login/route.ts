import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Email tidak terdaftar" }, { status: 401 });
    }

    // Validasi apakah role yang dipilih di halaman login sesuai dengan aslinya di DB
    if (user.role !== role) {
      const roleText = user.role === "USER" ? "Pengguna Biasa" : "Pemilik Tempat";
      return NextResponse.json({ message: `Akses ditolak. Akun ini terdaftar sebagai ${roleText}` }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Password salah" }, { status: 401 });
    }

    // 🔥 PERBAIKAN DI SINI: Next.js terbaru mewajibkan 'await' untuk cookies
    const cookieStore = await cookies();
    cookieStore.set('user_role', user.role, { path: '/' });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ message: "Login Berhasil", user: userWithoutPassword }, { status: 200 });
    
  } catch (error) {
    console.error("Login Error Asli:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
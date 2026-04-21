import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "Email tidak terdaftar" }, { status: 401 });

    if (user.role !== role) {
      const roleText = user.role === "USER" ? "Pengguna Biasa" : "Pemilik Tempat";
      return NextResponse.json({ message: `Akses ditolak. Akun ini terdaftar sebagai ${roleText}` }, { status: 403 });
    }

    // Cek password (user Google mungkin tidak punya password)
    if (!user.password) {
      return NextResponse.json({ message: "Akun ini terdaftar via Google. Silakan masuk menggunakan Google." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return NextResponse.json({ message: "Password salah" }, { status: 401 });

    // Set Cookie (Wajib await)
    const cookieStore = await cookies();
    cookieStore.set('user_role', user.role, { path: '/' });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ message: "Login Berhasil", user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error("Login Error Asli:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
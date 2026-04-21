import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential, role } = await request.json();

    if (!credential || !role) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Verifikasi token Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ message: "Token Google tidak valid" }, { status: 400 });
    }

    const email = payload.email;
    const name = payload.name || "User Google";

    // 2. Cek user di Database
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Register otomatis jika belum ada
      user = await prisma.user.create({
        data: {
          username: name,
          email: email,
          role: role,
        }
      });
    } else {
      // Jika sudah ada, cek apakah rolenya cocok dengan pintu masuknya
      if (user.role !== role) {
        const roleText = user.role === "USER" ? "Pengguna Biasa" : "Pemilik Tempat";
        return NextResponse.json({ message: `Akses ditolak. Akun ini terdaftar sebagai ${roleText}` }, { status: 403 });
      }
    }

    // 3. Set Cookie (Wajib pakai await untuk Next.js terbaru)
    const cookieStore = await cookies();
    cookieStore.set('user_role', user.role, { path: '/' });

    const { password: _, ...userWithoutPassword } = user as any;
    return NextResponse.json({ message: "Login Google Berhasil", user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error("Google Auth Error Asli:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server saat verifikasi Google" }, { status: 500 });
  }
}
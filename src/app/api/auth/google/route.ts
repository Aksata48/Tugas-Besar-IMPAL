import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential, role, action, email_lama } = await request.json();

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ message: "Token Google tidak valid" }, { status: 400 });
    }

    // FITUR BARU: MODE BIND GOOGLE
    if (action === "bind" && email_lama) {
      const updatedUser = await prisma.user.update({
        where: { email: email_lama },
        data: { google_id: payload.sub }
      });
      const { password: _, ...userWithoutPassword } = updatedUser;
      return NextResponse.json({ message: "Akun Google berhasil dikaitkan!", user: userWithoutPassword }, { status: 200 });
    }

    // MODE LAMA: LOGIN / REGISTER
    const email = payload.email;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // --- LOGIKA PERBAIKAN USERNAME GOOGLE ---
      // 1. Ambil nama dari Google, jadikan huruf kecil, hapus spasi & simbol
      let baseUsername = (payload.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      
      // 2. Jika nama kosong, ambil dari awalan email
      if (!baseUsername) {
        baseUsername = email.split("@")[0].replace(/[^a-z0-9]/g, "");
      }
      
      // 3. Potong maksimal 15 karakter (sisa 5 karakter untuk angka cadangan)
      baseUsername = baseUsername.substring(0, 15);
      
      // 4. Pastikan username benar-benar unik di Database
      let validUsername = baseUsername;
      let counter = 1;
      
      while (true) {
        const existingUser = await prisma.user.findFirst({ 
          where: { username: validUsername } 
        });
        
        if (!existingUser) break; // Jika belum ada yang pakai, hentikan pencarian!
        
        // Jika sudah ada yang pakai, tambahkan angka di belakangnya (contoh: ryanmaulana1)
        validUsername = `${baseUsername}${counter}`;
        counter++;
      }
      // ----------------------------------------

      user = await prisma.user.create({
        data: { 
          username: validUsername, 
          email: email, 
          role: role, 
          google_id: payload.sub 
        }
      });
    } else {
      if (user.role !== role) {
        return NextResponse.json({ message: "Akses ditolak. Role tidak sesuai." }, { status: 403 });
      }
      if (!user.google_id) {
        user = await prisma.user.update({ where: { email }, data: { google_id: payload.sub } });
      }
    }

    const cookieStore = await cookies();
    cookieStore.set('user_role', user.role, { path: '/' });

    const { password: _, ...userWithoutPassword } = user as any;
    return NextResponse.json({ message: "Login Google Berhasil", user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server saat verifikasi Google" }, { status: 500 });
  }
}
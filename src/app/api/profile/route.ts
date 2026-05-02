import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    
    // Ambil data dengan aman
    const email_lama = formData.get("email_lama") as string || "";
    const username = formData.get("username") as string || "";
    const email_baru = formData.get("email_baru") as string || "";
    const no_telp = formData.get("no_telp") as string || "";
    const password = formData.get("password") as string || "";
    const file = formData.get("foto_profil");

    // 1. Cek User
    const user = await prisma.user.findUnique({ where: { email: email_lama } });
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // 2. Siapkan data teks
    let updateData: any = { username, email: email_baru, no_telp };
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 3. Proses File Gambar (Jika Ada)
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const fileBlob = file as File;
      const buffer = Buffer.from(await fileBlob.arrayBuffer());
      
      // Bersihkan nama file dari spasi atau karakter aneh agar aman di Windows
      const safeName = fileBlob.name.replace(/[^a-zA-Z0-9.\-_]/g, ""); 
      const filename = `${Date.now()}_${safeName}`;
      
      // Pastikan path menggunakan format yang benar
      const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");

      // Buat folder secara otomatis jika belum ada (menggunakan fs/promises)
      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      // Simpan alamat gambar ke database
      updateData.foto_profil = `/uploads/profiles/${filename}`;
    }

    // 4. Update Database
    const updatedUser = await prisma.user.update({
      where: { email: email_lama },
      data: updateData
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({ 
      message: "Profil berhasil diperbarui!", 
      user: userWithoutPassword 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    // Tampilkan pesan error asli dari server ke kotak merah frontend
    return NextResponse.json({ message: `Gagal menyimpan: ${error.message}` }, { status: 500 });
  }
}
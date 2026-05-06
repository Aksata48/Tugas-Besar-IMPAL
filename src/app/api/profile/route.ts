import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    
    const email_lama = formData.get("email_lama") as string || "";
    const username = formData.get("username") as string || "";
    const email_baru = formData.get("email_baru") as string || "";
    const no_telp = formData.get("no_telp") as string || "";
    const current_password = formData.get("current_password") as string || ""; 
    const password = formData.get("password") as string || ""; 
    const file = formData.get("foto_profil");

    // 1. CEK USER DI DATABASE
    const user = await prisma.user.findUnique({ where: { email: email_lama } });
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // 2. DETEKSI PERUBAHAN SENSITIF
    const isEmailChanged = email_baru !== email_lama;
    const isPasswordChanged = password && password.trim() !== "";
    const isSensitiveUpdate = isEmailChanged || isPasswordChanged;

    // 3. VERIFIKASI PASSWORD SAAT INI (HANYA JIKA SENSITIF)
    if (isSensitiveUpdate && user.password) {
       if (!current_password) {
          return NextResponse.json({ message: "Untuk alasan keamanan, wajib memasukkan Password Saat Ini untuk mengubah Email atau Password." }, { status: 403 });
       }
       
       const isPasswordValid = await bcrypt.compare(current_password, user.password);
       if (!isPasswordValid) {
          return NextResponse.json({ message: "Password Saat Ini yang Anda masukkan salah. Akses ditolak!" }, { status: 403 });
       }
    }

    // 4. VALIDASI INPUT (NEGATIVE TESTING)
    if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ message: "Username hanya boleh berisi huruf, angka, dan garis bawah (_), serta 3-20 karakter." }, { status: 400 });
    }
    if (email_baru && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_baru)) {
      return NextResponse.json({ message: "Format email baru tidak valid." }, { status: 400 });
    }
    if (no_telp && !/^[0-9]{10,15}$/.test(no_telp)) {
      return NextResponse.json({ message: "Nomor telepon harus berupa angka dan berjumlah 10-15 digit." }, { status: 400 });
    }
    if (isPasswordChanged && password.length < 8) {
      return NextResponse.json({ message: "Password baru terlalu pendek, minimal harus 8 karakter." }, { status: 400 });
    }

    if (isEmailChanged) {
      const emailDipakai = await prisma.user.findUnique({ where: { email: email_baru } });
      if (emailDipakai) {
        return NextResponse.json({ message: "Email baru tersebut sudah terdaftar pada akun lain." }, { status: 400 });
      }
    }

    // 5. SIAPKAN DATA UPDATE
    let updateData: any = { username, email: email_baru, no_telp };
    
    if (isPasswordChanged) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 6. PROSES FOTO PROFIL
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const fileBlob = file as File;
      
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(fileBlob.type)) {
        return NextResponse.json({ message: "Format foto profil harus JPG, JPEG, PNG, atau WEBP." }, { status: 400 });
      }

      if (fileBlob.size > 2 * 1024 * 1024) {
        return NextResponse.json({ message: "Ukuran foto profil maksimal adalah 2MB." }, { status: 400 });
      }

      const buffer = Buffer.from(await fileBlob.arrayBuffer());
      const safeName = fileBlob.name.replace(/[^a-zA-Z0-9.\-_]/g, ""); 
      const filename = `${Date.now()}_${safeName}`;
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      updateData.foto_profil = `/uploads/profiles/${filename}`;
    }

    // 7. SIMPAN KE DATABASE
    const updatedUser = await prisma.user.update({
      where: { email: email_lama },
      data: updateData
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({ 
      message: isSensitiveUpdate ? "Email/Password berhasil diubah dan diverifikasi!" : "Data profil berhasil disimpan!", 
      user: userWithoutPassword 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: `Gagal menyimpan: ${error.message}` }, { status: 500 });
  }
}
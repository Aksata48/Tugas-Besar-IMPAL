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

    // ==========================================
    // 1. BLOK VALIDASI INPUT (NEGATIVE TESTING)
    // ==========================================

    // Validasi Username: Hanya huruf, angka, underscore, 3-20 karakter
    if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ message: "Username hanya boleh berisi huruf, angka, dan garis bawah (_), serta 3-20 karakter." }, { status: 400 });
    }

    // Validasi Email Baru: Format harus benar
    if (email_baru && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_baru)) {
      return NextResponse.json({ message: "Format email baru tidak valid." }, { status: 400 });
    }

    // Validasi Nomor Telepon: Hanya angka, 10-15 digit
    if (no_telp && !/^[0-9]{10,15}$/.test(no_telp)) {
      return NextResponse.json({ message: "Nomor telepon harus berupa angka dan berjumlah 10-15 digit." }, { status: 400 });
    }

    // Validasi Password: Jika diisi, minimal 8 karakter
    if (password && password.trim() !== "" && password.length < 8) {
      return NextResponse.json({ message: "Password baru terlalu pendek, minimal harus 8 karakter." }, { status: 400 });
    }

    // ==========================================
    // 2. CEK USER DI DATABASE
    // ==========================================
    const user = await prisma.user.findUnique({ where: { email: email_lama } });
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah email_baru sudah dipakai oleh orang lain (jika user ganti email)
    if (email_baru !== email_lama) {
      const emailDipakai = await prisma.user.findUnique({ where: { email: email_baru } });
      if (emailDipakai) {
        return NextResponse.json({ message: "Email baru tersebut sudah terdaftar pada akun lain." }, { status: 400 });
      }
    }

    // 3. Siapkan data teks untuk di-update
    let updateData: any = { username, email: email_baru, no_telp };
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // ==========================================
    // 4. VALIDASI & PROSES FILE GAMBAR
    // ==========================================
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const fileBlob = file as File;
      
      // Validasi Ekstensi/Tipe File (Hanya JPG, JPEG, PNG)
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(fileBlob.type)) {
        return NextResponse.json({ message: "Format foto profil harus JPG, JPEG, atau PNG." }, { status: 400 });
      }

      // Validasi Ukuran File (Maksimal 2MB)
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (fileBlob.size > maxSizeInBytes) {
        return NextResponse.json({ message: "Ukuran foto profil maksimal adalah 2MB." }, { status: 400 });
      }

      const buffer = Buffer.from(await fileBlob.arrayBuffer());
      
      // Bersihkan nama file dari spasi atau karakter aneh agar aman di Windows
      const safeName = fileBlob.name.replace(/[^a-zA-Z0-9.\-_]/g, ""); 
      const filename = `${Date.now()}_${safeName}`;
      
      // Pastikan path menggunakan format yang benar
      const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");

      // Buat folder secara otomatis jika belum ada
      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      // Simpan alamat gambar ke database
      updateData.foto_profil = `/uploads/profiles/${filename}`;
    }

    // ==========================================
    // 5. UPDATE DATABASE
    // ==========================================
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
    return NextResponse.json({ message: `Gagal menyimpan: ${error.message}` }, { status: 500 });
  }
}
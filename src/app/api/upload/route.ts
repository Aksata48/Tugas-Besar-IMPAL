import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Konfigurasi: nonaktifkan body parser bawaan Next.js agar bisa baca FormData
export const runtime = "nodejs";

// Tipe file gambar yang diperbolehkan
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

// Ukuran maksimal: 5 MB
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// ==========================================
// POST: Upload satu file gambar
// Endpoint: POST /api/upload
// Body: FormData dengan field "file"
// Response: { success: true, filePath: "/uploads/nama-file.jpg" }
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // --- Validasi input ---
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang dikirim. Pastikan form menggunakan field 'file'." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `Tipe file tidak didukung (${file.type}). Gunakan JPG, PNG, WebP, atau GIF.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 5 MB.` },
        { status: 400 }
      );
    }

    // --- Persiapan direktori tujuan ---
    // process.cwd() = root proyek Next.js → /public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // --- Buat nama file unik agar tidak tumpang tindih ---
    // Format: [timestamp]-[random]-[nama-asli-yang-dibersihkan]
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    // Bersihkan nama file: ganti spasi & karakter aneh dengan tanda hubung
    const sanitizedName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-");
    const uniqueFileName = `${timestamp}-${randomSuffix}-${sanitizedName}`;

    const filePath = path.join(uploadDir, uniqueFileName);

    // --- Tulis file ke disk ---
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Path publik yang bisa diakses dari browser: /uploads/nama-file.jpg
    const publicPath = `/uploads/${uniqueFileName}`;

    console.log(`[UPLOAD] File berhasil disimpan: ${filePath} → akses via ${publicPath}`);

    return NextResponse.json({
      success: true,
      filePath: publicPath,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("[UPLOAD] ERROR saat menyimpan file:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan file. Coba lagi." },
      { status: 500 }
    );
  }
}

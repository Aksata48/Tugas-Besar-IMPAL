"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Store, MapPin, Image as ImageIcon, UtensilsCrossed,
  Plus, Trash2, Save, ArrowLeft, Upload, CheckCircle, Loader2
} from "lucide-react";
import Link from "next/link";
import TempatMap from "@/components/Map";

// ============================================================
// Tipe helper untuk konfigurasi lantai
// ============================================================
interface LantaiConfig {
  namaLantai: string;
  jumlahMeja: number;
  kapasitasPerMeja: number;
}

// ============================================================
// Komponen ImageUploader — reusable untuk upload 1 foto
// - Menampilkan area drag & drop / klik
// - Upload langsung ke /api/upload
// - Mengembalikan filePath ke parent via onUploaded
// ============================================================
function ImageUploader({
  label,
  hint,
  onUploaded,
  currentPath,
}: {
  label: string;
  hint?: string;
  onUploaded: (filePath: string) => void;
  currentPath: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(currentPath || "");

  const handleFile = async (file: File) => {
    setUploadError("");
    const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED.includes(file.type)) {
      setUploadError("Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 5 MB.`);
      return;
    }

    // Preview lokal sebelum upload selesai
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setPreviewUrl(data.filePath); // Ganti preview ke path permanen
        onUploaded(data.filePath);   // Kirim ke parent state
      } else {
        setUploadError(data.message || "Upload gagal. Coba lagi.");
        setPreviewUrl("");
      }
    } catch {
      setUploadError("Koneksi bermasalah. Coba lagi.");
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-600 uppercase">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed cursor-pointer transition-all
          ${isUploading ? "opacity-60 cursor-not-allowed" : "hover:border-orange-400 hover:bg-orange-50/30"}
          ${previewUrl ? "h-40 border-green-300 bg-green-50/20" : "h-32 border-gray-300 bg-gray-50"}
        `}
      >
        {previewUrl ? (
          <>
            {/* Preview gambar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover rounded-xl"
            />
            {/* Overlay sukses */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition">
                <span className="text-white font-bold text-xs bg-black/50 px-3 py-1 rounded-full">Ganti Foto</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            {isUploading ? (
              <>
                <Loader2 size={28} className="animate-spin text-orange-500" />
                <p className="text-sm font-semibold text-orange-500">Mengupload...</p>
              </>
            ) : (
              <>
                <Upload size={28} />
                <p className="text-sm font-semibold">Klik atau seret foto ke sini</p>
                <p className="text-xs">JPG, PNG, WebP · Maks 5 MB</p>
              </>
            )}
          </div>
        )}

        {/* Indikator sukses kecil */}
        {previewUrl && !isUploading && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
            <CheckCircle size={16} />
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
          ⚠️ {uploadError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

// ============================================================
// Halaman Utama: Tambah Tempat
// ============================================================
export default function TambahTempatOwner() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 1. STATE DATA UMUM
  const [formData, setFormData] = useState({
    nama_tempat: "",
    alamat: "",
    waktu_buka: "",
    waktu_tutup: "",
    kisaran_harga: "",
    kategori: "",
    id_kampus: "",
    latitude: -6.9740,
    longitude: 107.6303,
  });

  // 2. STATE PATH FOTO (diisi setelah upload berhasil)
  const [gambarPath, setGambarPath] = useState(""); // Foto tempat utama
  const [menuGambarPath, setMenuGambarPath] = useState(""); // Foto menu
  const [menuText, setMenuText] = useState(""); // Deskripsi menu teks

  // 3. STATE LANTAI & MEJA (Dinamis — per-lantai konfigurasi cepat)
  const [lantaiData, setLantaiData] = useState<LantaiConfig[]>([
    { namaLantai: "Lantai 1", jumlahMeja: 5, kapasitasPerMeja: 4 },
  ]);

  // --- LOGIKA LANTAI ---
  const handleTambahLantai = () => {
    setLantaiData([
      ...lantaiData,
      { namaLantai: `Lantai ${lantaiData.length + 1}`, jumlahMeja: 4, kapasitasPerMeja: 4 },
    ]);
  };

  const handleHapusLantai = (idx: number) => {
    setLantaiData(lantaiData.filter((_, i) => i !== idx));
  };

  const handleChangeLantai = (idx: number, field: keyof LantaiConfig, value: string) => {
    const updated = [...lantaiData];
    if (field === "jumlahMeja" || field === "kapasitasPerMeja") {
      (updated[idx] as any)[field] = parseInt(value) || 0;
    } else {
      (updated[idx] as any)[field] = value;
    }
    setLantaiData(updated);
  };

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Validasi wajib
    if (!formData.nama_tempat || !formData.alamat || !formData.id_kampus) {
      setSubmitError("Nama Tempat, Alamat, dan Kampus wajib diisi.");
      return;
    }
    if (!formData.waktu_buka || !formData.waktu_tutup) {
      setSubmitError("Waktu Buka dan Waktu Tutup wajib diisi.");
      return;
    }
    if (!menuText.trim() && !menuGambarPath) {
      setSubmitError("Informasi menu wajib diisi. Isi minimal Deskripsi Menu atau upload Foto Menu.");
      return;
    }

    setIsLoading(true);

    // Format jam_buka sebagai string "HH:mm - HH:mm"
    const jam_buka = `${formData.waktu_buka} - ${formData.waktu_tutup}`;

    try {
      const payload = {
        nama_tempat: formData.nama_tempat,
        alamat: formData.alamat,
        jam_buka,
        kisaran_harga: formData.kisaran_harga || "murah",
        id_kampus: formData.id_kampus,
        latitude: formData.latitude,
        longitude: formData.longitude,
        gambar: gambarPath || null,
        menu_text: menuText.trim() || null,
        menu_gambar: menuGambarPath || null,
        // Format lantaiData sesuai API: { namaLantai, jumlahMeja, kapasitasPerMeja }
        lantaiData: lantaiData.filter((l) => l.namaLantai.trim() && l.jumlahMeja > 0),
      };

      const res = await fetch("/api/tempat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        // Redirect ke dashboard setelah 1.5 detik
        setTimeout(() => router.push("/owner/dashboard"), 1500);
      } else {
        setSubmitError(data.message || "Gagal menyimpan tempat. Coba lagi.");
      }
    } catch {
      setSubmitError("Koneksi bermasalah. Pastikan server berjalan.");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tempat Berhasil Ditambahkan!</h2>
          <p className="text-gray-500 text-sm">Mengalihkan ke Dashboard Owner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/owner/dashboard" className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Tempat Baru</h1>
            <p className="text-gray-500 text-sm">Lengkapi detail tempat nongkrong Anda di bawah ini.</p>
          </div>
        </div>

        {/* Error global */}
        {submitError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
            ⚠️ {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ==================== CARD 1: Informasi Dasar ==================== */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-5 border-b pb-3">
              <Store className="text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800">Informasi Dasar</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Nama Tempat */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Nama Tempat *</label>
                <input
                  type="text"
                  value={formData.nama_tempat}
                  onChange={(e) => setFormData({ ...formData, nama_tempat: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                  placeholder="Contoh: Plumeria Cafe"
                  required
                />
              </div>

              {/* Alamat */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Alamat Lengkap *</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                  placeholder="Jl. Contoh No. 1, Bandung"
                  required
                />
              </div>

              {/* Kampus */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Kampus Terdekat *</label>
                <select
                  value={formData.id_kampus}
                  onChange={(e) => setFormData({ ...formData, id_kampus: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 outline-none transition"
                  required
                >
                  <option value="">-- Pilih Kampus --</option>
                  <option value="KMP-TELU-01">Telkom University</option>
                  <option value="KMP-ITB-01">ITB</option>
                </select>
              </div>

              {/* Kategori */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Kategori Tempat</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none transition"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Resto">Resto</option>
                  <option value="Coworking">Coworking</option>
                  <option value="Warkop">Warkop</option>
                </select>
              </div>

              {/* Kisaran Harga */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Kisaran Harga</label>
                <select
                  value={formData.kisaran_harga}
                  onChange={(e) => setFormData({ ...formData, kisaran_harga: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none transition"
                >
                  <option value="">Pilih Harga</option>
                  <option value="Murah">Murah (&lt; Rp 30rb)</option>
                  <option value="Sedang">Sedang (Rp 30-70rb)</option>
                  <option value="Mahal">Mahal (&gt; Rp 70rb)</option>
                </select>
              </div>

              {/* Waktu Buka */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Waktu Buka *</label>
                <input
                  type="time"
                  value={formData.waktu_buka}
                  onChange={(e) => setFormData({ ...formData, waktu_buka: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 outline-none transition"
                  required
                />
              </div>

              {/* Waktu Tutup */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Waktu Tutup *</label>
                <input
                  type="time"
                  value={formData.waktu_tutup}
                  onChange={(e) => setFormData({ ...formData, waktu_tutup: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 outline-none transition"
                  required
                />
              </div>

              {/* Peta Lokasi */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Pin Lokasi di Peta</label>
                <div className="h-72 rounded-2xl overflow-hidden border">
                  <TempatMap
                    lat={formData.latitude}
                    lng={formData.longitude}
                    nama={formData.nama_tempat || "Lokasi Tempat"}
                    draggable={true}
                    onDrag={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Latitude: {formData.latitude.toFixed(5)} | Longitude: {formData.longitude.toFixed(5)}
                </p>
              </div>
            </div>
          </div>

          {/* ==================== CARD 2: Foto Tempat ==================== */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-5 border-b pb-3">
              <ImageIcon className="text-green-500" />
              <h2 className="text-lg font-bold text-gray-800">Foto Tempat</h2>
            </div>

            <ImageUploader
              label="Foto Utama Tempat"
              hint="Foto ini akan ditampilkan di halaman daftar & detail tempat."
              onUploaded={(path) => setGambarPath(path)}
              currentPath={gambarPath}
            />

            {gambarPath && (
              <p className="mt-2 text-xs text-green-600 font-semibold">
                ✅ Tersimpan di: <span className="font-mono">{gambarPath}</span>
              </p>
            )}
          </div>

          {/* ==================== CARD 3: Informasi Menu ==================== */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-5 border-b pb-3">
              <UtensilsCrossed className="text-purple-500" />
              <h2 className="text-lg font-bold text-gray-800">Informasi Menu</h2>
              <span className="text-xs text-red-500 font-bold ml-1">(wajib salah satu)</span>
            </div>

            <div className="space-y-4">
              {/* Teks Menu */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Deskripsi Menu Andalan</label>
                <textarea
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                  placeholder="Contoh: Kopi Susu Gula Aren, Matcha Latte, Nasi Goreng Spesial..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition resize-none text-sm"
                />
              </div>

              {/* Foto Menu Upload */}
              <div className="border-t pt-4">
                <ImageUploader
                  label="Foto Menu (Opsional jika sudah ada deskripsi teks)"
                  hint="Upload foto daftar menu atau menu board."
                  onUploaded={(path) => setMenuGambarPath(path)}
                  currentPath={menuGambarPath}
                />
                {menuGambarPath && (
                  <p className="mt-2 text-xs text-green-600 font-semibold">
                    ✅ Tersimpan di: <span className="font-mono">{menuGambarPath}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ==================== CARD 4: Layout Lantai & Meja ==================== */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5 border-b pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="text-blue-500" />
                <h2 className="text-lg font-bold text-gray-800">Layout Lantai & Meja</h2>
              </div>
              <button
                type="button"
                onClick={handleTambahLantai}
                className="flex items-center space-x-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-semibold transition"
              >
                <Plus size={16} /> <span>Tambah Lantai</span>
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Sistem akan otomatis membuat meja bernomor (Meja 01, Meja 02, ...) sesuai jumlah yang Anda input.
            </p>

            <div className="space-y-4">
              {lantaiData.map((lantai, idx) => (
                <div key={idx} className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={lantai.namaLantai}
                      onChange={(e) => handleChangeLantai(idx, "namaLantai", e.target.value)}
                      className="px-3 py-1.5 font-bold text-gray-700 bg-white border rounded-lg focus:border-blue-500 outline-none"
                      placeholder="Nama Lantai (Contoh: Rooftop)"
                    />
                    {lantaiData.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleHapusLantai(idx)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Jumlah Meja</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={lantai.jumlahMeja}
                        onChange={(e) => handleChangeLantai(idx, "jumlahMeja", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Kapasitas / Meja (Kursi)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={lantai.kapasitasPerMeja}
                        onChange={(e) => handleChangeLantai(idx, "kapasitasPerMeja", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    → Akan dibuat: {lantai.jumlahMeja} meja × {lantai.kapasitasPerMeja} kursi di {lantai.namaLantai || "lantai ini"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Menyimpan Data...
              </>
            ) : (
              <>
                <Save size={20} /> Simpan Tempat Nongkrong
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
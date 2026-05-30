"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Store, MapPin, Image as ImageIcon, UtensilsCrossed,
  Plus, Trash2, Save, ArrowLeft, Upload, CheckCircle, Loader2,
  Sun, Home, Sliders, Settings
} from "lucide-react";
import Link from "next/link";
import TempatMap from "@/components/Map";

// ============================================================
// Tipe helper untuk konfigurasi lantai & meja visual
// ============================================================
interface MejaConfig {
  id: string;
  nomorMeja: string;
  kapasitas: number;
  x: number; // Koordinat X (%) di grid
  y: number; // Koordinat Y (%) di grid
}

interface LantaiConfig {
  namaLantai: string;
  tipeLantai: "INDOOR" | "OUTDOOR";
  mejas: MejaConfig[];
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

  // 3. STATE LANTAI & MEJA (Layout Visual - Meja diposisikan secara custom)
  const [lantaiData, setLantaiData] = useState<LantaiConfig[]>([
    { 
      namaLantai: "Lantai 1", 
      tipeLantai: "INDOOR",
      mejas: [
        { id: "m1", nomorMeja: "Meja 01", kapasitas: 4, x: 20, y: 25 },
        { id: "m2", nomorMeja: "Meja 02", kapasitas: 4, x: 50, y: 25 },
        { id: "m3", nomorMeja: "Meja 03", kapasitas: 4, x: 80, y: 25 },
        { id: "m4", nomorMeja: "Meja 04", kapasitas: 2, x: 35, y: 65 },
        { id: "m5", nomorMeja: "Meja 05", kapasitas: 2, x: 65, y: 65 },
      ]
    },
  ]);

  // State untuk melacak meja mana yang sedang digeser (floorIdx, tableIdx)
  const [activeDrag, setActiveDrag] = useState<{ floorIdx: number; tableIdx: number } | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // --- LOGIKA LANTAI & MEJA ---
  const handleTambahLantai = () => {
    const nextIdx = lantaiData.length + 1;
    setLantaiData([
      ...lantaiData,
      { 
        namaLantai: `Lantai ${nextIdx}`, 
        tipeLantai: "INDOOR",
        mejas: [
          { id: Math.random().toString(36).substring(2, 9), nomorMeja: "Meja 01", kapasitas: 4, x: 30, y: 40 },
          { id: Math.random().toString(36).substring(2, 9), nomorMeja: "Meja 02", kapasitas: 4, x: 70, y: 40 }
        ]
      },
    ]);
  };

  const handleHapusLantai = (idx: number) => {
    setLantaiData(lantaiData.filter((_, i) => i !== idx));
  };

  const handleChangeLantaiField = (idx: number, field: "namaLantai" | "tipeLantai", value: string) => {
    const updated = [...lantaiData];
    updated[idx] = { ...updated[idx], [field]: value };
    setLantaiData(updated);
  };

  const handleTambahMeja = (floorIdx: number) => {
    const floor = lantaiData[floorIdx];
    const nextNum = floor.mejas.length + 1;
    const nomorMeja = `Meja ${nextNum < 10 ? '0' + nextNum : nextNum}`;
    const newMeja: MejaConfig = {
      id: Math.random().toString(36).substring(2, 9),
      nomorMeja,
      kapasitas: 4,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
    };
    
    setLantaiData(prev => {
      const updated = [...prev];
      updated[floorIdx].mejas = [...updated[floorIdx].mejas, newMeja];
      return updated;
    });
    setSelectedTableId(newMeja.id);
  };

  const handleHapusMeja = (floorIdx: number, tableId: string) => {
    setLantaiData(prev => {
      const updated = [...prev];
      updated[floorIdx].mejas = updated[floorIdx].mejas.filter(m => m.id !== tableId);
      return updated;
    });
    if (selectedTableId === tableId) setSelectedTableId(null);
  };

  const handleUpdateMeja = (floorIdx: number, tableIdx: number, field: keyof MejaConfig, value: any) => {
    setLantaiData(prev => {
      const updated = [...prev];
      const mejas = [...updated[floorIdx].mejas];
      mejas[tableIdx] = { ...mejas[tableIdx], [field]: value };
      updated[floorIdx].mejas = mejas;
      return updated;
    });
  };

  // --- HANDLER DRAG & MOVE (MOUSE & TOUCH) ---
  const handleTableDrag = (e: React.MouseEvent, floorIdx: number, tableIdx: number) => {
    e.preventDefault();
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    setSelectedTableId(lantaiData[floorIdx].mejas[tableIdx].id);
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      let x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      let y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      // Batasi koordinat antara 2% s.d. 92% agar tidak keluar grid visual
      x = Math.max(2, Math.min(92, x));
      y = Math.max(2, Math.min(90, y));

      setLantaiData((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        updated[floorIdx].mejas[tableIdx].x = parseFloat(x.toFixed(1));
        updated[floorIdx].mejas[tableIdx].y = parseFloat(y.toFixed(1));
        return updated;
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setActiveDrag(null);
    };

    setActiveDrag({ floorIdx, tableIdx });
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleTableTouch = (e: React.TouchEvent, floorIdx: number, tableIdx: number) => {
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    setSelectedTableId(lantaiData[floorIdx].mejas[tableIdx].id);
    
    const onTouchMove = (moveEvent: TouchEvent) => {
      const touch = moveEvent.touches[0];
      let x = ((touch.clientX - rect.left) / rect.width) * 100;
      let y = ((touch.clientY - rect.top) / rect.height) * 100;

      x = Math.max(2, Math.min(92, x));
      y = Math.max(2, Math.min(90, y));

      setLantaiData((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        updated[floorIdx].mejas[tableIdx].x = parseFloat(x.toFixed(1));
        updated[floorIdx].mejas[tableIdx].y = parseFloat(y.toFixed(1));
        return updated;
      });
    };

    const onTouchEnd = () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      setActiveDrag(null);
    };

    setActiveDrag({ floorIdx, tableIdx });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
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
        kategori: formData.kategori,
        // Format lantaiData visual agar kompatibel dengan API baru
        lantaiData: lantaiData.filter((l) => l.namaLantai.trim() && l.mejas.length > 0).map(l => ({
          namaLantai: l.namaLantai,
          tipeLantai: l.tipeLantai,
          mejas: l.mejas.map(m => ({
            nomorMeja: m.nomorMeja,
            kapasitas: m.kapasitas,
            x: m.x,
            y: m.y
          }))
        })),
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
                <Sliders className="text-blue-500" />
                <h2 className="text-lg font-bold text-gray-800">Visual Layout Lantai & Meja</h2>
              </div>
              <button
                type="button"
                onClick={handleTambahLantai}
                className="flex items-center space-x-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-extrabold transition-all"
              >
                <Plus size={16} /> <span>Tambah Lantai</span>
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Posisikan meja cafe Anda secara visual sesuai tata letak asli kafenya. Pelanggan akan memilih meja secara interaktif berdasarkan posisi meja yang Anda edit di bawah ini saat melakukan pemesanan (seperti memesan kursi bioskop).
            </p>

            <div className="space-y-8">
              {lantaiData.map((lantai, idx) => (
                <div key={idx} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-4">
                  
                  {/* Header Lantai & Tipe */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={lantai.namaLantai}
                        onChange={(e) => handleChangeLantaiField(idx, "namaLantai", e.target.value)}
                        className="px-3 py-1.5 font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none w-44"
                        placeholder="Nama Lantai (Contoh: Rooftop)"
                      />
                      {lantaiData.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleHapusLantai(idx)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition"
                          title="Hapus Lantai"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    {/* Selector Tipe Lantai (Indoor / Outdoor) */}
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleChangeLantaiField(idx, "tipeLantai", "INDOOR")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all w-1/2 sm:w-auto justify-center ${
                          lantai.tipeLantai === "INDOOR"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        <Home size={14} /> Indoor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangeLantaiField(idx, "tipeLantai", "OUTDOOR")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all w-1/2 sm:w-auto justify-center ${
                          lantai.tipeLantai === "OUTDOOR"
                            ? "bg-white text-orange-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        <Sun size={14} /> Outdoor
                      </button>
                    </div>
                  </div>

                  {/* Grid Layout Builder */}
                  <div className="relative">
                    <div 
                      className="w-full h-80 rounded-2xl border border-gray-200 bg-slate-50 relative overflow-hidden select-none cursor-crosshair shadow-inner"
                      style={{
                        backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)",
                        backgroundSize: "20px 20px"
                      }}
                    >
                      {/* Petunjuk Visual */}
                      <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border pointer-events-none shadow-sm flex items-center gap-1.5">
                        <Settings size={12} className="animate-spin text-blue-600" />
                        Gunakan Mouse/Sentuhan untuk menyeret meja
                      </div>

                      {/* Tampilkan meja-meja */}
                      {lantai.mejas.map((meja, mIdx) => {
                        const isSelected = selectedTableId === meja.id;
                        const isDragging = activeDrag?.floorIdx === idx && activeDrag?.tableIdx === mIdx;

                        return (
                          <div
                            key={meja.id}
                            onMouseDown={(e) => handleTableDrag(e, idx, mIdx)}
                            onTouchStart={(e) => handleTableTouch(e, idx, mIdx)}
                            style={{ 
                              left: `${meja.x}%`, 
                              top: `${meja.y}%`, 
                              transform: "translate(-50%, -50%)" 
                            }}
                            className={`absolute w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center cursor-move transition-shadow duration-150 select-none shadow-md
                              ${isSelected 
                                ? "bg-orange-500 text-white border-orange-600 ring-4 ring-orange-100 font-extrabold scale-110 z-10" 
                                : "bg-white text-blue-700 border-blue-600 hover:border-orange-500 hover:scale-105 hover:shadow-lg"
                              }
                              ${isDragging ? "opacity-80 border-dashed shadow-2xl cursor-grabbing" : ""}
                            `}
                          >
                            <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{meja.nomorMeja.replace("Meja ", "M")}</span>
                            <span className="text-[9px] opacity-80 mt-0.5 leading-none">👤{meja.kapasitas}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pengaturan Meja Terpilih & Daftar Meja */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Daftar Meja di {lantai.namaLantai}</h4>
                      <button
                        type="button"
                        onClick={() => handleTambahMeja(idx)}
                        className="flex items-center gap-1 text-xs font-extrabold text-blue-600 bg-white border border-blue-100 hover:border-blue-200 px-3 py-1.5 rounded-xl shadow-sm transition"
                      >
                        <Plus size={14} /> Tambah Meja
                      </button>
                    </div>

                    {lantai.mejas.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2 italic">Belum ada meja di lantai ini. Klik 'Tambah Meja' untuk menambahkan.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-52 overflow-y-auto pr-1">
                        {lantai.mejas.map((meja, mIdx) => {
                          const isSelected = selectedTableId === meja.id;
                          return (
                            <div 
                              key={meja.id}
                              onClick={() => setSelectedTableId(meja.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center gap-2
                                ${isSelected 
                                  ? "bg-orange-50 border-orange-200 ring-2 ring-orange-100" 
                                  : "bg-white border-gray-200 hover:border-gray-300"
                                }
                              `}
                            >
                              <div className="flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={meja.nomorMeja}
                                  onChange={(e) => handleUpdateMeja(idx, mIdx, "nomorMeja", e.target.value)}
                                  className="w-full text-xs font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-gray-300 outline-none"
                                />
                                <div className="flex items-center gap-2">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">Kursi:</label>
                                  <select
                                    value={meja.kapasitas}
                                    onChange={(e) => handleUpdateMeja(idx, mIdx, "kapasitas", parseInt(e.target.value))}
                                    className="bg-transparent text-[10px] font-extrabold text-slate-700 outline-none"
                                  >
                                    <option value={2}>2 Kursi</option>
                                    <option value={4}>4 Kursi</option>
                                    <option value={6}>6 Kursi</option>
                                    <option value={8}>8 Kursi</option>
                                  </select>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHapusMeja(idx, meja.id);
                                }}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                                title="Hapus Meja"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

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
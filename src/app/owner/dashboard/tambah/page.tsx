"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Store, MapPin, Image as ImageIcon, UtensilsCrossed,
  Plus, Trash2, Save, ArrowLeft, Upload, CheckCircle, Loader2,
  Sun, Home, Sliders, Settings, Coffee, Beer, Utensils, Laptop,
  GraduationCap
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
  tipeLantai?: string; // INDOOR / OUTDOOR_BALKON / OUTDOOR_ROOFTOP / OUTDOOR_TAMAN / OUTDOOR_TERAS
}

interface LantaiConfig {
  id?: string;
  namaLantai: string;
  tipeLantai: string; // INDOOR / OUTDOOR_BALKON / OUTDOOR_ROOFTOP / OUTDOOR_TAMAN / OUTDOOR_TERAS
  mejas: MejaConfig[];
}

export const getFloorTheme = (tipe: string) => {
  switch (tipe) {
    case "OUTDOOR_BALKON":
      return {
        gridColor: "rgba(245, 158, 11, 0.08)", // amber
        borderColor: "border-amber-200",
        headerBg: "bg-amber-50/20",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Outdoor (Balkon)",
        canvasBg: "bg-amber-50/10",
        dotColor: "rgba(245, 158, 11, 0.12)",
        tableStyle: "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-600 shadow-md shadow-amber-200/50 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-700 ring-4 ring-orange-100 z-10 font-extrabold scale-110",
        gridLineStyle: "linear-gradient(rgba(245, 158, 11, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR_ROOFTOP":
      return {
        gridColor: "rgba(249, 115, 22, 0.08)", // orange
        borderColor: "border-orange-200",
        headerBg: "bg-orange-50/20",
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Outdoor (Rooftop)",
        canvasBg: "bg-orange-50/10",
        dotColor: "rgba(249, 115, 22, 0.12)",
        tableStyle: "bg-gradient-to-br from-orange-400 to-orange-600 text-white border-orange-600 shadow-md shadow-orange-200/50 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-gradient-to-br from-red-500 to-red-600 text-white border-red-700 ring-4 ring-red-100 z-10 font-extrabold scale-110",
        gridLineStyle: "linear-gradient(rgba(249, 115, 22, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR_TAMAN":
      return {
        gridColor: "rgba(16, 185, 129, 0.08)", // emerald
        borderColor: "border-emerald-250",
        headerBg: "bg-emerald-50/20",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Outdoor (Taman)",
        canvasBg: "bg-emerald-50/10",
        dotColor: "rgba(16, 185, 129, 0.12)",
        tableStyle: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200/50 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-gradient-to-br from-teal-500 to-teal-600 text-white border-teal-700 ring-4 ring-teal-100 z-10 font-extrabold scale-110",
        gridLineStyle: "linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR_TERAS":
      return {
        gridColor: "rgba(20, 184, 166, 0.08)", // teal
        borderColor: "border-teal-250",
        headerBg: "bg-teal-50/20",
        badge: "bg-teal-50 text-teal-700 border-teal-200",
        label: "Outdoor (Teras)",
        canvasBg: "bg-teal-50/10",
        dotColor: "rgba(20, 184, 166, 0.12)",
        tableStyle: "bg-gradient-to-br from-teal-400 to-teal-600 text-white border-teal-600 shadow-md shadow-teal-200/50 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-700 ring-4 ring-emerald-100 z-10 font-extrabold scale-110",
        gridLineStyle: "linear-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.08) 1px, transparent 1px)"
      };
    case "INDOOR":
    default:
      return {
        gridColor: "rgba(59, 130, 246, 0.05)", // blue
        borderColor: "border-blue-200",
        headerBg: "bg-slate-50",
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        label: "Indoor",
        canvasBg: "bg-slate-50",
        dotColor: "rgba(59, 130, 246, 0.05)",
        tableStyle: "bg-white text-blue-700 border-blue-600 hover:border-orange-500 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-orange-500 text-white border-orange-600 ring-4 ring-orange-100 z-10 font-extrabold scale-110",
        gridLineStyle: "linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)"
      };
  }
};

export const TOP_20_KAMPUS = [
  { id: "KMP-TELU-01", label: "Telkom University (Tel-U)", city: "Bandung", lat: -6.9731, lng: 107.6306 },
  { id: "KMP-UI-02", label: "Universitas Indonesia (UI)", city: "Depok", lat: -6.3606, lng: 106.8272 },
  { id: "KMP-UGM-03", label: "Universitas Gadjah Mada (UGM)", city: "Yogyakarta", lat: -7.7681, lng: 110.3786 },
  { id: "KMP-ITB-04", label: "Institut Teknologi Bandung (ITB)", city: "Bandung", lat: -6.8915, lng: 107.6106 },
  { id: "KMP-IPB-05", label: "IPB University (IPB)", city: "Bogor", lat: -6.5562, lng: 106.7243 },
  { id: "KMP-UNAIR-06", label: "Universitas Airlangga (UNAIR)", city: "Surabaya", lat: -7.2676, lng: 112.7844 },
  { id: "KMP-ITS-07", label: "Institut Teknologi Sepuluh Nopember (ITS)", city: "Surabaya", lat: -7.2824, lng: 112.7949 },
  { id: "KMP-UNPAD-08", label: "Universitas Padjadjaran (UNPAD)", city: "Sumedang", lat: -6.9265, lng: 107.7744 },
  { id: "KMP-UNDIP-09", label: "Universitas Diponegoro (UNDIP)", city: "Semarang", lat: -7.0494, lng: 110.4392 },
  { id: "KMP-UB-10", label: "Universitas Brawijaya (UB)", city: "Malang", lat: -7.9526, lng: 112.6144 },
  { id: "KMP-UNHAS-11", label: "Universitas Hasanuddin (UNHAS)", city: "Makassar", lat: -5.1328, lng: 119.4883 },
  { id: "KMP-UNS-12", label: "Universitas Sebelas Maret (UNS)", city: "Surakarta", lat: -7.5587, lng: 110.8569 },
  { id: "KMP-UPI-13", label: "Universitas Pendidikan Indonesia (UPI)", city: "Bandung", lat: -6.8610, lng: 107.5946 },
  { id: "KMP-USU-14", label: "Universitas Sumatera Utara (USU)", city: "Medan", lat: 3.5649, lng: 98.6560 },
  { id: "KMP-USK-15", label: "Universitas Syiah Kuala (USK)", city: "Aceh", lat: 5.5702, lng: 95.3695 },
  { id: "KMP-UNAND-16", label: "Universitas Andalas (UNAND)", city: "Padang", lat: -0.9141, lng: 100.4619 },
  { id: "KMP-UNSRI-17", label: "Universitas Sriwijaya (UNSRI)", city: "Palembang", lat: -3.2185, lng: 104.6506 },
  { id: "KMP-UNY-18", label: "Universitas Negeri Yogyakarta (UNY)", city: "Yogyakarta", lat: -7.7736, lng: 110.3868 },
  { id: "KMP-BINUS-19", label: "Universitas Bina Nusantara (BINUS)", city: "Jakarta", lat: -6.2241, lng: 106.7826 },
  { id: "KMP-UMY-20", label: "Universitas Muhammadiyah Yogyakarta (UMY)", city: "Yogyakarta", lat: -7.8118, lng: 110.3218 }
];

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

  const [campusSearch, setCampusSearch] = useState("");
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);

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
      id: "f1",
      namaLantai: "Lantai 1", 
      tipeLantai: "INDOOR",
      mejas: [
        { id: "m1", nomorMeja: "Meja 01", kapasitas: 4, x: 20, y: 25, tipeLantai: "INDOOR" },
        { id: "m2", nomorMeja: "Meja 02", kapasitas: 4, x: 50, y: 25, tipeLantai: "INDOOR" },
        { id: "m3", nomorMeja: "Meja 03", kapasitas: 4, x: 80, y: 25, tipeLantai: "INDOOR" },
        { id: "m4", nomorMeja: "Meja 04", kapasitas: 2, x: 35, y: 65, tipeLantai: "INDOOR" },
        { id: "m5", nomorMeja: "Meja 05", kapasitas: 2, x: 65, y: 65, tipeLantai: "INDOOR" },
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
        id: Math.random().toString(36).substring(2, 9),
        namaLantai: `Lantai ${nextIdx}`, 
        tipeLantai: "INDOOR",
        mejas: [
          { id: Math.random().toString(36).substring(2, 9), nomorMeja: "Meja 01", kapasitas: 4, x: 30, y: 40, tipeLantai: "INDOOR" },
          { id: Math.random().toString(36).substring(2, 9), nomorMeja: "Meja 02", kapasitas: 4, x: 70, y: 40, tipeLantai: "INDOOR" }
        ]
      },
    ]);
  };

  const handleHapusLantai = (idx: number) => {
    setLantaiData(lantaiData.filter((_, i) => i !== idx));
  };

  const handleChangeLantaiField = (floorIdx: number, field: "namaLantai" | "tipeLantai", value: string) => {
    setLantaiData(prev => 
      prev.map((f, idx) => {
        if (idx !== floorIdx) return f;
        return { ...f, [field]: value };
      })
    );
  };

  const handleTambahMeja = (floorIdx: number) => {
    const floor = lantaiData[floorIdx];
    const nextNum = floor.mejas.filter(m => m.tipeLantai === floor.tipeLantai).length + 1;
    const nomorMeja = `Meja ${nextNum < 10 ? '0' + nextNum : nextNum}`;
    const newMeja: MejaConfig = {
      id: Math.random().toString(36).substring(2, 9),
      nomorMeja,
      kapasitas: 4,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      tipeLantai: floor.tipeLantai,
    };
    
    setLantaiData(prev => 
      prev.map((f, idx) => {
        if (idx !== floorIdx) return f;
        return {
          ...f,
          mejas: [...f.mejas, newMeja]
        };
      })
    );
    setSelectedTableId(newMeja.id);
  };

  const handleHapusMeja = (floorIdx: number, tableId: string) => {
    setLantaiData(prev => 
      prev.map((f, idx) => {
        if (idx !== floorIdx) return f;
        return {
          ...f,
          mejas: f.mejas.filter(m => m.id !== tableId)
        };
      })
    );
    if (selectedTableId === tableId) setSelectedTableId(null);
  };

  const handleUpdateMeja = (floorIdx: number, tableIdx: number, field: keyof MejaConfig, value: any) => {
    setLantaiData(prev => 
      prev.map((f, idx) => {
        if (idx !== floorIdx) return f;
        return {
          ...f,
          mejas: f.mejas.map((m, mIdx) => {
            if (mIdx !== tableIdx) return m;
            return {
              ...m,
              [field]: value
            };
          })
        };
      })
    );
  };

  // --- HANDLER DRAG & MOVE (MOUSE & TOUCH) ---
  const handleTableDrag = (e: React.MouseEvent, floorIdx: number, tableIdx: number) => {
    e.preventDefault();
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const target = e.currentTarget as HTMLElement;
    setSelectedTableId(lantaiData[floorIdx].mejas[tableIdx].id);

    let finalX = lantaiData[floorIdx].mejas[tableIdx].x;
    let finalY = lantaiData[floorIdx].mejas[tableIdx].y;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      let x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      let y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      // Batasi koordinat antara 2% s.d. 92% agar tidak keluar grid visual
      x = Math.max(2, Math.min(92, x));
      y = Math.max(2, Math.min(90, y));

      // Direct DOM update bypassing React renders for buttery smooth 120fps dragging
      target.style.left = `${x}%`;
      target.style.top = `${y}%`;

      finalX = parseFloat(x.toFixed(1));
      finalY = parseFloat(y.toFixed(1));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setActiveDrag(null);

      // Commit once to React state at the end
      setLantaiData(prev => 
        prev.map((f, idx) => {
          if (idx !== floorIdx) return f;
          return {
            ...f,
            mejas: f.mejas.map((m, mIdx) => {
              if (mIdx !== tableIdx) return m;
              return {
                ...m,
                x: finalX,
                y: finalY
              };
            })
          };
        })
      );
    };

    setActiveDrag({ floorIdx, tableIdx });
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleTableTouch = (e: React.TouchEvent, floorIdx: number, tableIdx: number) => {
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const target = e.currentTarget as HTMLElement;
    setSelectedTableId(lantaiData[floorIdx].mejas[tableIdx].id);

    let finalX = lantaiData[floorIdx].mejas[tableIdx].x;
    let finalY = lantaiData[floorIdx].mejas[tableIdx].y;
    
    const onTouchMove = (moveEvent: TouchEvent) => {
      const touch = moveEvent.touches[0];
      let x = ((touch.clientX - rect.left) / rect.width) * 100;
      let y = ((touch.clientY - rect.top) / rect.height) * 100;

      x = Math.max(2, Math.min(92, x));
      y = Math.max(2, Math.min(90, y));

      // Direct DOM update bypassing React renders for buttery smooth 120fps touch dragging
      target.style.left = `${x}%`;
      target.style.top = `${y}%`;

      finalX = parseFloat(x.toFixed(1));
      finalY = parseFloat(y.toFixed(1));
    };

    const onTouchEnd = () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      setActiveDrag(null);

      // Commit once to React state at the end
      setLantaiData(prev => 
        prev.map((f, idx) => {
          if (idx !== floorIdx) return f;
          return {
            ...f,
            mejas: f.mejas.map((m, mIdx) => {
              if (mIdx !== tableIdx) return m;
              return {
                ...m,
                x: finalX,
                y: finalY
              };
            })
          };
        })
      );
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
        // Group and split floors by tipeLantai to isolate indoor and outdoor tables cleanly in the DB
        lantaiData: lantaiData.flatMap(l => {
          const presentTypes = Array.from(new Set(l.mejas.map(m => m.tipeLantai || "INDOOR")));
          
          if (presentTypes.length === 0) {
            return [{
              namaLantai: l.namaLantai,
              tipeLantai: l.tipeLantai,
              mejas: []
            }];
          }

          return presentTypes.map(t => {
            const groupTables = l.mejas.filter(m => (m.tipeLantai || "INDOOR") === t);
            return {
              namaLantai: l.namaLantai,
              tipeLantai: t,
              mejas: groupTables.map(m => ({
                nomorMeja: m.nomorMeja,
                kapasitas: m.kapasitas,
                x: m.x,
                y: m.y
              }))
            };
          });
        }).filter(l => l.mejas.length > 0),
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Nama Tempat */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nama Tempat *</label>
                <div className="relative flex items-center">
                  <Store className="absolute left-4 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.nama_tempat}
                    onChange={(e) => setFormData({ ...formData, nama_tempat: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition focus:ring-2 focus:ring-orange-100 font-medium text-sm text-gray-800"
                    placeholder="Contoh: Plumeria Cafe"
                    required
                  />
                </div>
              </div>

              {/* Alamat */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Alamat Lengkap *</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-4 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition focus:ring-2 focus:ring-orange-100 font-medium text-sm text-gray-800"
                    placeholder="Jl. Telekomunikasi No. 1, Bojongsoang, Bandung"
                    required
                  />
                </div>
              </div>

              {/* Kategori Tempat (Visual Cards) */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Kategori Tempat *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "Cafe", label: "Kafe", icon: Coffee, activeStyle: "border-amber-500 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100 ring-4 ring-amber-50" },
                    { value: "Warkop", label: "Warkop", icon: Beer, activeStyle: "border-orange-500 bg-orange-50 text-orange-700 shadow-sm shadow-orange-100 ring-4 ring-orange-50" },
                    { value: "Resto", label: "Restoran", icon: Utensils, activeStyle: "border-red-500 bg-red-50 text-red-700 shadow-sm shadow-red-100 ring-4 ring-red-50" },
                    { value: "Coworking", label: "Workspace", icon: Laptop, activeStyle: "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100 ring-4 ring-blue-50" }
                  ].map((cat) => {
                    const isSelected = formData.kategori === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, kategori: cat.value })}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 outline-none hover:scale-105 active:scale-95
                          ${isSelected
                            ? `${cat.activeStyle} font-black`
                            : "border-gray-250 bg-gray-50 text-gray-500 hover:border-gray-355 hover:bg-gray-100/50"
                          }`}
                      >
                        <cat.icon size={22} className={isSelected ? "" : "text-gray-400"} />
                        <span className="text-xs font-bold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kampus Terdekat (Premium Searchable Select / Combobox dengan Leaflet Autopan) */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Kampus Terdekat *</label>
                
                {/* Selector Button */}
                <button
                  type="button"
                  onClick={() => setIsCampusDropdownOpen(!isCampusDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-white transition text-left outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="text-gray-400" size={18} />
                    {formData.id_kampus ? (
                      (() => {
                        const active = TOP_20_KAMPUS.find(c => c.id === formData.id_kampus);
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">{active?.label}</span>
                            <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-100">{active?.city}</span>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">-- Pilih Kampus Terdekat --</span>
                    )}
                  </div>
                  <span className="text-gray-450 text-xs">▼</span>
                </button>

                {/* Dropdown Popover */}
                {isCampusDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* Search Input Box */}
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={campusSearch}
                        onChange={(e) => setCampusSearch(e.target.value)}
                        placeholder="Cari nama kampus atau kota..."
                        className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-orange-500 focus:bg-white outline-none transition"
                        autoFocus
                      />
                      {campusSearch && (
                        <button
                          type="button"
                          onClick={() => setCampusSearch("")}
                          className="absolute right-3 text-gray-400 hover:text-gray-700 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Campuses Scrollable List */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                      {(() => {
                        const filtered = TOP_20_KAMPUS.filter(c => 
                          c.label.toLowerCase().includes(campusSearch.toLowerCase()) ||
                          c.city.toLowerCase().includes(campusSearch.toLowerCase())
                        );

                        if (filtered.length === 0) {
                          return (
                            <p className="text-center text-xs text-gray-400 py-3 italic">Kampus tidak ditemukan.</p>
                          );
                        }

                        return filtered.map(c => {
                          const isSelected = formData.id_kampus === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  id_kampus: c.id,
                                  latitude: c.lat,
                                  longitude: c.lng
                                }));
                                setIsCampusDropdownOpen(false);
                                setCampusSearch("");
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left text-xs font-bold outline-none
                                ${isSelected 
                                  ? "bg-orange-50 border border-orange-100 text-orange-700 font-extrabold" 
                                  : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                                }
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <GraduationCap size={14} className={isSelected ? "text-orange-500" : "text-gray-400"} />
                                <span>{c.label}</span>
                              </div>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                                isSelected 
                                  ? "bg-orange-100/70 border-orange-200 text-orange-800" 
                                  : "bg-gray-50 border-gray-200 text-gray-500"
                              }`}>{c.city}</span>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Kisaran Harga (Visual Pills) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Kisaran Harga</label>
                <div className="flex gap-3">
                  {[
                    { value: "Murah", label: "Rp (Murah)", desc: "< Rp 30rb" },
                    { value: "Sedang", label: "Rp Rp (Sedang)", desc: "Rp 30-70rb" },
                    { value: "Mahal", label: "Rp Rp Rp (Mahal)", desc: "> Rp 70rb" }
                  ].map((price) => {
                    const isSelected = formData.kisaran_harga === price.value;
                    return (
                      <button
                        key={price.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, kisaran_harga: price.value })}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all text-center flex flex-col justify-center items-center outline-none hover:scale-102
                          ${isSelected
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold shadow-sm ring-4 ring-emerald-50"
                            : "border-gray-250 bg-gray-50 text-gray-500 hover:border-gray-355 hover:bg-gray-100/50"
                          }`}
                      >
                        <span className="text-xs font-black">{price.label}</span>
                        <span className="text-[9px] opacity-75 mt-0.5 font-medium">{price.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Waktu Buka */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Waktu Buka *</label>
                <input
                  type="time"
                  value={formData.waktu_buka}
                  onChange={(e) => setFormData({ ...formData, waktu_buka: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition focus:ring-2 focus:ring-orange-100 font-medium text-sm text-gray-800"
                  required
                />
              </div>

              {/* Waktu Tutup */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Waktu Tutup *</label>
                <input
                  type="time"
                  value={formData.waktu_tutup}
                  onChange={(e) => setFormData({ ...formData, waktu_tutup: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition focus:ring-2 focus:ring-orange-100 font-medium text-sm text-gray-800"
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
              {lantaiData.map((lantai, idx) => {
                const theme = getFloorTheme(lantai.tipeLantai);
                return (
                  <div key={lantai.id || `floor-${idx}`} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-4">
                  
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
                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
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
                          onClick={() => {
                            if (!lantai.tipeLantai.startsWith("OUTDOOR")) {
                              handleChangeLantaiField(idx, "tipeLantai", "OUTDOOR_ROOFTOP");
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all w-1/2 sm:w-auto justify-center ${
                            lantai.tipeLantai.startsWith("OUTDOOR")
                              ? "bg-white text-orange-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          <Sun size={14} /> Outdoor
                        </button>
                      </div>

                      {/* Pilihan Sub-tipe Outdoor */}
                      {lantai.tipeLantai.startsWith("OUTDOOR") && (
                        <div className="flex items-center gap-1 bg-amber-50/50 p-0.5 rounded-lg border border-amber-100 w-full sm:w-auto justify-between shadow-sm animate-in slide-in-from-top-1 duration-150">
                          {[
                            { value: "OUTDOOR_BALKON", label: "Balkon" },
                            { value: "OUTDOOR_ROOFTOP", label: "Rooftop" },
                            { value: "OUTDOOR_TAMAN", label: "Taman" },
                            { value: "OUTDOOR_TERAS", label: "Teras" }
                          ].map(sub => (
                            <button
                              key={sub.value}
                              type="button"
                              onClick={() => handleChangeLantaiField(idx, "tipeLantai", sub.value)}
                              className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${
                                lantai.tipeLantai === sub.value
                                  ? "bg-amber-500 text-white shadow-sm"
                                  : "text-amber-750 hover:bg-amber-100/70"
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid Layout Builder */}
                  {(() => {
                    const theme = getFloorTheme(lantai.tipeLantai);
                    return (
                      <div className="relative">
                        <div 
                          className={`w-full h-80 rounded-3xl border-2 relative overflow-hidden select-none cursor-crosshair shadow-inner transition-colors duration-300 ${theme.borderColor} ${theme.canvasBg}`}
                          style={{
                            backgroundImage: theme.gridLineStyle,
                            backgroundSize: "20px 20px"
                          }}
                        >
                          {/* Petunjuk Visual */}
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-extrabold text-gray-500 uppercase tracking-wider border pointer-events-none shadow-sm flex items-center gap-1.5">
                            <Settings size={11} className="animate-spin text-blue-600" />
                            Drag meja ke posisi tata letak asli kafenya
                          </div>

                          {/* Badge Sub-tipe Aktif */}
                          <div className={`absolute top-3 right-3 border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm pointer-events-none ${theme.badge}`}>
                            {theme.label}
                          </div>

                          {/* Reference Pintu Masuk di Sebelah Bawah */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white border-t-2 border-x-2 border-gray-200 rounded-t-2xl px-6 py-2 shadow-md text-[9px] font-black text-slate-500 tracking-widest flex items-center gap-2 select-none z-10 cursor-default hover:bg-slate-50 transition-colors">
                            <span className="text-xs">🚪</span>
                            <span>PINTU MASUK UTAMA / ENTRANCE</span>
                          </div>
                                        {/* Tampilkan meja-meja yang sesuai dengan sub-tipe aktif */}
                          {lantai.mejas.map((meja, mIdx) => {
                            if ((meja.tipeLantai || "INDOOR") !== lantai.tipeLantai) return null;
                            const isSelected = selectedTableId === meja.id;
                            const isDragging = activeDrag?.floorIdx === idx && activeDrag?.tableIdx === mIdx;

                            return (
                              <div
                                key={`canvas-${meja.id}`}
                                onMouseDown={(e) => handleTableDrag(e, idx, mIdx)}
                                onTouchStart={(e) => handleTableTouch(e, idx, mIdx)}
                                style={{ 
                                  left: `${meja.x}%`, 
                                  top: `${meja.y}%`, 
                                  transform: "translate(-50%, -50%)" 
                                }}
                                className={`absolute w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center cursor-move select-none shadow-md ${
                                  isSelected ? theme.tableActiveStyle : theme.tableStyle
                                } ${
                                  isDragging 
                                    ? "opacity-80 border-dashed shadow-2xl cursor-grabbing scale-105 z-20" 
                                    : "transition-all duration-200"
                                }`}
                              >
                                <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{meja.nomorMeja.replace("Meja ", "M")}</span>
                                <span className="text-[9px] opacity-80 mt-0.5 leading-none">👤{meja.kapasitas}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Pengaturan Meja Terpilih & Daftar Meja */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Daftar Meja di {theme.label} {lantai.namaLantai}</h4>
                      <button
                        type="button"
                        onClick={() => handleTambahMeja(idx)}
                        className="flex items-center gap-1 text-xs font-extrabold text-blue-600 bg-white border border-blue-100 hover:border-blue-200 px-3 py-1.5 rounded-xl shadow-sm transition"
                      >
                        <Plus size={14} /> Tambah Meja
                      </button>
                    </div>

                    {lantai.mejas.filter(m => (m.tipeLantai || "INDOOR") === lantai.tipeLantai).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2 italic">Belum ada meja di area ini. Klik 'Tambah Meja' untuk menambahkan.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-52 overflow-y-auto pr-1">
                        {lantai.mejas.map((meja, mIdx) => {
                          if ((meja.tipeLantai || "INDOOR") !== lantai.tipeLantai) return null;
                          const isSelected = selectedTableId === meja.id;
                          return (
                            <div 
                              key={`list-${meja.id}`}
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
                );
              })}
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
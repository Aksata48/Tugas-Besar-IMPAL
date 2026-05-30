"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Store, MapPin, Image as ImageIcon, UtensilsCrossed,
  Plus, Trash2, Save, ArrowLeft, Upload, CheckCircle, Loader2,
  Sun, Home, Sliders, Settings, Coffee, Beer, Utensils, Laptop,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import TempatMap from "@/components/Map";
import { getFloorTheme, TOP_20_KAMPUS } from "../../tambah/page";

interface MejaConfig {
  id: string;
  nomorMeja: string;
  kapasitas: number;
  x: number; // Koordinat X (%) di grid
  y: number; // Koordinat Y (%) di grid
  tipeLantai?: string;
}

interface LantaiConfig {
  id?: string;
  namaLantai: string;
  tipeLantai: string;
  mejas: MejaConfig[];
}

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

  useEffect(() => {
    setPreviewUrl(currentPath || "");
  }, [currentPath]);

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

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setPreviewUrl(data.filePath);
        onUploaded(data.filePath);
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover rounded-xl"
            />
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

const REKOMENDASI_FASILITAS = [
  "WiFi Cepat",
  "AC",
  "Smoking Area",
  "Stopkontak",
  "Parkir Luas",
  "Mushola",
  "Live Music",
  "Area Indoor",
  "Area Outdoor",
  "VIP Room"
];

const parsePriceRange = (rangeStr: string) => {
  if (!rangeStr) return { min: "", max: "" };
  const cleanStr = rangeStr.replace(/Rp/g, "").replace(/\./g, "").trim();
  const parts = cleanStr.split("-");
  if (parts.length === 2) {
    const minVal = parts[0].replace(/\D/g, "");
    const maxVal = parts[1].replace(/\D/g, "");
    if (minVal && maxVal) {
      return { min: minVal, max: maxVal };
    }
  }
  return { min: "", max: "" };
};

const parseMenuItems = (menuText: string | null) => {
  if (!menuText) return [{ name: "", description: "", price: "" }];
  try {
    if (menuText.trim().startsWith("[")) {
      const parsed = JSON.parse(menuText);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          name: item.name || "",
          description: item.description || "",
          price: item.price !== undefined ? String(item.price) : ""
        }));
      }
    }
  } catch (e) {
    console.error("Error parsing menu items:", e);
  }
  return [{ name: "", description: "", price: "" }];
};

export default function EditTempatOwner() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [campusSearch, setCampusSearch] = useState("");
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    nama_tempat: "",
    alamat: "",
    waktu_buka: "",
    waktu_tutup: "",
    kategori: "",
    id_kampus: "",
    latitude: -6.9740,
    longitude: 107.6303,
  });

  const [hargaMin, setHargaMin] = useState("");
  const [hargaMax, setHargaMax] = useState("");
  const [gambarPath, setGambarPath] = useState("");
  const [menuGambarPath, setMenuGambarPath] = useState("");
  const [menuItems, setMenuItems] = useState<Array<{ name: string; description: string; price: string }>>([
    { name: "", description: "", price: "" }
  ]);
  const [fasilitas, setFasilitas] = useState<string[]>([]);
  const [fasInput, setFasInput] = useState("");
  
  const [lantaiData, setLantaiData] = useState<LantaiConfig[]>([]);
  const [activeDrag, setActiveDrag] = useState<{ floorIdx: number; tableIdx: number } | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Load existing data
  useEffect(() => {
    if (!id) return;

    fetch(`/api/tempat/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const t = data.tempat;
          const parsedPrice = parsePriceRange(t.kisaran_harga);
          setHargaMin(parsedPrice.min);
          setHargaMax(parsedPrice.max);

          // Get Category value mapped to cards
          let kategoriValue = "";
          if (Array.isArray(t.kategori) && t.kategori.length > 0) {
            const katName = t.kategori[0]?.kategori?.nama_kategori || "";
            if (katName.toLowerCase().includes("cafe") || katName.toLowerCase().includes("kafe")) kategoriValue = "Cafe";
            else if (katName.toLowerCase().includes("warkop")) kategoriValue = "Warkop";
            else if (katName.toLowerCase().includes("resto")) kategoriValue = "Resto";
            else if (katName.toLowerCase().includes("coworking") || katName.toLowerCase().includes("workspace")) kategoriValue = "Coworking";
            else kategoriValue = katName;
          }

          setFormData({
            nama_tempat: t.nama_tempat,
            alamat: t.alamat,
            waktu_buka: t.waktu_buka || "08:00",
            waktu_tutup: t.waktu_tutup || "22:00",
            kategori: kategoriValue,
            id_kampus: t.id_kampus,
            latitude: t.latitude || -6.9740,
            longitude: t.longitude || 107.6303,
          });

          setGambarPath(t.gambar || "");
          setMenuGambarPath(t.menu_gambar || "");
          setMenuItems(parseMenuItems(t.menu_text));
          
          if (Array.isArray(t.fasilitas)) {
            setFasilitas(t.fasilitas.map((f: any) => f.fasilitas.nama_fasilitas));
          }

          // Build Lantai & Mejas Layout
          const groupedFloors: { [key: string]: LantaiConfig } = {};
          if (Array.isArray(t.mejas)) {
            t.mejas.forEach((meja: any) => {
              const floorName = meja.nama_lantai || "Lantai 1";
              const floorType = meja.tipe_lantai || "INDOOR";
              if (!groupedFloors[floorName]) {
                groupedFloors[floorName] = {
                  id: floorName,
                  namaLantai: floorName,
                  tipeLantai: floorType,
                  mejas: []
                };
              }
              groupedFloors[floorName].mejas.push({
                id: meja.id,
                nomorMeja: meja.nomor_meja,
                kapasitas: meja.kapasitas_kursi,
                x: meja.x || 0,
                y: meja.y || 0,
                tipeLantai: meja.tipe_lantai || "INDOOR"
              });
            });
          }

          const lantaiArray = Object.values(groupedFloors);
          if (lantaiArray.length === 0) {
            setLantaiData([{
              id: "f1",
              namaLantai: "Lantai 1",
              tipeLantai: "INDOOR",
              mejas: []
            }]);
          } else {
            setLantaiData(lantaiArray);
          }
        } else {
          setSubmitError(data.message || "Gagal memuat tempat.");
        }
      })
      .catch(() => setSubmitError("Koneksi gagal saat mengambil data tempat."))
      .finally(() => setIsFetching(false));
  }, [id]);

  // Floor and table management
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
      id: "temp-" + Math.random().toString(36).substring(2, 9), // temp id for client
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

  // Drag mouse and touch functions
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

      x = Math.max(2, Math.min(92, x));
      y = Math.max(2, Math.min(90, y));

      target.style.left = `${x}%`;
      target.style.top = `${y}%`;

      finalX = parseFloat(x.toFixed(1));
      finalY = parseFloat(y.toFixed(1));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setActiveDrag(null);

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

      target.style.left = `${x}%`;
      target.style.top = `${y}%`;

      finalX = parseFloat(x.toFixed(1));
      finalY = parseFloat(y.toFixed(1));
    };

    const onTouchEnd = () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      setActiveDrag(null);

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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.nama_tempat || !formData.alamat || !formData.id_kampus) {
      setSubmitError("Nama Tempat, Alamat, dan Kampus wajib diisi.");
      return;
    }
    if (!formData.waktu_buka || !formData.waktu_tutup) {
      setSubmitError("Waktu Buka dan Waktu Tutup wajib diisi.");
      return;
    }
    if (!hargaMin || !hargaMax) {
      setSubmitError("Harga minimal dan maksimal wajib diisi.");
      return;
    }
    if (Number(hargaMin) > Number(hargaMax)) {
      setSubmitError("Harga minimal tidak boleh lebih besar dari harga maksimal.");
      return;
    }
    const validItems = menuItems.filter(item => item.name.trim() !== "");
    if (validItems.length === 0 && !menuGambarPath) {
      setSubmitError("Informasi menu wajib diisi. Tambahkan minimal 1 item menu atau upload Foto Menu.");
      return;
    }

    setIsLoading(true);

    const jam_buka = `${formData.waktu_buka} - ${formData.waktu_tutup}`;
    const formattedPriceRange = `Rp ${Number(hargaMin).toLocaleString("id-ID")} - Rp ${Number(hargaMax).toLocaleString("id-ID")}`;

    try {
      const payload = {
        nama_tempat: formData.nama_tempat,
        alamat: formData.alamat,
        jam_buka,
        kisaran_harga: formattedPriceRange,
        id_kampus: formData.id_kampus,
        latitude: formData.latitude,
        longitude: formData.longitude,
        gambar: gambarPath || null,
        menu_text: validItems.length > 0 ? JSON.stringify(validItems.map(item => ({
          name: item.name.trim(),
          description: item.description.trim(),
          price: Number(item.price) || 0
        }))) : null,
        menu_gambar: menuGambarPath || null,
        kategori: formData.kategori,
        fasilitas: fasilitas,
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
                id: m.id,
                nomorMeja: m.nomorMeja,
                kapasitas: m.kapasitas,
                x: m.x,
                y: m.y
              }))
            };
          });
        }).filter(l => l.mejas.length > 0),
      };

      const res = await fetch(`/api/tempat/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        setTimeout(() => router.push("/owner/dashboard"), 1500);
      } else {
        setSubmitError(data.message || "Gagal mengupdate tempat. Coba lagi.");
      }
    } catch {
      setSubmitError("Koneksi bermasalah. Pastikan server berjalan.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Memuat Data Tempat...</p>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tempat Berhasil Diperbarui!</h2>
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Tempat</h1>
            <p className="text-gray-500 text-sm">Ubah detail tempat nongkrong Anda di bawah ini.</p>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
            ⚠️ {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* CARD 1: Informasi Dasar */}
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

              {/* Kampus Terdekat Combobox */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Kampus Terdekat *</label>
                
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

                {isCampusDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
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

              {/* Kisaran Harga */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Kisaran Harga *</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-extrabold">Rp</span>
                    <input
                      type="number"
                      value={hargaMin}
                      onChange={(e) => setHargaMin(e.target.value)}
                      placeholder="Min (cth: 15000)"
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition focus:ring-2 focus:ring-orange-100 font-semibold text-xs text-gray-800 shadow-sm"
                      required
                    />
                  </div>
                  <span className="text-gray-400 text-xs font-bold">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-extrabold">Rp</span>
                    <input
                      type="number"
                      value={hargaMax}
                      onChange={(e) => setHargaMax(e.target.value)}
                      placeholder="Max (cth: 50000)"
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition focus:ring-2 focus:ring-orange-100 font-semibold text-xs text-gray-800 shadow-sm"
                      required
                    />
                  </div>
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

          {/* CARD 2: Foto Tempat */}
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
          </div>

          {/* CARD 2.5: Fasilitas Tempat */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-5 border-b pb-3">
              <span className="text-lg">🛠️</span>
              <h2 className="text-lg font-bold text-gray-800">Fasilitas Tempat</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fasInput}
                    onChange={(e) => setFasInput(e.target.value)}
                    placeholder="Ketik nama fasilitas (cth: WiFi Cepat) lalu tekan Enter..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition text-xs font-semibold"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = fasInput.trim();
                        if (trimmed) {
                          if (!fasilitas.includes(trimmed)) {
                            setFasilitas([...fasilitas, trimmed]);
                          }
                          setFasInput("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = fasInput.trim();
                      if (trimmed) {
                        if (!fasilitas.includes(trimmed)) {
                          setFasilitas([...fasilitas, trimmed]);
                        }
                        setFasInput("");
                      }
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Tambah
                  </button>
                </div>

                {REKOMENDASI_FASILITAS.filter(f => !fasilitas.includes(f)).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Rekomendasi Pilihan:</span>
                    {REKOMENDASI_FASILITAS.filter(f => !fasilitas.includes(f)).map((f, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFasilitas([...fasilitas, f])}
                        className="bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-gray-200 text-gray-600 font-semibold text-[10px] px-2.5 py-1 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1"
                      >
                        <span className="text-[11px] font-bold text-blue-500">+</span>
                        <span>{f}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {fasilitas.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {fasilitas.map((fasName, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-sm"
                    >
                      <span>✨ {fasName}</span>
                      <button
                        type="button"
                        onClick={() => setFasilitas(fasilitas.filter(x => x !== fasName))}
                        className="text-blue-400 hover:text-red-500 transition-colors font-extrabold text-[10px] pl-0.5 outline-none"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Belum ada fasilitas yang ditambahkan.</p>
              )}
            </div>
          </div>

          {/* CARD 3: Informasi Menu */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-5 border-b pb-3">
              <UtensilsCrossed className="text-purple-500" />
              <h2 className="text-lg font-bold text-gray-800">Informasi Menu</h2>
              <span className="text-xs text-red-500 font-bold ml-1">(wajib salah satu)</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Daftar Menu Andalan *</label>
                <div className="space-y-3">
                  {menuItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm relative group">
                      
                      <div className="w-full sm:flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-gray-405 uppercase">Nama Menu *</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...menuItems];
                            newItems[idx].name = e.target.value;
                            setMenuItems(newItems);
                          }}
                          placeholder="Kopi Susu Gula Aren"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-purple-500 focus:ring-1 focus:ring-purple-100 outline-none"
                          required
                        />
                      </div>

                      <div className="w-full sm:flex-[2] space-y-1">
                        <label className="text-[10px] font-bold text-gray-450 uppercase">Keterangan / Deskripsi</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...menuItems];
                            newItems[idx].description = e.target.value;
                            setMenuItems(newItems);
                          }}
                          placeholder="Kopi espresso dengan susu segar & gula aren murni"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-purple-500 focus:ring-1 focus:ring-purple-100 outline-none"
                        />
                      </div>

                      <div className="w-full sm:w-36 space-y-1">
                        <label className="text-[10px] font-bold text-gray-450 uppercase">Harga (Rp) *</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">Rp</span>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const newItems = [...menuItems];
                              newItems[idx].price = e.target.value;
                              setMenuItems(newItems);
                            }}
                            placeholder="22000"
                            className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-purple-500 focus:ring-1 focus:ring-purple-100 outline-none"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (menuItems.length > 1) {
                            setMenuItems(menuItems.filter((_, i) => i !== idx));
                          } else {
                            setMenuItems([{ name: "", description: "", price: "" }]);
                          }
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition self-end sm:self-center mt-2 sm:mt-4"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setMenuItems([...menuItems, { name: "", description: "", price: "" }])}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2.5 rounded-xl shadow-sm transition"
                >
                  <Plus size={14} /> Tambah Item Menu
                </button>
              </div>

              <div className="border-t pt-4">
                <ImageUploader
                  label="Foto Menu (Opsional jika sudah ada deskripsi teks)"
                  hint="Upload foto daftar menu atau menu board."
                  onUploaded={(path) => setMenuGambarPath(path)}
                  currentPath={menuGambarPath}
                />
              </div>
            </div>
          </div>

          {/* CARD 4: Layout Lantai & Meja */}
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
              Posisikan meja cafe Anda secara visual sesuai tata letak asli kafenya. Pelanggan akan memilih meja secara interaktif berdasarkan posisi meja yang Anda edit di bawah ini.
            </p>

            <div className="space-y-8">
              {lantaiData.map((lantai, idx) => {
                const theme = getFloorTheme(lantai.tipeLantai);
                return (
                  <div key={lantai.id || `floor-${idx}`} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-4">
                  
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
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

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

                  <div className="relative">
                    <div 
                      className={`w-full h-80 rounded-3xl border-2 relative overflow-hidden select-none cursor-crosshair shadow-inner transition-colors duration-300 ${theme.borderColor} ${theme.canvasBg}`}
                      style={{
                        backgroundImage: theme.gridLineStyle,
                        backgroundSize: "20px 20px"
                      }}
                    >
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-extrabold text-gray-500 uppercase tracking-wider border pointer-events-none shadow-sm flex items-center gap-1.5">
                        <Settings size={11} className="animate-spin text-blue-600" />
                        Drag meja ke posisi tata letak asli kafenya
                      </div>

                      <div className={`absolute top-3 right-3 border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm pointer-events-none ${theme.badge}`}>
                        {theme.label}
                      </div>

                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white border-t-2 border-x-2 border-gray-200 rounded-t-2xl px-6 py-2 shadow-md text-[9px] font-black text-slate-500 tracking-widest flex items-center gap-2 select-none z-10 cursor-default hover:bg-slate-50 transition-colors">
                        <span className="text-xs">🚪</span>
                        <span>PINTU MASUK UTAMA / ENTRANCE</span>
                      </div>

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

          {/* Submit Button */}
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
                <Save size={20} /> Simpan Perubahan Tempat
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

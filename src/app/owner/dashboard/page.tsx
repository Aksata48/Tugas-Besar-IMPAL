"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store, PlusCircle, MapPin, Edit, Trash2, LogOut,
  X, Clock, Phone, CalendarCheck, CheckCircle, XCircle, AlertCircle, Wallet, ArrowLeft, Plus,
  Coffee, Beer, Utensils, Laptop, GraduationCap, Image as ImageIcon, Upload, Loader2, CheckCircle as CheckCircleIcon
} from "lucide-react";
import { TOP_20_KAMPUS } from "./tambah/page";

// ===== 1. IMPORT RECHARTS UNTUK GRAFIK =====
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import TempatMap from "@/components/Map";


// ===== TIPE DATA =====
interface Tempat {
  id_tempat: string;
  nama_tempat: string;
  alamat: string;
  jam_buka: string;
  kisaran_harga: string;
  jumlah_meja?: string | number;
  jumlah_lantai?: string | number;
  id_kampus: string;
  gambar?: string;
  menu_text?: string;
  menu_gambar?: string;
  fasilitas?: Array<{
    id_tempat: string;
    id_fasilitas: string;
    fasilitas: { id_fasilitas: string; nama_fasilitas: string };
  }>;
  kategori?: Array<{
    id_tempat: string;
    id_kategori: string;
    kategori: { id_kategori: string; nama_kategori: string };
  }>;

  latitude?: number;
  longitude?: number;
}

interface Booking {
  id: string;
  nama: string;
  tanggal: string;
  jam: string;
  nomor: string;
  status: "pending" | "pending_payment" | "accepted" | "rejected";
  tempat?: { id_tempat?: string; nama_tempat: string };
  total_harga?: number;
  dp_harga?: number;
  catatan?: string;
}

const FORM_KOSONG = {
  nama_tempat: "",
  alamat: "",
  jam_buka: "",
  kisaran_harga: "",
  jumlah_meja: "" as string | number,
  jumlah_lantai: "" as string | number,
  id_kampus: "",
  gambar: "",
  kategori: "",
  waktu_buka: "",
  waktu_tutup: "",
};

const parsePriceRange = (rangeStr: string) => {
  if (!rangeStr) return { min: "", max: "" };
  
  // Clean dots, spaces, currency, and extract two numbers separated by "-"
  const cleanStr = rangeStr.replace(/Rp/g, "").replace(/\./g, "").trim();
  const parts = cleanStr.split("-");
  if (parts.length === 2) {
    const minVal = parts[0].replace(/\D/g, "");
    const maxVal = parts[1].replace(/\D/g, "");
    if (minVal && maxVal) {
      return { min: minVal, max: maxVal };
    }
  }
  
  const numbers = rangeStr.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    return { min: numbers[0], max: numbers[1] };
  }
  
  return { min: "", max: "" };
};

const parseMenuItems = (menuStr?: string) => {
  if (!menuStr) return [{ name: "", description: "", price: "" }];
  
  if (menuStr.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(menuStr);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          name: item.name || "",
          description: item.description || "",
          price: (item.price || "").toString()
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  const lines = menuStr.split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  if (lines.length > 0) {
    return lines.map(line => ({
      name: line,
      description: "",
      price: ""
    }));
  }
  
  return [{ name: "", description: "", price: "" }];
};

// ===== 2. CONTOH DATA HARIAN UNTUK GRAFIK =====
const dataKeuangan = [
  { tgl: '01 Mei', pemasukan: 400000, pengeluaran: 200000, booking: 5 },
  { tgl: '02 Mei', pemasukan: 300000, pengeluaran: 250000, booking: 3 },
  { tgl: '03 Mei', pemasukan: 600000, pengeluaran: 300000, booking: 8 },
  { tgl: '04 Mei', pemasukan: 800000, pengeluaran: 400000, booking: 12 },
  { tgl: '05 Mei', pemasukan: 500000, pengeluaran: 200000, booking: 7 },
];

export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State Navigasi & Pilihan Tempat untuk Grafik
  const [activeNav, setActiveNav] = useState<"daftar" | "tambah" | "booking" | "statistik">("daftar");
  const [selectedTempatForStats, setSelectedTempatForStats] = useState<Tempat | null>(null);

  // State Tempat
  const [tempatList, setTempatList] = useState<Tempat[]>([]);
  const [loadingTempat, setLoadingTempat] = useState(false);
  const [modalTambah, setModalTambah] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [tempatDipilih, setTempatDipilih] = useState<Tempat | null>(null);
  const [form, setForm] = useState(FORM_KOSONG);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [position, setPosition] = useState({
  lat: -6.9175,
  lng: 107.6191,
});

  const [hargaMin, setHargaMin] = useState("");
  const [hargaMax, setHargaMax] = useState("");
  const [menuItems, setMenuItems] = useState<Array<{ name: string; description: string; price: string }>>([
    { name: "", description: "", price: "" }
  ]);
  const [fasilitas, setFasilitas] = useState<string[]>([]);
  const [campusSearch, setCampusSearch] = useState("");
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);

  // State Booking
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"semua" | "pending" | "pending_payment" | "accepted" | "rejected">("semua");

  // =====================================================
  // ROLE-BASED GUARD:
  //   Jika tidak login → redirect ke /login
  //   Jika bukan OWNER (role USER biasa) → redirect ke /
  // =====================================================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(savedUser);
    if (parsed?.role !== "OWNER") {
      // User biasa tidak boleh mengakses halaman owner
      router.replace("/");
      return;
    }
    setUser(parsed);
  }, [router]);

  useEffect(() => {
    if (activeNav === "daftar") fetchTempat();
    if (activeNav === "booking") fetchBookings();
  }, [activeNav]);

  // Fetch tempat dari database
  const fetchTempat = async () => {
    setLoadingTempat(true);
    try {
      const response = await fetch('/api/tempat');
      if (!response.ok) return;
      const text = await response.text();
      if (!text) return;
      const data = JSON.parse(text);
      if (data.success) setTempatList(data.tempat);
    } catch (error) {
      console.error("Error fetching tempat:", error);
    } finally {
      setLoadingTempat(false);
    }
  };

  // Fetch booking dari database
  const fetchBookings = async () => {
    setLoadingBooking(true);
    try {
      const res = await fetch("/api/booking");
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBooking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "jumlah_meja" || name === "jumlah_lantai"
          ? value === "" ? "" : Number(value)
          : value,
    }));
  };

  // TAMBAH — tombol di sidebar sekarang mengarah ke halaman /owner/dashboard/tambah
  const handleNavTambah = () => {
    router.push("/owner/dashboard/tambah");
  };

  const bukaModalTambah = () => {
    setForm(FORM_KOSONG);
    setModalTambah(true);
  };

  const handleTambah = async () => {
    if (!form.nama_tempat || !form.alamat) return alert("Nama dan alamat wajib diisi!");
    setLoadingSubmit(true);
    try {
      const res = await fetch("/api/tempat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: position.lat,
          longitude: position.lng,
        }),      
      });
      const data = await res.json();
      if (data.success) {
        setTempatList((prev) => [...prev, data.tempat]);
        setModalTambah(false);
        setActiveNav("daftar");
      } else {
        alert(data.message || "Gagal menambah tempat");
      }
    } catch (e) {
      alert("Terjadi error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // EDIT
  const bukaModalEdit = (tempat: Tempat) => {
    setTempatDipilih(tempat);

    const parsedPrice = parsePriceRange(tempat.kisaran_harga);
    setHargaMin(parsedPrice.min);
    setHargaMax(parsedPrice.max);

    setMenuItems(parseMenuItems(tempat.menu_text));

    // Ambil fasilitas terpilih jika ada
    if (Array.isArray(tempat.fasilitas)) {
      setFasilitas(tempat.fasilitas.map((f: any) => f.fasilitas.nama_fasilitas));
    } else {
      setFasilitas([]);
    }

    // Ambil kategori terpilih jika ada
    let kategoriValue = "";
    if (Array.isArray(tempat.kategori) && tempat.kategori.length > 0) {
      const katName = tempat.kategori[0]?.kategori?.nama_kategori || "";
      if (katName.toLowerCase().includes("cafe") || katName.toLowerCase().includes("kafe")) kategoriValue = "Cafe";
      else if (katName.toLowerCase().includes("warkop")) kategoriValue = "Warkop";
      else if (katName.toLowerCase().includes("resto")) kategoriValue = "Resto";
      else if (katName.toLowerCase().includes("coworking") || katName.toLowerCase().includes("workspace")) kategoriValue = "Coworking";
      else kategoriValue = katName;
    }

    // Parse jam_buka "08:00 - 22:00" ke waktu_buka dan waktu_tutup
    let wBuka = "";
    let wTutup = "";
    if (tempat.jam_buka && tempat.jam_buka.includes("-")) {
      const parts = tempat.jam_buka.split("-");
      wBuka = parts[0]?.trim() || "";
      wTutup = parts[1]?.trim() || "";
    }

    setForm({
      nama_tempat: tempat.nama_tempat,
      alamat: tempat.alamat,
      jam_buka: tempat.jam_buka,
      kisaran_harga: tempat.kisaran_harga,
      jumlah_meja: tempat.jumlah_meja || "",
      jumlah_lantai: tempat.jumlah_lantai || "",
      id_kampus: tempat.id_kampus || "",
      gambar: tempat.gambar || "",
      kategori: kategoriValue,
      waktu_buka: wBuka,
      waktu_tutup: wTutup,
    });

    setPosition({
      lat: tempat.latitude || -6.9175,
      lng: tempat.longitude || 107.6191,
    });

    setCampusSearch("");
    setIsCampusDropdownOpen(false);
    setModalEdit(true);
  };

  const handleEdit = async () => {
    if (!form.nama_tempat || !form.alamat) return alert("Nama dan alamat wajib diisi!");
    if (!hargaMin || !hargaMax) return alert("Harga minimal dan maksimal wajib diisi!");
    if (Number(hargaMin) > Number(hargaMax)) return alert("Harga minimal tidak boleh lebih besar dari harga maksimal!");

    const formattedPriceRange = `Rp ${Number(hargaMin).toLocaleString("id-ID")} - Rp ${Number(hargaMax).toLocaleString("id-ID")}`;

    const validItems = menuItems.filter(item => item.name.trim() !== "");
    const formattedMenuText = validItems.length > 0 ? JSON.stringify(validItems.map(item => ({
      name: item.name.trim(),
      description: item.description.trim(),
      price: Number(item.price) || 0
    }))) : "";

    setLoadingSubmit(true);
    try {
      const res = await fetch("/api/tempat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tempat: tempatDipilih?.id_tempat,
          nama_tempat: form.nama_tempat,
          alamat: form.alamat,
          jam_buka: form.waktu_buka && form.waktu_tutup ? `${form.waktu_buka} - ${form.waktu_tutup}` : form.jam_buka,
          kisaran_harga: formattedPriceRange,
          menu_text: formattedMenuText || null,
          fasilitas: fasilitas,
          kategori: form.kategori,
          gambar: form.gambar,
          id_kampus: form.id_kampus,
          latitude: position.lat,
          longitude: position.lng,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTempatList((prev) =>
          prev.map((t) => (t.id_tempat === tempatDipilih?.id_tempat ? data.tempat : t))
        );
        setModalEdit(false);
      } else {
        alert(data.message || "Gagal mengedit tempat");
      }
    } catch (e) {
      alert("Terjadi error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // HAPUS
  const handleHapus = async () => {
    setLoadingSubmit(true);
    try {
      const res = await fetch("/api/tempat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tempat: tempatDipilih?.id_tempat }),
      });
      const data = await res.json();
      if (data.success) {
        setTempatList((prev) => prev.filter((t) => t.id_tempat !== tempatDipilih?.id_tempat));
        setModalHapus(false);
      } else {
        alert(data.message || "Gagal menghapus tempat");
      }
    } catch (e) {
      alert("Terjadi error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // UPDATE STATUS BOOKING
  const handleUpdateStatus = async (id: string, status: "accepted" | "rejected" | "pending_payment") => {
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const bookingFiltered = filterStatus === "semua"
    ? bookings
    : bookings.filter((b) => b.status === filterStatus);

  const badgeCount = bookings.filter((b) => b.status === "pending").length;

  if (!user) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 px-6 py-8 flex flex-col">


        <nav className="flex flex-col gap-2 flex-grow">
          <button
            onClick={() => setActiveNav("daftar")}
            className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition ${activeNav === "daftar" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
          >
            <Store size={20} /> Tempat Saya
          </button>
          {/* Tombol Tambah Tempat → mengarah ke halaman /owner/dashboard/tambah */}
          <button
            onClick={handleNavTambah}
            className="flex items-center gap-3 px-4 py-3 font-semibold rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            <PlusCircle size={20} /> Tambah Tempat
          </button>
          <button
            onClick={() => setActiveNav("booking")}
            className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition relative ${activeNav === "booking" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
          >
            <CalendarCheck size={20} /> Kelola Booking
            {badgeCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {badgeCount}
              </span>
            )}
          </button>
          
          <button onClick={() => { setSelectedTempatForStats(null); setActiveNav("statistik"); }}
            className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition ${activeNav === "statistik" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
          >
            <Wallet size={20} /> Laporan Keuangan
          </button>
        </nav>
        <nav>
        <div className="mt-auto pt-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 font-semibold rounded-lg text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={20} /> Keluar
          </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">

        {/* TAB: DAFTAR TEMPAT */}
        {activeNav === "daftar" && (
          <>
            <header className="mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-800">Halo, {user.username}! 👋</h2>
                <p className="text-gray-500 mt-2">Pilih tempat untuk melihat statistik atau kelola data tempat Anda.</p>
              </div>
            </header>

            {/* SEARCH */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari tempat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 outline-none"
            />
          </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                Tempat yang Anda Kelola
                <span className="ml-2 text-sm font-normal text-gray-400">({tempatList.length} tempat)</span>
              </h3>

              {loadingTempat ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Memuat data tempat...</p>
                </div>
              ) : tempatList.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Store size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="font-semibold">Belum ada tempat yang ditambahkan.</p>
                  <button onClick={handleNavTambah} className="mt-4 text-orange-600 font-bold hover:underline text-sm">
                    + Tambah sekarang
                  </button>
                </div>
                
              ) : (
              
                <div className="grid gap-4">
{tempatList
  .filter((tempat) =>
    tempat.nama_tempat.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .map((tempat) => (
  <div 
    key={tempat.id_tempat} 
    onClick={() => {
      setSelectedTempatForStats(tempat);
      setActiveNav("statistik");
    }}
    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50/50 cursor-pointer transition group bg-white shadow-sm"
  >
    <div className="flex gap-4 items-center flex-1">

  <img
  src={
    tempat.gambar?.trim() ||
    "https://via.placeholder.com/120x90?text=No+Image"
  }
  alt={tempat.nama_tempat}
  onError={(e) => {
    e.currentTarget.src =
      "https://via.placeholder.com/120x90?text=No+Image";
  }}
  className="w-28 h-24 object-cover rounded-xl border"
/>

  <div className="flex-1">
    <h4 className="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition">
      {tempat.nama_tempat}
    </h4>

    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
      <span className="flex items-center text-gray-500 text-sm gap-1">
        <MapPin size={14} /> {tempat.alamat}
      </span>

      <span className="flex items-center text-gray-500 text-sm gap-1">
        <Wallet size={14} /> {tempat.kisaran_harga || "Harga belum diatur"}
      </span>
    </div>
  </div>
</div>

    {/* Tombol aksi diproteksi e.stopPropagation() agar klik tidak tembus ke card */}
    <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => router.push(`/owner/dashboard/edit/${tempat.id_tempat}`)} 
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
      >
        <Edit size={18} />
      </button>
      <button 
        onClick={() => { setTempatDipilih(tempat); setModalHapus(true); }} 
        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
))}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: KELOLA BOOKING */}
        {activeNav === "booking" && (
          <>
            <header className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-800">Kelola Booking 📋</h2>
              <p className="text-gray-500 mt-2">Terima atau tolak permintaan booking dari pelanggan.</p>
            </header>

            <div className="flex gap-2 mb-6 flex-wrap">
              {(["semua", "pending", "pending_payment", "accepted", "rejected"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${filterStatus === s ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"}`}
                >
                  {s === "semua" ? "Semua" : s === "pending" ? "Menunggu" : s === "pending_payment" ? "Menunggu DP" : s === "accepted" ? "Diterima" : "Ditolak"}
                  {s === "pending" && badgeCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{badgeCount}</span>
                  )}
                </button>
              ))}
              <button onClick={fetchBookings} className="ml-auto px-4 py-1.5 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:border-orange-300 transition">
                🔄 Refresh
              </button>
            </div>
            <div className="mb-4 flex gap-3">
              <input
                type="text"
                placeholder="Cari nama tempat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 outline-none"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {loadingBooking ? (
                <div className="text-center py-16 text-gray-400 animate-pulse">Memuat data booking...</div>
              ) : bookingFiltered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <CalendarCheck size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="font-semibold">Tidak ada booking{filterStatus !== "semua" ? " dengan status ini" : ""}.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookingFiltered.map((booking) => (
                    <div key={booking.id} className={`p-4 border rounded-xl transition ${booking.status === "pending" ? "border-yellow-200 bg-yellow-50" : booking.status === "pending_payment" ? "border-orange-200 bg-orange-50" : booking.status === "accepted" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800 text-lg">{booking.nama}</h4>
                            <StatusBadge status={booking.status} />
                          </div>
                          {booking.tempat && (
                            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                              <MapPin size={13} /> {booking.tempat.nama_tempat}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span>📅 {new Date(booking.tanggal).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                            <span>🕒 {booking.jam}</span>
                            <span>📞 {booking.nomor}</span>
                          </div>
                        </div>
                        {booking.status === "pending" && (
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleUpdateStatus(booking.id, "pending_payment")} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition">
                              <CheckCircle size={16} /> Acc & Minta DP
                            </button>
                            <button onClick={() => handleUpdateStatus(booking.id, "rejected")} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition">
                              <XCircle size={16} /> Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: STATISTIK KEUANGAN */}
        {activeNav === "statistik" && (() => {
          // Filter bookings based on selected tempat if any
          const filteredBookings = bookings.filter((b) => {
            if (!selectedTempatForStats) return true;
            return b.tempat?.id_tempat === selectedTempatForStats.id_tempat;
          });

          // Only consider accepted or pending_payment bookings as incoming finance
          const successfulBookings = filteredBookings.filter(
            (b) => b.status === "accepted" || b.status === "pending_payment"
          );

          // Helper to get real total price from total_harga, or parse from catatan text, or fallback to dp_harga * 2
          const getRealTotalHarga = (b: Booking) => {
            if (b.total_harga && b.total_harga > 0) return b.total_harga;
            if (b.catatan) {
              const match = b.catatan.match(/Total Menu:\s*Rp\s*([\d,.]+)/i);
              if (match) {
                const cleanVal = match[1].replace(/[\.,]/g, "");
                const parsed = parseInt(cleanVal);
                if (!isNaN(parsed)) return parsed;
              }
            }
            return (b.dp_harga || 10000) * 2;
          };

          // Sum of pre-order total amount and DP amount
          const totalOrderValue = successfulBookings.reduce((sum, b) => sum + getRealTotalHarga(b), 0);
          const totalDpReceived = successfulBookings.reduce((sum, b) => sum + (b.dp_harga || 0), 0);
          
          // Cost of goods sold (COGS) & operation is estimated at 35% of total order value
          const estimatedExpenses = Math.round(totalOrderValue * 0.35);
          const netProfit = totalOrderValue - estimatedExpenses;

          // Process harian untuk chart
          const dailyMap: { [key: string]: { pemasukan: number; pengeluaran: number; booking: number } } = {};
          
          successfulBookings.forEach((b) => {
            if (!b.tanggal) return;
            const dateObj = new Date(b.tanggal);
            const dateStr = dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
            const amount = getRealTotalHarga(b);
            const expense = Math.round(amount * 0.35);
            
            if (!dailyMap[dateStr]) {
              dailyMap[dateStr] = { pemasukan: 0, pengeluaran: 0, booking: 0 };
            }
            dailyMap[dateStr].pemasukan += amount;
            dailyMap[dateStr].pengeluaran += expense;
            dailyMap[dateStr].booking += 1;
          });

          let chartData = Object.entries(dailyMap).map(([tgl, val]) => ({
            tgl,
            pemasukan: val.pemasukan,
            pengeluaran: val.pengeluaran,
            booking: val.booking,
          }));

          // Only fallback to demo data if there are absolutely no real accepted/pending_payment bookings in the entire database
          const hasAnyRealBookingsInDb = bookings.some(
            (b) => b.status === "accepted" || b.status === "pending_payment"
          );
          
          const hasRealData = hasAnyRealBookingsInDb;
          const selectedPlaceHasData = chartData.length > 0;

          if (!hasRealData) {
            chartData = dataKeuangan;
          } else if (selectedPlaceHasData) {
            // Sort chronologically
            chartData.sort((a, b) => {
              const parseDate = (dStr: string) => {
                const parts = dStr.split(" ");
                const day = parseInt(parts[0]);
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
                const monthIdx = monthNames.indexOf(parts[1]) || 0;
                return new Date(2026, monthIdx, day).getTime();
              };
              return parseDate(a.tgl) - parseDate(b.tgl);
            });
          } else {
            // If the database has real bookings, but not for this specific selected place, show empty chart data
            chartData = [];
          }

          const finalPemasukan = hasRealData ? totalOrderValue : 2600000;
          const finalPengeluaran = hasRealData ? estimatedExpenses : 1350000;
          const finalNetProfit = hasRealData ? netProfit : (2600000 - 1350000);
          const finalDp = hasRealData ? totalDpReceived : 1300000;

          return (
            <>
              <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <button 
                    onClick={() => {
                      setSelectedTempatForStats(null);
                      setActiveNav("daftar");
                    }}
                    className="flex items-center gap-2 text-orange-600 font-bold text-sm mb-2 hover:text-orange-700 transition"
                  >
                    <ArrowLeft size={16} /> Kembali ke Daftar Tempat
                  </button>
                  <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Laporan: {selectedTempatForStats?.nama_tempat || "Seluruh Tempat"} 📈
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Laporan keuangan dan statistik pemesanan meja real-time.
                  </p>
                </div>
                {!hasRealData && (
                  <span className="self-start md:self-auto bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">
                    💡 Menampilkan Data Demo (Belum ada pesanan disetujui)
                  </span>
                )}
              </header>

              {/* STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* PEMASUKAN */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Revenue (Pre-Order)</p>
                    <span className="p-2 bg-green-50 text-green-600 rounded-xl">
                      <Wallet size={18} />
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">Rp {finalPemasukan.toLocaleString("id-ID")}</h4>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-semibold">
                    <span>Active Order Value</span>
                  </div>
                </div>

                {/* DP DITERIMA */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">DP QRIS Diterima (50%)</p>
                    <span className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                      <CheckCircle size={18} />
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">Rp {finalDp.toLocaleString("id-ID")}</h4>
                  <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 font-semibold">
                    <span>Dana Masuk Terjamin</span>
                  </div>
                </div>

                {/* ESTIMASI PENGELUARAN */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimasi Pengeluaran</p>
                    <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                      <XCircle size={18} />
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">Rp {finalPengeluaran.toLocaleString("id-ID")}</h4>
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-600 font-semibold">
                    <span>~35% Biaya Operasional & HPP</span>
                  </div>
                </div>

                {/* NET PROFIT */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Proyeksi Laba Bersih</p>
                    <span className="p-2 bg-orange-600 text-white rounded-xl">
                      <Store size={18} />
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-orange-600">Rp {finalNetProfit.toLocaleString("id-ID")}</h4>
                  <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 font-semibold">
                    <span>Laba Bersih Setelah COGS</span>
                  </div>
                </div>
              </div>

              {/* CHART & DETAILS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* CHART CONTAINER */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Visual Arus Kas Harian</h3>
                    <p className="text-xs text-gray-400 mb-6">Grafik fluktuasi pemasukan gross dan estimasi biaya harian.</p>
                  </div>
                  <div className="h-80 w-full flex items-center justify-center relative">
                    {chartData.length === 0 ? (
                      <div className="text-center text-gray-400 p-6">
                        <Store size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="font-bold text-sm">Belum Ada Transaksi Pemesanan</p>
                        <p className="text-[11px] text-gray-400 mt-1">Pemasukan untuk tempat ini masih bernilai Rp 0.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="tgl" tick={{fontSize: 11, fill: '#94a3b8'}} />
                          <YAxis tickFormatter={(value) => `Rp${value/1000}k`} tick={{fontSize: 11, fill: '#94a3b8'}} />
                          <Tooltip 
                            formatter={(value: any) => 
                              value ? `Rp ${Number(value).toLocaleString("id-ID")}` : "Rp 0"
                            }
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '10px' }} />
                          <Line type="monotone" dataKey="pemasukan" name="Gross Pemasukan" stroke="#e04f16" strokeWidth={3.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="pengeluaran" name="Est. Pengeluaran" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* DETAILED STATS INFO */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Analisis Singkat</h3>
                    <p className="text-xs text-gray-400 mb-6">Ringkasan performa tempat terpilih.</p>
                  </div>
                  <div className="space-y-4 flex-grow">
                    <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-sm font-semibold text-gray-600">Total Booking Sukses</span>
                      <span className="text-sm font-bold text-slate-800">{hasRealData ? successfulBookings.length : 35} Pesanan</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-sm font-semibold text-gray-600">Rata-rata Transaksi (AOV)</span>
                      <span className="text-sm font-bold text-slate-800">
                        Rp {Math.round(hasRealData ? (totalOrderValue / (successfulBookings.length || 1)) : 74285).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-sm font-semibold text-gray-600">Target Bulanan Terpenuhi</span>
                      <span className="text-sm font-bold text-green-600">
                        {hasRealData ? Math.min(100, Math.round((totalOrderValue / 10000000) * 100)) : 26}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50 text-[11px] text-gray-400 leading-relaxed">
                    💡 *Pemasukan dihitung dari pesanan berstatus &apos;Diterima&apos; &amp; &apos;Menunggu DP&apos;. Pengeluaran diestimasi 35% untuk HPP bahan baku menu pre-order.
                  </div>
                </div>
              </div>

              {/* TRANSACTIONS TABLE */}
              {hasRealData && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Rincian Transaksi Pendapatan</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Pelanggan</th>
                          <th className="pb-3 font-semibold">Tempat</th>
                          <th className="pb-3 font-semibold">Tanggal</th>
                          <th className="pb-3 font-semibold">DP Terbayar</th>
                          <th className="pb-3 font-semibold text-right">Nilai Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {successfulBookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="text-sm text-gray-600 hover:bg-slate-50/50 transition">
                            <td className="py-3 font-semibold text-slate-800">{b.nama}</td>
                            <td className="py-3">{b.tempat?.nama_tempat}</td>
                            <td className="py-3">{new Date(b.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                            <td className="py-3 text-orange-600 font-bold">Rp {(b.dp_harga || 0).toLocaleString("id-ID")}</td>
                            <td className="py-3 text-right font-black text-slate-800">Rp {getRealTotalHarga(b).toLocaleString("id-ID")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          );
        })()}
</main>



      {/* MODAL HAPUS */}
      {modalHapus && (
        <ModalWrapper onClose={() => setModalHapus(false)}>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">Hapus Tempat?</h3>
            <p className="text-gray-500 mb-6">
              Yakin ingin menghapus <span className="font-bold text-gray-800">"{tempatDipilih?.nama_tempat}"</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setModalHapus(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50">Batal</button>
              <button onClick={handleHapus} className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700">Ya, Hapus</button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}

// ===== KOMPONEN BANTU =====

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") return (
    <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
      <AlertCircle size={11} /> Menunggu
    </span>
  );
  if (status === "pending_payment") return (
    <span className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
      <Wallet size={11} /> Menunggu DP
    </span>
  );
  if (status === "accepted") return (
    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <CheckCircle size={11} /> Diterima
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
      <XCircle size={11} /> Ditolak
    </span>
  );
}

function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">{children}</div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex justify-between items-center mb-5">
      <h3 className="text-xl font-extrabold text-gray-800">{title}</h3>
      <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition">
        <X size={20} />
      </button>
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

function FormTempat({
  form,
  setForm,
  onChange,
  position,
  setPosition,
  hargaMin,
  setHargaMin,
  hargaMax,
  setHargaMax,
  menuItems,
  setMenuItems,
  fasilitas,
  setFasilitas,
  campusSearch,
  setCampusSearch,
  isCampusDropdownOpen,
  setIsCampusDropdownOpen,
}: {
  form: any;
  setForm: (val: any) => void;
  onChange: any;
  position: any;
  setPosition: any;
  hargaMin: string;
  setHargaMin: (val: string) => void;
  hargaMax: string;
  setHargaMax: (val: string) => void;
  menuItems: Array<{ name: string; description: string; price: string }>;
  setMenuItems: (val: Array<{ name: string; description: string; price: string }>) => void;
  fasilitas: string[];
  setFasilitas: (val: string[]) => void;
  campusSearch: string;
  setCampusSearch: (val: string) => void;
  isCampusDropdownOpen: boolean;
  setIsCampusDropdownOpen: (val: boolean) => void;
}) {
  const inputClass =
    "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition focus:ring-2 focus:ring-orange-100 font-medium text-sm text-gray-800";

  const labelClass =
    "text-xs font-bold text-gray-600 uppercase tracking-wider";

  return (
    <div className="space-y-5">

      {/* ==================== SECTION 1: Informasi Dasar ==================== */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b pb-2">
          <Store className="text-orange-500" size={18} />
          <h3 className="text-sm font-bold text-gray-800">Informasi Dasar</h3>
        </div>

        {/* Nama Tempat */}
        <div className="space-y-1.5">
          <label className={labelClass}>Nama Tempat *</label>
          <div className="relative flex items-center">
            <Store className="absolute left-4 text-gray-400" size={16} />
            <input name="nama_tempat" value={form.nama_tempat} onChange={onChange} className={inputClass} placeholder="Contoh: Plumeria Cafe" required />
          </div>
        </div>

        {/* Alamat */}
        <div className="space-y-1.5">
          <label className={labelClass}>Alamat Lengkap *</label>
          <div className="relative flex items-center">
            <MapPin className="absolute left-4 text-gray-400" size={16} />
            <input name="alamat" value={form.alamat} onChange={onChange} className={inputClass} placeholder="Jl. Telekomunikasi No. 1, Bojongsoang, Bandung" required />
          </div>
        </div>

        {/* Kategori Tempat (Visual Cards) */}
        <div className="space-y-1.5">
          <label className={labelClass}>Kategori Tempat *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { value: "Cafe", label: "Kafe", icon: Coffee, activeStyle: "border-amber-500 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100 ring-2 ring-amber-50" },
              { value: "Warkop", label: "Warkop", icon: Beer, activeStyle: "border-orange-500 bg-orange-50 text-orange-700 shadow-sm shadow-orange-100 ring-2 ring-orange-50" },
              { value: "Resto", label: "Restoran", icon: Utensils, activeStyle: "border-red-500 bg-red-50 text-red-700 shadow-sm shadow-red-100 ring-2 ring-red-50" },
              { value: "Coworking", label: "Workspace", icon: Laptop, activeStyle: "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100 ring-2 ring-blue-50" }
            ].map((cat) => {
              const isSelected = form.kategori === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, kategori: cat.value })}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 outline-none hover:scale-105 active:scale-95
                    ${isSelected ? `${cat.activeStyle} font-black` : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100/50"}`}
                >
                  <cat.icon size={18} className={isSelected ? "" : "text-gray-400"} />
                  <span className="text-[10px] font-bold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kampus Terdekat (Searchable Select) */}
        <div className="space-y-1.5 relative">
          <label className={labelClass}>Kampus Terdekat *</label>
          <button
            type="button"
            onClick={() => setIsCampusDropdownOpen(!isCampusDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-white transition text-left outline-none focus:ring-2 focus:ring-orange-100"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="text-gray-400" size={16} />
              {form.id_kampus ? (() => {
                const active = TOP_20_KAMPUS.find(c => c.id === form.id_kampus);
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-800">{active?.label}</span>
                    <span className="text-[8px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-bold border border-blue-100">{active?.city}</span>
                  </div>
                );
              })() : <span className="text-xs text-gray-400 font-medium">-- Pilih Kampus Terdekat --</span>}
            </div>
            <span className="text-gray-400 text-xs">▼</span>
          </button>
          {isCampusDropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2.5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <input type="text" value={campusSearch} onChange={(e) => setCampusSearch(e.target.value)} placeholder="Cari nama kampus atau kota..." className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:border-orange-500 focus:bg-white outline-none transition" autoFocus />
              <div className="max-h-40 overflow-y-auto space-y-0.5 pr-0.5">
                {(() => {
                  const filtered = TOP_20_KAMPUS.filter(c => c.label.toLowerCase().includes(campusSearch.toLowerCase()) || c.city.toLowerCase().includes(campusSearch.toLowerCase()));
                  if (filtered.length === 0) return <p className="text-center text-xs text-gray-400 py-2 italic">Kampus tidak ditemukan.</p>;
                  return filtered.map(c => {
                    const isSelected = form.id_kampus === c.id;
                    return (
                      <button key={c.id} type="button" onClick={() => { setForm((prev: any) => ({ ...prev, id_kampus: c.id })); setPosition({ lat: c.lat, lng: c.lng }); setIsCampusDropdownOpen(false); setCampusSearch(""); }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition text-left text-[11px] font-bold outline-none ${isSelected ? "bg-orange-50 border border-orange-100 text-orange-700 font-extrabold" : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <GraduationCap size={12} className={isSelected ? "text-orange-500" : "text-gray-400"} />
                          <span>{c.label}</span>
                        </div>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold border ${isSelected ? "bg-orange-100/70 border-orange-200 text-orange-800" : "bg-gray-50 border-gray-200 text-gray-500"}`}>{c.city}</span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Kisaran Harga & Jam */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Kisaran Harga *</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-extrabold">Rp</span>
                <input type="number" value={hargaMin} onChange={(e) => setHargaMin(e.target.value)} placeholder="Min" className="w-full pl-8 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition text-xs font-semibold" required />
              </div>
              <span className="text-gray-400 text-xs font-bold">—</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-extrabold">Rp</span>
                <input type="number" value={hargaMax} onChange={(e) => setHargaMax(e.target.value)} placeholder="Max" className="w-full pl-8 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition text-xs font-semibold" required />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Jam Operasional *</label>
            <div className="flex items-center gap-2">
              <input type="time" value={form.waktu_buka} onChange={(e) => setForm({ ...form, waktu_buka: e.target.value })} className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition text-xs font-semibold" required />
              <span className="text-gray-400 text-xs font-bold">—</span>
              <input type="time" value={form.waktu_tutup} onChange={(e) => setForm({ ...form, waktu_tutup: e.target.value })} className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition text-xs font-semibold" required />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 2: Foto & Lokasi ==================== */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center space-x-2 border-b pb-2">
          <ImageIcon className="text-green-500" size={18} />
          <h3 className="text-sm font-bold text-gray-800">Foto & Lokasi</h3>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Foto Tempat (URL atau Path)</label>
          <div className="relative flex items-center">
            <Upload className="absolute left-4 text-gray-400" size={16} />
            <input name="gambar" value={form.gambar} onChange={onChange} placeholder="https://... atau /uploads/nama-file.jpg" className={inputClass} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Pin Lokasi di Peta</label>
          <div className="h-52 rounded-xl overflow-hidden border border-gray-200">
            <TempatMap lat={position.lat} lng={position.lng} nama={form.nama_tempat || "Lokasi Tempat"} draggable={true} onDrag={(lat: number, lng: number) => setPosition({ lat, lng })} />
          </div>
          <p className="text-[10px] text-gray-400">Lat: {position.lat.toFixed(5)} | Lng: {position.lng.toFixed(5)}</p>
        </div>
      </div>

      {/* ==================== SECTION 3: Fasilitas ==================== */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center space-x-2 border-b pb-2">
          <span className="text-sm">🛠️</span>
          <h3 className="text-sm font-bold text-gray-800">Fasilitas Tempat</h3>
        </div>
        <p className="text-[10px] text-gray-400 font-medium">Tuliskan fasilitas yang tersedia atau klik dari rekomendasi di bawah.</p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input type="text" id="custom-fas-modal-input" placeholder="Ketik fasilitas lalu Enter..." className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:border-orange-500 outline-none transition"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const t = e.currentTarget as HTMLInputElement; const v = t.value.trim(); if (v) { if (!fasilitas.includes(v)) setFasilitas([...fasilitas, v]); t.value = ""; } } }} />
            <button type="button" onClick={() => { const input = document.getElementById("custom-fas-modal-input") as HTMLInputElement; if (input) { const v = input.value.trim(); if (v) { if (!fasilitas.includes(v)) setFasilitas([...fasilitas, v]); input.value = ""; } } }} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow transition">Tambah</button>
          </div>
          {REKOMENDASI_FASILITAS.filter(f => !fasilitas.includes(f)).length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mr-1">Rekomendasi:</span>
              {REKOMENDASI_FASILITAS.filter(f => !fasilitas.includes(f)).map((f, idx) => (
                <button key={idx} type="button" onClick={() => setFasilitas([...fasilitas, f])} className="bg-gray-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-gray-200 text-gray-600 font-bold text-[9px] px-2 py-0.5 rounded-md transition-all transform hover:scale-105 active:scale-95 flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-orange-500">+</span><span>{f}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {fasilitas.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {fasilitas.map((fasName, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 bg-orange-50 border border-orange-100 text-orange-700 font-bold text-[10px] px-2.5 py-1 rounded-full transition hover:scale-105">
                <span>✨ {fasName}</span>
                <button type="button" onClick={() => setFasilitas(fasilitas.filter(x => x !== fasName))} className="text-orange-400 hover:text-red-500 transition-colors font-extrabold text-[9px] pl-0.5">✕</button>
              </span>
            ))}
          </div>
        ) : <p className="text-[10px] text-gray-400 italic">Belum ada fasilitas yang ditambahkan.</p>}
      </div>

      {/* ==================== SECTION 4: Daftar Menu ==================== */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center space-x-2 border-b pb-2">
          <Utensils className="text-purple-500" size={18} />
          <h3 className="text-sm font-bold text-gray-800">Daftar Menu Andalan</h3>
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {menuItems.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl relative group">
              <div className="flex gap-2">
                <input type="text" value={item.name} onChange={(e) => { const n = [...menuItems]; n[idx].name = e.target.value; setMenuItems(n); }} placeholder="Nama Menu" className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-orange-500 outline-none transition" required />
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">Rp</span>
                  <input type="number" value={item.price} onChange={(e) => { const n = [...menuItems]; n[idx].price = e.target.value; setMenuItems(n); }} placeholder="Harga" className="w-full pl-6 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-orange-500 outline-none transition" required />
                </div>
                <button type="button" onClick={() => { if (menuItems.length > 1) setMenuItems(menuItems.filter((_, i) => i !== idx)); else setMenuItems([{ name: "", description: "", price: "" }]); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"><Trash2 size={14} /></button>
              </div>
              <input type="text" value={item.description} onChange={(e) => { const n = [...menuItems]; n[idx].description = e.target.value; setMenuItems(n); }} placeholder="Keterangan / Deskripsi" className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-orange-500 outline-none transition" />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setMenuItems([...menuItems, { name: "", description: "", price: "" }])} className="flex items-center gap-1 text-[11px] font-extrabold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-all mt-1">
          <Plus size={12} /> Tambah Item Menu
        </button>
      </div>
    </div>
  );
}

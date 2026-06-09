"use client";

import { useState, Suspense, useEffect } from "react";
import {
  Calendar, Clock, Phone, Download, CheckCircle, Timer,
  MessageSquare, MapPin, LayoutGrid, Loader2, Utensils,
  Plus, Minus, ShoppingCart, Info, User
} from 'lucide-react';
import { useSearchParams } from "next/navigation";

// ============================================================
// TIPE DATA meja dari DB
// ============================================================
interface MejaDB {
  id: string;
  nomor_meja: string;
  nama_lantai: string;
  tipe_lantai?: string | null;
  kapasitas_kursi: number;
  x?: number | null;
  y?: number | null;
}

interface MenuListItem {
  name: string;
  price: number;
  category: string;
}

// ============================================================
// KOMPONEN E-TICKET
// ============================================================
const SuccessBookingUI = ({
  bookingData,
  onBack,
}: {
  bookingData: any;
  onBack: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 font-sans animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Booking Berhasil!</h1>
        <p className="text-slate-500 mt-2 font-medium">Tunjukkan tiket ini saat tiba di lokasi.</p>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 pb-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-600 font-bold text-xs tracking-widest uppercase">E-TICKET</p>
              <h2 className="text-xl font-black text-slate-800 leading-tight uppercase mt-1">
                {bookingData?.namaTempat}
              </h2>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2 border border-amber-100 shadow-sm">
                <Timer size={12} /> Menunggu
              </div>
              <p className="text-slate-800 font-bold text-xs">#BK-{bookingData?.id?.slice(-5).toUpperCase() || "NEW"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Nama</p>
                  <p className="text-slate-800 font-bold text-base truncate">{bookingData?.nama || "-"}</p>
               </div>
               <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Lantai & Meja</p>
                  <p className="text-slate-800 font-bold text-base truncate">
                    {bookingData?.lantai?.split(" — ")[0]} / {bookingData?.nomorMeja}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Tanggal</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={16} className="text-blue-500" />
                  <p className="text-slate-800 font-bold text-sm">{bookingData?.tanggal || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Waktu</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={16} className="text-pink-500" />
                  <p className="text-slate-800 font-bold text-sm">
                    {bookingData?.jamMulai} - {bookingData?.jamSelesai}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Catatan & Pre-order</p>
              <div className="flex items-start gap-2 mt-1">
                <MessageSquare size={14} className="text-gray-400 mt-1" />
                <p className="text-slate-600 italic text-sm leading-relaxed whitespace-pre-line">
                  {bookingData?.catatan ? bookingData.catatan : "Tidak ada catatan."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 pt-4 text-center border-t border-dashed border-gray-100">
          <p className="text-gray-300 font-bold text-[9px] tracking-[0.3em] uppercase">VERIFIED BY NONGKIYUK SYSTEM</p>
        </div>
      </div>

      <div className="mt-10 w-full max-w-md space-y-4">
        <button
          onClick={() => window.print()}
          className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
        >
          <Download size={20} /> Simpan Tiket (PDF)
        </button>
        <button
          onClick={onBack}
          className="w-full text-blue-600 font-bold py-2 hover:underline transition-all text-center text-sm"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

const formatFloorTypeBadge = (tipe: string | null | undefined) => {
  if (!tipe) return "Indoor";
  switch (tipe) {
    case "OUTDOOR_BALKON": return "Outdoor (Balkon)";
    case "OUTDOOR_ROOFTOP": return "Outdoor (Rooftop)";
    case "OUTDOOR_TAMAN": return "Outdoor (Taman)";
    case "OUTDOOR_TERAS": return "Outdoor (Teras)";
    case "OUTDOOR": return "Outdoor";
    case "INDOOR":
    default: return "Indoor";
  }
};

const getFloorTheme = (tipe: string | null | undefined) => {
  switch (tipe) {
    case "OUTDOOR_BALKON":
      return {
        borderColor: "border-amber-200",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Outdoor (Balkon)",
        canvasBg: "bg-amber-50/10",
        tableStyle: "bg-white text-amber-750 border-amber-500 hover:border-amber-600 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-100 font-black scale-110 shadow-md shadow-emerald-200/50 z-10",
        gridLineStyle: "linear-gradient(rgba(245, 158, 11, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR_ROOFTOP":
      return {
        borderColor: "border-orange-200",
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Outdoor (Rooftop)",
        canvasBg: "bg-orange-50/10",
        tableStyle: "bg-white text-orange-750 border-orange-500 hover:border-orange-600 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-100 font-black scale-110 shadow-md shadow-emerald-200/50 z-10",
        gridLineStyle: "linear-gradient(rgba(249, 115, 22, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR_TAMAN":
      return {
        borderColor: "border-emerald-200",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Outdoor (Taman)",
        canvasBg: "bg-emerald-50/10",
        tableStyle: "bg-white text-emerald-755 border-emerald-500 hover:border-emerald-600 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-100 font-black scale-110 shadow-md shadow-emerald-200/50 z-10",
        gridLineStyle: "linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR_TERAS":
      return {
        borderColor: "border-teal-200",
        badge: "bg-teal-50 text-teal-700 border-teal-200",
        label: "Outdoor (Teras)",
        canvasBg: "bg-teal-50/10",
        tableStyle: "bg-white text-teal-755 border-teal-500 hover:border-teal-600 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-100 font-black scale-110 shadow-md shadow-emerald-200/50 z-10",
        gridLineStyle: "linear-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR":
      return {
        borderColor: "border-orange-200",
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Outdoor",
        canvasBg: "bg-orange-50/10",
        tableStyle: "bg-white text-orange-700 border-orange-500 hover:border-orange-600 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-100 font-black scale-110 shadow-md shadow-emerald-200/50 z-10",
        gridLineStyle: "linear-gradient(rgba(249, 115, 22, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.08) 1px, transparent 1px)"
      };
    case "INDOOR":
    default:
      return {
        borderColor: "border-blue-200",
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        label: "Indoor",
        canvasBg: "bg-slate-50",
        tableStyle: "bg-white text-blue-700 border-blue-600 hover:border-blue-600 hover:scale-105 hover:shadow-lg",
        tableActiveStyle: "bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-100 font-black scale-110 shadow-md shadow-emerald-200/50 z-10",
        gridLineStyle: "linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)"
      };
  }
};

// Generate 30-minute intervals
const generateTimes = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    const hourStr = String(h).padStart(2, "0");
    times.push(`${hourStr}:00`);
    times.push(`${hourStr}:30`);
  }
  return times;
};

const getCategoryName = (kategoriField: any): string => {
  if (!kategoriField) return "";
  if (typeof kategoriField === "string") return kategoriField;
  if (Array.isArray(kategoriField)) {
    const first = kategoriField[0];
    if (first?.kategori?.nama_kategori) return first.kategori.nama_kategori;
    if (first?.nama_kategori) return first.nama_kategori;
  }
  if (typeof kategoriField === "object") {
    if (kategoriField.kategori?.nama_kategori) return kategoriField.kategori.nama_kategori;
    if (kategoriField.nama_kategori) return kategoriField.nama_kategori;
  }
  return "";
};

// ============================================================
// HALAMAN FORM BOOKING UTAMA (LANDSCAPE)
// ============================================================
function BookingForm() {
  const searchParams = useSearchParams();
  const idDariUrl = searchParams.get("id") || "";
  const namaTempatDariUrl = searchParams.get("nama") || "Tempat Pilihan";
  const jamOperasional = searchParams.get("jam") || "08:00 - 22:00";

  // State form
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [nama, setNama] = useState("");
  const [nomor, setNomor] = useState("");
  const [catatan, setCatatan] = useState("");
  const [selectedLantai, setSelectedLantai] = useState("");
  const [selectedMejaId, setSelectedMejaId] = useState("");   
  const [selectedMejaLabel, setSelectedMejaLabel] = useState(""); 
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [bookingsTanggal, setBookingsTanggal] = useState<any[]>([]);

  // Fetch existing bookings for the selected date to calculate overlap/availability real-time
  useEffect(() => {
    if (!idDariUrl || !selectedDate) {
      setBookingsTanggal([]);
      return;
    }
    const fetchBookingsForDate = async () => {
      try {
        const res = await fetch(`/api/booking?tempatId=${idDariUrl}&tanggal=${selectedDate}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setBookingsTanggal(data.bookings);
        }
      } catch (err) {
        console.error("Failed to fetch bookings for date:", err);
      }
    };
    fetchBookingsForDate();
  }, [idDariUrl, selectedDate]);

  // Helper: check if a specific table overlaps with current time selection
  const getTableBookingInfo = (mejaId: string) => {
    if (!selectedDate || !startTime || !endTime) return null;

    const toMin = (hhmm: string): number => {
      const [h, m] = hhmm.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const selStart = toMin(startTime);
    const selEnd = toMin(endTime);

    return bookingsTanggal.find(b => {
      if (b.mejaId !== mejaId) return false;
      if (b.status === "rejected") return false;
      
      const bStart = toMin(b.jam_mulai);
      const bEnd = toMin(b.jam_selesai);

      // Overlap: start1 < end2 and end1 > start2
      return selStart < bEnd && selEnd > bStart;
    });
  };

  // Auto-deselect if the selected table is now overlapping due to time changes
  useEffect(() => {
    if (selectedMejaId) {
      const isBooked = !!getTableBookingInfo(selectedMejaId);
      if (isBooked) {
        setSelectedMejaId("");
        setSelectedMejaLabel("");
      }
    }
  }, [startTime, endTime, selectedDate, bookingsTanggal, selectedMejaId]);

  // Find up to 3 alternative tables that are free during the selected date/time
  const getAlternativeTables = () => {
    if (!selectedDate || !startTime || !endTime) return [];
    
    // Filter out tables that are booked
    const availableTables = mejaDB.filter(meja => {
      const isBooked = !!getTableBookingInfo(meja.id);
      return !isBooked;
    });

    // Optionally sort them: prefer tables in the currently selected floor, then similar capacity
    return availableTables
      .sort((a, b) => {
        // Prefer currently selected floor
        const aFloor = a.nama_lantai === selectedLantai?.split(" — ")[0];
        const bFloor = b.nama_lantai === selectedLantai?.split(" — ")[0];
        if (aFloor && !bFloor) return -1;
        if (!aFloor && bFloor) return 1;
        
        // Prefer similar capacity
        return a.kapasitas_kursi - b.kapasitas_kursi;
      })
      .slice(0, 3);
  };

  // State pre-order menu
  const [menuItems, setMenuItems] = useState<MenuListItem[]>([]);
  const [menuOrder, setMenuOrder] = useState<Record<string, number>>({});

  // State data meja dari DB
  const [mejaDB, setMejaDB] = useState<MejaDB[]>([]);
  const [loadingMeja, setLoadingMeja] = useState(true);
  const [errorMeja, setErrorMeja] = useState("");
  const [tempatDetails, setTempatDetails] = useState<any>(null);

  // Load username dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setNama(u.username || "");
      } catch { /* skip */ }
    }
  }, []);

  // Fetch data tempat & menu dari database
  useEffect(() => {
    if (!idDariUrl) {
      setLoadingMeja(false);
      setErrorMeja("ID tempat tidak ditemukan di URL.");
      return;
    }

    const fetchMejaDanMenu = async () => {
      setLoadingMeja(true);
      setErrorMeja("");
      try {
        const res = await fetch("/api/tempat");
        const data = await res.json();
        if (data.success) {
          const tempat = data.tempat.find((t: any) => t.id_tempat === idDariUrl);
          if (tempat) {
            setTempatDetails(tempat);
            if (Array.isArray(tempat.mejas)) {
              setMejaDB(tempat.mejas);
            } else {
              setErrorMeja("Data meja belum tersedia untuk tempat ini.");
            }

            // Parse menu teks kafenya jika ada
            let parsed: MenuListItem[] = [];
            if (tempat.menu_text) {
              if (tempat.menu_text.trim().startsWith("[")) {
                try {
                  const jsonMenus = JSON.parse(tempat.menu_text);
                  if (Array.isArray(jsonMenus)) {
                    parsed = jsonMenus.map((m: any) => ({
                      name: m.name || "",
                      price: Number(m.price) || 0,
                      category: "Menu Kafe"
                    }));
                  }
                } catch (e) {
                  console.error("Error parsing menu JSON in booking:", e);
                }
              }

              if (parsed.length === 0) {
                const items = tempat.menu_text.split(/[,\n]/).map((x: string) => x.trim()).filter(Boolean);
                parsed = items.map((item: string, idx: number) => {
                  let price = 22000;
                  if (item.toLowerCase().includes("nasi") || item.toLowerCase().includes("goreng") || item.toLowerCase().includes("spesial")) {
                    price = 35000;
                  } else if (item.toLowerCase().includes("croissant") || item.toLowerCase().includes("cake") || item.toLowerCase().includes("roti")) {
                    price = 28000;
                  } else if (item.toLowerCase().includes("kopi") || item.toLowerCase().includes("latte") || item.toLowerCase().includes("matcha")) {
                    price = 24000;
                  } else {
                    price = 18000 + (idx % 4) * 4000;
                  }
                  return { name: item, price, category: "Menu Kafe" };
                });
              }
            }

            // Fallback menu default jika data kosong
            if (parsed.length === 0) {
              parsed = [
                { name: "Signature Kopi Aren", price: 22000, category: "Minuman" },
                { name: "Premium Matcha Latte", price: 26000, category: "Minuman" },
                { name: "Warm Butter Croissant", price: 28000, category: "Makanan" },
                { name: "Nasi Goreng Nongki", price: 32000, category: "Makanan" },
                { name: "Crispy French Fries", price: 20000, category: "Cemilan" }
              ];
            }
            setMenuItems(parsed);

          } else {
            setErrorMeja("Data tempat tidak ditemukan.");
          }
        } else {
          setErrorMeja("Gagal mengambil data dari server.");
        }
      } catch {
        setErrorMeja("Koneksi bermasalah saat mengambil data.");
      } finally {
        setLoadingMeja(false);
      }
    };

    fetchMejaDanMenu();
  }, [idDariUrl]);

  // Group meja berdasarkan nama_lantai & tipe_lantai
  const lantaiMap: Record<string, MejaDB[]> = {};
  for (const meja of mejaDB) {
    const key = `${meja.nama_lantai} — ${formatFloorTypeBadge(meja.tipe_lantai || "INDOOR")}`;
    if (!lantaiMap[key]) lantaiMap[key] = [];
    lantaiMap[key].push(meja);
  }
  const daftarLantai = Object.keys(lantaiMap).sort();
  const daftarMejaLantaiIni: MejaDB[] = selectedLantai ? (lantaiMap[selectedLantai] || []) : [];

  // Set default selected floor tab
  if (!selectedLantai && daftarLantai.length > 0) {
    setSelectedLantai(daftarLantai[0]);
  }

  // ============================================================
  // LOGIKA FILTRASI WAKTU (Maksimal 2 Jam)
  // ============================================================
  const allTimes = generateTimes();
  let availableStartTimes = allTimes;

  if (jamOperasional && jamOperasional !== "24 Jam" && jamOperasional.includes("-")) {
    const parts = jamOperasional.split("-");
    const buka = parts[0]?.trim();
    const tutup = parts[1]?.trim();
    if (buka && tutup) {
      const parseTimeToMinutes = (tStr: string) => {
        const [h, m] = tStr.split(":").map(Number);
        return h * 60 + m;
      };
      const bukaMin = parseTimeToMinutes(buka);
      const tutupMin = parseTimeToMinutes(tutup);

      availableStartTimes = allTimes.filter(t => {
        const m = parseTimeToMinutes(t);
        return m >= bukaMin && m < tutupMin;
      });
    }
  }

  // Filter jam selesai agar HANYA menampilkan waktu makimal 2 jam dari jam mulai
  let availableEndTimes: string[] = [];
  if (startTime) {
    const [startH, startM] = startTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;

    availableEndTimes = allTimes.filter(t => {
      const [endH, endM] = t.split(":").map(Number);
      const endMinutes = endH * 60 + endM;
      
      const diff = endMinutes - startMinutes;
      // Durasi harus lebih dari 0 menit, dan maksimal 120 menit (2 jam)
      return diff > 0 && diff <= 120;
    });

    // Sesuaikan juga dengan jam tutup operasional
    if (jamOperasional && jamOperasional !== "24 Jam" && jamOperasional.includes("-")) {
      const parts = jamOperasional.split("-");
      const tutup = parts[1]?.trim();
      if (tutup) {
        const [tutupH, tutupM] = tutup.split(":").map(Number);
        const tutupMinutes = tutupH * 60 + tutupM;
        availableEndTimes = availableEndTimes.filter(t => {
          const [endH, endM] = t.split(":").map(Number);
          const endMinutes = endH * 60 + endM;
          return endMinutes <= tutupMinutes;
        });
      }
    }
  }

  // Logika pre-order menu quantities
  const handleUpdateQty = (itemName: string, amount: number) => {
    setMenuOrder(prev => {
      const current = prev[itemName] || 0;
      const next = Math.max(0, current + amount);
      const copy = { ...prev };
      if (next === 0) {
        delete copy[itemName];
      } else {
        copy[itemName] = next;
      }
      return copy;
    });
  };

  const totalMenuPrice = Object.entries(menuOrder).reduce((acc, [name, qty]) => {
    const item = menuItems.find(m => m.name === name);
    return acc + (item ? item.price * qty : 0);
  }, 0);

  // ============================================================
  // HANDLE SUBMIT BOOKING
  // ============================================================
  const handleBooking = async () => {
    setErrorMessage("");

    if (!nama.trim() || !nomor.trim() || !selectedDate || !startTime || !endTime) {
      setErrorMessage("Nama, WhatsApp, tanggal, dan jam wajib diisi!");
      return;
    }
    if (!selectedLantai || !selectedMejaId) {
      setErrorMessage("Pilih meja Anda di peta layout terlebih dahulu!");
      return;
    }

    const storedUser = localStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;

    if (!userData?.username) {
      setErrorMessage("Sesi login berakhir. Silakan login kembali.");
      return;
    }

    // Bangun catatan gabungan yang menyertakan ringkasan Pre-order
    let gabunganCatatan = catatan.trim();
    const listPreorder = Object.entries(menuOrder).map(([name, qty]) => {
      const item = menuItems.find(m => m.name === name);
      return `- ${qty}x ${name} (Rp ${(item ? item.price * qty : 0).toLocaleString()})`;
    });

    if (listPreorder.length > 0) {
      gabunganCatatan = `${gabunganCatatan}\n\n[PRE-ORDER MENU]\n${listPreorder.join("\n")}\nTotal Menu: Rp ${totalMenuPrice.toLocaleString()}`;
    }

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: selectedDate,
          jamMulai: startTime,
          jamSelesai: endTime,
          nama,
          nomor,
          catatan: gabunganCatatan,
          tempatId: idDariUrl,
          username: userData.username,
          lantai: selectedLantai,
          nomorMeja: selectedMejaLabel,
          mejaId: selectedMejaId,
          total_harga: totalMenuPrice,
          dp_harga: Math.ceil(totalMenuPrice / 2),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBookingSummary({
          ...data.booking,
          namaTempat: namaTempatDariUrl,
          jamMulai: startTime,
          jamSelesai: endTime,
          tanggal: selectedDate,
          nama,
          nomor,
          catatan: gabunganCatatan,
          lantai: selectedLantai,
          nomorMeja: selectedMejaLabel,
        });
        setIsSuccess(true);
      } else {
        setErrorMessage(data.message || "Gagal melakukan booking.");
      }
    } catch {
      setErrorMessage("Koneksi bermasalah. Coba lagi.");
    }
  };

  if (isSuccess) {
    return (
      <SuccessBookingUI
        bookingData={bookingSummary}
        onBack={() => (window.location.href = "/")}
      />
    );
  }

  // Theme untuk visual floor plan
  const activeFloorTipe = daftarMejaLantaiIni.length > 0 ? (daftarMejaLantaiIni[0].tipe_lantai || "INDOOR") : "INDOOR";
  const theme = getFloorTheme(activeFloorTipe);

  return (
    <div className="py-10 px-4 md:px-8 max-w-7xl mx-auto font-sans bg-gray-50/20 min-h-screen">
      
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row justify-between items-start border-b pb-6 mb-8 gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[10px] font-black text-blue-600 tracking-[0.3em] uppercase">Interactive Seat Reservation</p>
            {(() => {
              const katName = getCategoryName(tempatDetails?.kategori);
              return katName ? (
                <span className="text-[9px] bg-blue-50 text-blue-700 font-extrabold uppercase px-2 py-0.5 rounded-md border border-blue-100 animate-in fade-in duration-200">
                  {katName === "Cafe" ? "Kafe" : katName === "Resto" ? "Restoran" : katName === "Coworking" ? "Workspace" : katName}
                </span>
              ) : null;
            })()}
          </div>
          <h2 className="text-3xl font-black text-slate-800 uppercase leading-none">{namaTempatDariUrl}</h2>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <Clock size={13} className="text-blue-500" />
              <span>Jam Operasional: {jamOperasional}</span>
            </div>
            {tempatDetails?.alamat && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <MapPin size={13} className="text-red-500" />
                <span className="line-clamp-1">{tempatDetails.alamat}</span>
              </div>
            )}
          </div>

          {/* Dinamis menampilkan fasilitas yang terintegrasi */}
          {tempatDetails?.fasilitas && tempatDetails.fasilitas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tempatDetails.fasilitas.map((f: any) => (
                <span
                  key={f.fasilitas.id_fasilitas}
                  className="inline-flex items-center bg-slate-50 border border-slate-200/60 text-slate-650 font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-2xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                >
                  ✨ {f.fasilitas.nama_fasilitas}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-xs bg-amber-50/50 text-amber-800 p-4 rounded-2xl border border-amber-200/60 font-bold flex items-start gap-2.5 max-w-sm shrink-0">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold text-[11px] uppercase tracking-wider text-amber-700">Aturan Booking</p>
            <p className="text-gray-600 text-[11px] leading-relaxed">Durasi pemesanan meja maksimal adalah 2 jam untuk kenyamanan semua pelanggan nongkrong.</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-xl flex items-center gap-3 shadow-sm animate-pulse">
          <span className="text-lg">⚠️</span> {errorMessage}
        </div>
      )}

      {/* GRID UTAMA - LANDSCAPE SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT COLUMN (TANGGAL, WAKTU, MENU, IDENTITAS) ================= */}
        <div className="lg:col-span-5 space-y-6">

          {/* 1. KALENDER */}
          <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" /> 1. Pilih Tanggal Nongkrong
            </h3>
            <div className="flex items-center justify-between mb-4 px-1">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-black outline-none cursor-pointer text-slate-700"
              >
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <span className="text-xs font-black text-gray-300 tracking-widest uppercase">2026</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["S","S","R","K","J","S","M"].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-black text-gray-300">{d}</div>
              ))}
              {Array.from({ length: new Date(2026, selectedMonth - 1, 1).getDay() }).map((_, i) => (
                <div key={i}></div>
              ))}
              {Array.from({ length: new Date(2026, selectedMonth, 0).getDate() }, (_, i) => i + 1).map((day) => {
                const dateStr = `2026-${String(selectedMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-9 rounded-xl text-xs font-black transition-all ${
                      selectedDate === dateStr
                        ? "bg-blue-600 text-white shadow-md shadow-blue-150"
                        : "hover:bg-blue-50 text-slate-600"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. JAM DURASI (MAKS 2 JAM) */}
          <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} className="text-blue-500" /> 2. Jam Pemesanan (Maks 2 Jam)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Jam Mulai</label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setEndTime(""); // Reset end time on change to enforce bounds
                  }}
                  className="w-full border border-gray-200 p-3 rounded-xl text-xs font-bold bg-slate-50 outline-none shadow-inner focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Mulai --</option>
                  {availableStartTimes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Jam Selesai</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!startTime}
                  className="w-full border border-gray-200 p-3 rounded-xl text-xs font-bold bg-slate-50 outline-none shadow-inner focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">-- Selesai --</option>
                  {availableEndTimes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            {startTime && (
              <p className="text-[10px] text-blue-600 font-bold leading-normal">
                💡 Durasi selesai dibatasi maksimal 2 jam dari jam {startTime} sesuai kapasitas meja.
              </p>
            )}
          </div>

          {/* 3. PESAN MENU (PRE-ORDER) */}
          <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Utensils size={14} className="text-blue-500" /> 3. Pre-order Menu & Camilan
            </h3>
            <p className="text-[10px] text-gray-400">Pre-order hidangan nongkrong favorit Anda untuk langsung dinikmati saat sampai kafe.</p>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {menuItems.map((item) => {
                const qty = menuOrder[item.name] || 0;
                return (
                  <div key={item.name} className="flex justify-between items-center p-2.5 border rounded-xl bg-slate-50 hover:bg-slate-50/80 transition shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-emerald-600 font-black">Rp {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border border-gray-150 shadow-inner">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.name, -1)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-black text-slate-800 min-w-4 text-center">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.name, 1)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. IDENTITAS PEMESAN */}
          <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <User size={14} className="text-blue-500" /> 4. Identitas & Catatan
            </h3>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama Pemesan"
              className="w-full border border-gray-200 p-3.5 rounded-xl text-xs font-bold outline-none bg-slate-50 focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="text"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="Nomor WhatsApp aktif (Contoh: 08123456789)"
              className="w-full border border-gray-200 p-3.5 rounded-xl text-xs font-bold outline-none bg-slate-50 focus:ring-2 focus:ring-blue-100"
            />
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan tambahan (misalnya: minta di pojokan, tidak pakai bawang, dll)"
              rows={2}
              className="w-full border border-gray-200 p-3.5 rounded-xl text-xs font-bold outline-none resize-none bg-slate-50 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

        {/* ================= RIGHT COLUMN (FLOOR PLAN SEAT & SUMMARY) ================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* MAP INTERAKTIF SELECTION */}
          <div className="bg-white border border-gray-150 rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid size={14} /> Pilih Lantai & Peta Meja
              </h3>
              
              {/* Selector Tabs Lantai */}
              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                {daftarLantai.map((lt) => (
                  <button
                    key={lt}
                    type="button"
                    onClick={() => {
                      setSelectedLantai(lt);
                      setSelectedMejaId("");
                      setSelectedMejaLabel("");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border outline-none
                      ${selectedLantai === lt
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-150"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      }
                    `}
                  >
                    {lt.split(" — ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {loadingMeja ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-xs font-bold gap-2">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span>Memuat peta tata letak meja kafe...</span>
              </div>
            ) : errorMeja ? (
              <div className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                ⚠️ {errorMeja}
              </div>
            ) : mejaDB.length === 0 ? (
              <div className="text-gray-400 text-xs bg-gray-50 p-6 rounded-2xl text-center italic">
                Tata letak visual meja belum diatur oleh pemilik tempat.
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* visual canvas */}
                {selectedLantai && (
                  <div className="space-y-4">
                    
                    {/* Visual Floor Canvas */}
                    <div 
                      className={`w-full h-[360px] rounded-3xl border-2 relative overflow-hidden shadow-inner transition-colors duration-300 ${theme.borderColor} ${theme.canvasBg}`}
                      style={{
                        backgroundImage: theme.gridLineStyle,
                        backgroundSize: "20px 20px"
                      }}
                    >
                      {/* Sub-type active badge */}
                      <div className={`absolute top-3 right-3 border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm pointer-events-none ${theme.badge}`}>
                        {theme.label}
                      </div>

                      {/* Reference Pintu Masuk di Sebelah Bawah */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white border-t-2 border-x-2 border-gray-200 rounded-t-2xl px-6 py-2 shadow-md text-[9px] font-black text-slate-500 tracking-widest flex items-center gap-2 select-none z-10 cursor-default">
                        <span className="text-xs">🚪</span>
                        <span>PINTU MASUK UTAMA / ENTRANCE</span>
                      </div>

                      {/* Rendering tables */}
                      {daftarMejaLantaiIni.map((meja, mIdx) => {
                        let x = meja.x;
                        let y = meja.y;
                        
                        // Fallback Auto-Grid if no coordinates set
                        if ((x === 0 && y === 0) || x === null || y === null || x === undefined || y === undefined) {
                          const cols = 3;
                          const row = Math.floor(mIdx / cols);
                          const col = mIdx % cols;
                          x = 18 + col * 32;
                          y = 20 + row * 25;
                        }

                        const bookingBentrokInfo = getTableBookingInfo(meja.id);
                        const isBooked = !!bookingBentrokInfo;
                        const isSelected = selectedMejaId === meja.id;

                        return (
                          <button
                            key={meja.id}
                            type="button"
                            disabled={isBooked}
                            onClick={() => {
                              if (isBooked) return;
                              setSelectedMejaId(meja.id);
                              setSelectedMejaLabel(meja.nomor_meja);
                            }}
                            style={{ 
                              left: `${x}%`, 
                              top: `${y}%`, 
                              transform: "translate(-50%, -50%)" 
                            }}
                            className={`absolute w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-md outline-none ${
                              isBooked 
                                ? "bg-red-500 text-white border-red-650 cursor-not-allowed opacity-90 ring-4 ring-red-100/50 shadow-red-200/30" 
                                : (isSelected ? theme.tableActiveStyle : theme.tableStyle)
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-tighter leading-none">
                              {meja.nomor_meja.replace("Meja ", "M")}
                            </span>
                            <span className="text-[9px] opacity-80 mt-0.5 leading-none">
                              {isBooked ? "🚫 Penuh" : `👤${meja.kapasitas_kursi}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-6 py-2.5 bg-gray-50 rounded-2xl border border-gray-150 text-xs font-bold text-gray-500 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 bg-emerald-500" />
                        <span>Meja Terpilih</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-350 bg-white" />
                        <span>Meja Tersedia</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-red-600 bg-red-500" />
                        <span>Meja Terisi (Penuh)</span>
                      </div>
                    </div>

                    {/* Dynamic Alternative Table Recommendations */}
                    {selectedDate && startTime && endTime && (
                      <div className="mt-6 bg-slate-50 border border-slate-200/60 p-5 rounded-3xl space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">💡</span>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Rekomendasi Meja Alternatif</h4>
                            <p className="text-[10px] text-gray-500">Meja-meja yang kosong dan siap dipesan pada jam pilihan Anda.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          {getAlternativeTables().length > 0 ? (
                            getAlternativeTables().map((meja) => (
                              <button
                                key={meja.id}
                                type="button"
                                onClick={() => {
                                  const targetFloorKey = Object.keys(lantaiMap).find(k => k.startsWith(meja.nama_lantai));
                                  if (targetFloorKey) {
                                    setSelectedLantai(targetFloorKey);
                                  }
                                  setSelectedMejaId(meja.id);
                                  setSelectedMejaLabel(meja.nomor_meja);
                                }}
                                className={`p-3 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between h-20 shadow-sm hover:shadow cursor-pointer ${
                                  selectedMejaId === meja.id
                                    ? "bg-emerald-500 border-emerald-600 text-white"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span className="text-xs font-black uppercase tracking-tight">{meja.nomor_meja}</span>
                                <div className="flex justify-between w-full items-end mt-2">
                                  <span className="text-[9px] font-bold opacity-80">{meja.nama_lantai}</span>
                                  <span className="text-[10px] font-black">👤 {meja.kapasitas_kursi} Kursi</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="col-span-3 text-center py-4 text-xs font-bold text-red-500 bg-red-50 rounded-2xl border border-red-100">
                              😭 Semua meja penuh pada jam ini. Silakan pilih hari atau jam lain.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}
          </div>

          {/* RINGKASAN BOOKING & SUBMIT CARD */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-[32px] p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <ShoppingCart size={15} /> Ringkasan & Konfirmasi Nongkrong
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-300 border-b border-slate-800 pb-4">
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[9px] mb-1">Tempat Kafe</p>
                <p className="text-white text-sm font-extrabold">{namaTempatDariUrl}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[9px] mb-1">Tanggal terpilih</p>
                <p className="text-white text-sm font-extrabold">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "-- Belum dipilih --"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[9px] mb-1">Jam Booking</p>
                <p className="text-white text-sm font-extrabold">
                  {startTime && endTime ? `${startTime} s.d. ${endTime}` : "-- Belum dipilih --"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[9px] mb-1">Lantai & Meja Terpilih</p>
                <p className="text-emerald-400 text-sm font-extrabold">
                  {selectedLantai && selectedMejaLabel 
                    ? `${selectedLantai.split(" — ")[0]} (Area ${selectedLantai.split(" — ")[1]}) / ${selectedMejaLabel}` 
                    : "-- Silakan pilih di peta visual --"}
                </p>
              </div>
            </div>

            {/* Menu Preorder ringkasan */}
            {Object.keys(menuOrder).length > 0 && (
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <p className="text-slate-500 uppercase tracking-widest text-[9px]">Pre-order Menu</p>
                <div className="space-y-1.5">
                  {Object.entries(menuOrder).map(([name, qty]) => {
                    const item = menuItems.find(m => m.name === name);
                    return (
                      <div key={name} className="flex justify-between items-center text-xs font-semibold text-slate-300">
                        <span>{name} ({qty}x)</span>
                        <span>Rp {(item ? item.price * qty : 0).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center text-xs font-black text-slate-200 pt-1">
                  <span>Subtotal Pre-order</span>
                  <span className="text-emerald-400">Rp {totalMenuPrice.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Tombol Booking */}
            <button
              onClick={handleBooking}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4.5 rounded-2xl font-black text-sm shadow-lg shadow-blue-900/30 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} /> Konfirmasi Booking Sekarang
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-[0.5em]">
          Loading...
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
"use client";

import { useState, Suspense, useEffect } from "react";
import {
  Calendar, Clock, Phone, Download, CheckCircle, Timer,
  MessageSquare, MapPin, LayoutGrid, Loader2
} from 'lucide-react';
import { useSearchParams } from "next/navigation";

// ============================================================
// TIPE DATA meja yang datang dari API /api/tempat (include mejas)
// ============================================================
interface MejaDB {
  id: string;
  nomor_meja: string;
  nama_lantai: string;
  kapasitas_kursi: number;
}

// ============================================================
// KOMPONEN E-TICKET (tampilan setelah booking sukses)
// ============================================================
const SuccessBookingUI = ({
  bookingData,
  onBack,
}: {
  bookingData: any;
  onBack: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
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
                  <p className="text-slate-800 font-bold text-base">
                    {bookingData?.lantai} / {bookingData?.nomorMeja}
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
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Catatan Tambahan</p>
              <div className="flex items-start gap-2 mt-1">
                <MessageSquare size={14} className="text-gray-400 mt-1" />
                <p className="text-slate-600 italic text-sm leading-relaxed">
                  {bookingData?.catatan ? `"${bookingData.catatan}"` : "Tidak ada catatan."}
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

// ============================================================
// HALAMAN FORM BOOKING UTAMA
// Mengambil data meja dari database secara DINAMIS
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
  const [selectedMejaId, setSelectedMejaId] = useState("");   // ID meja (untuk relasi DB)
  const [selectedMejaLabel, setSelectedMejaLabel] = useState(""); // Label "Meja 01"
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(5);

  // State data meja DINAMIS dari database
  const [mejaDB, setMejaDB] = useState<MejaDB[]>([]);
  const [loadingMeja, setLoadingMeja] = useState(true);
  const [errorMeja, setErrorMeja] = useState("");

  // ============================================================
  // Ambil data meja dari API saat komponen mount
  // ============================================================
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setNama(u.username || "");
      } catch { /* skip */ }
    }
  }, []);

  useEffect(() => {
    if (!idDariUrl) {
      setLoadingMeja(false);
      setErrorMeja("ID tempat tidak ditemukan di URL.");
      return;
    }

    const fetchMeja = async () => {
      setLoadingMeja(true);
      setErrorMeja("");
      try {
        const res = await fetch("/api/tempat");
        const data = await res.json();
        if (data.success) {
          // Cari tempat berdasarkan id
          const tempat = data.tempat.find((t: any) => t.id_tempat === idDariUrl);
          if (tempat && Array.isArray(tempat.mejas)) {
            setMejaDB(tempat.mejas);
          } else {
            setErrorMeja("Data meja belum tersedia untuk tempat ini.");
          }
        } else {
          setErrorMeja("Gagal mengambil data meja dari server.");
        }
      } catch {
        setErrorMeja("Koneksi bermasalah saat mengambil data meja.");
      } finally {
        setLoadingMeja(false);
      }
    };

    fetchMeja();
  }, [idDariUrl]);

  // ============================================================
  // Hitung daftar lantai dan meja dari data DB
  // ============================================================
  // Grup meja berdasarkan nama_lantai
  const lantaiMap: Record<string, MejaDB[]> = {};
  for (const meja of mejaDB) {
    if (!lantaiMap[meja.nama_lantai]) lantaiMap[meja.nama_lantai] = [];
    lantaiMap[meja.nama_lantai].push(meja);
  }
  const daftarLantai = Object.keys(lantaiMap).sort();
  const daftarMejaLantaiIni: MejaDB[] = selectedLantai ? (lantaiMap[selectedLantai] || []) : [];

  // ============================================================
  // Pilihan jam sesuai jam operasional
  // ============================================================
  const allHours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
  let availableStartTimes = allHours;
  let availableEndTimes = allHours;

  if (jamOperasional && jamOperasional !== "24 Jam" && jamOperasional.includes("-")) {
    const parts = jamOperasional.split("-");
    const buka = parts[0]?.trim();
    const tutup = parts[1]?.trim();
    if (buka && tutup) {
      const bukaHour = parseInt(buka.split(":")[0]) || 0;
      const tutupHour = parseInt(tutup.split(":")[0]) || 24;
      availableStartTimes = allHours.filter((t) => {
        const h = parseInt(t.split(":")[0]);
        return h >= bukaHour && h < tutupHour;
      });
      availableEndTimes = allHours.filter((t) => {
        const h = parseInt(t.split(":")[0]);
        return h > bukaHour && h <= tutupHour;
      });
    }
  }

  // ============================================================
  // Handle submit booking
  // ============================================================
  const handleBooking = async () => {
    setErrorMessage("");

    if (!nama.trim() || !nomor.trim() || !selectedDate || !startTime || !endTime) {
      setErrorMessage("Nama, nomor, tanggal, dan jam wajib diisi!");
      return;
    }
    if (!selectedLantai || !selectedMejaId) {
      setErrorMessage("Pilih Lantai dan Meja terlebih dahulu.");
      return;
    }

    const storedUser = localStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;

    if (!userData?.username) {
      setErrorMessage("Anda harus login untuk melakukan booking.");
      return;
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
          catatan,
          tempatId: idDariUrl,
          username: userData.username,
          lantai: selectedLantai,
          nomorMeja: selectedMejaLabel,
          mejaId: selectedMejaId,
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
          catatan,
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

  // ============================================================
  // RENDER FORM
  // ============================================================
  return (
    <div className="p-4 max-w-md mx-auto relative min-h-screen bg-gray-50/30">

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[10px] font-black text-blue-600 tracking-[0.3em] uppercase mb-2">Booking Form</p>
        <h2 className="text-2xl font-black text-slate-800 uppercase leading-tight px-4">{namaTempatDariUrl}</h2>
        <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm mt-3">
            <Clock size={12} className="text-gray-400" />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{jamOperasional}</p>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-xl flex items-center gap-3 shadow-sm animate-pulse">
          <span className="text-lg">⚠️</span> {errorMessage}
        </div>
      )}

      {/* KALENDER */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-5 px-1">
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

        <div className="grid grid-cols-7 gap-2">
          {["S","S","R","K","J","S","M"].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-black text-gray-200">{d}</div>
          ))}
          {Array.from({ length: new Date(2026, selectedMonth - 1, 1).getDay() }).map((_, i) => (
            <div key={i}></div>
          ))}
          {Array.from({ length: new Date(2026, selectedMonth, 0).getDate() }, (_, i) => i + 1).map((day) => {
            const dateStr = `2026-${String(selectedMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-10 rounded-2xl text-xs font-black transition-all ${
                  selectedDate === dateStr
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "hover:bg-blue-50 text-slate-600"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* PILIHAN WAKTU */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mulai</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border-none p-4 rounded-2xl text-sm font-bold bg-white outline-none shadow-sm focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Jam</option>
            {availableStartTimes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Selesai</label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border-none p-4 rounded-2xl text-sm font-bold bg-white outline-none shadow-sm focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Jam</option>
            {availableEndTimes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PILIHAN LANTAI & MEJA — DINAMIS DARI DATABASE */}
      <div className="mb-6 pt-4 border-t border-dashed border-gray-200">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-3">Pilih Lantai & Meja</p>

        {loadingMeja ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm font-bold">
            <Loader2 size={18} className="animate-spin" />
            Memuat data meja dari database...
          </div>
        ) : errorMeja ? (
          <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
            ⚠️ {errorMeja}
          </div>
        ) : mejaDB.length === 0 ? (
          <div className="text-gray-400 text-xs bg-gray-50 p-3 rounded-xl text-center">
            Meja belum tersedia untuk tempat ini. Hubungi Owner.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Dropdown Lantai */}
            <div>
              <label className="block mb-2 text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Lantai</label>
              <select
                value={selectedLantai}
                onChange={(e) => {
                  setSelectedLantai(e.target.value);
                  setSelectedMejaId("");
                  setSelectedMejaLabel("");
                }}
                className="w-full border-none p-4 rounded-2xl text-sm font-bold bg-white outline-none shadow-sm focus:ring-2 focus:ring-blue-100"
              >
                <option value="">-- Lantai --</option>
                {daftarLantai.map((lt) => (
                  <option key={lt} value={lt}>{lt}</option>
                ))}
              </select>
            </div>

            {/* Dropdown Meja — isi setelah lantai dipilih */}
            <div>
              <label className="block mb-2 text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Meja</label>
              <select
                value={selectedMejaId}
                onChange={(e) => {
                  const mejaId = e.target.value;
                  setSelectedMejaId(mejaId);
                  const found = daftarMejaLantaiIni.find((m) => m.id === mejaId);
                  setSelectedMejaLabel(found?.nomor_meja || "");
                }}
                disabled={!selectedLantai}
                className="w-full border-none p-4 rounded-2xl text-sm font-bold bg-white outline-none shadow-sm focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              >
                <option value="">-- Meja --</option>
                {daftarMejaLantaiIni.map((meja) => (
                  <option key={meja.id} value={meja.id}>
                    {meja.nomor_meja} ({meja.kapasitas_kursi} kursi)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* INPUT IDENTITAS */}
      <div className="space-y-4">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama Pemesan"
          className="w-full border-none p-5 rounded-2xl text-sm font-bold outline-none shadow-sm focus:ring-2 focus:ring-blue-100"
        />
        <input
          type="text"
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
          placeholder="WhatsApp (08...)"
          className="w-full border-none p-5 rounded-2xl text-sm font-bold outline-none shadow-sm focus:ring-2 focus:ring-blue-100"
        />
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Ada permintaan khusus?"
          rows={2}
          className="w-full border-none p-5 rounded-2xl text-sm font-bold outline-none shadow-sm resize-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        onClick={handleBooking}
        className="w-full mt-10 bg-blue-600 hover:bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-blue-100 active:scale-[0.98] transition-all uppercase tracking-widest"
      >
        Konfirmasi Booking
      </button>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-black text-gray-200 animate-pulse uppercase tracking-[0.5em]">
          Loading...
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
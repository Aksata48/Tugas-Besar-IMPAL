"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [nama, setNama] = useState("");
  const [nomor, setNomor] = useState("");
  const [catatan, setCatatan] = useState("");
  
  // State baru untuk notifikasi custom
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [bookingSummary, setBookingSummary] = useState<any>(null);

  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(5);

  const times = Array.from({ length: 24 }, (_, i) => {
    return `${String(i).padStart(2, "0")}:00`;
  });

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();

  // Menghilangkan pesan error otomatis setelah 3 detik
  useEffect(() => {
    if (errorMessage || showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast, errorMessage]);

  const handleBooking = async () => {
    setErrorMessage(""); // Reset error setiap klik

    if (!selectedDate || !startTime || !endTime || !nama) {
      setErrorMessage("Harap isi semua data dengan lengkap!");
      return;
    }

    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    const durasi = endHour - startHour;

    if (endHour <= startHour) {
      setErrorMessage("Jam selesai harus setelah jam mulai.");
      return;
    }

    if (durasi > 2) {
      setErrorMessage(`Durasi ${durasi} jam terlalu lama. Maksimal 2 jam!`);
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
          tempatId: "TMP-001",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingSummary({
          tanggal: selectedDate,
          jamMulai: startTime,
          jamSelesai: endTime,
          nama,
          nomor,
          catatan,
        });

        setShowToast(true); // Tampilkan notifikasi sukses custom
        
        // Reset form
        setStartTime("");
        setEndTime("");
        setNama("");
        setNomor("");
        setCatatan("");
      } else {
        setErrorMessage(data.message || "Gagal melakukan booking.");
      }
    } catch (error) {
      setErrorMessage("Koneksi bermasalah, coba lagi.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto relative min-h-screen">
      
      {/* --- CUSTOM NOTIFICATION (TOAST) --- */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-72 bg-green-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-xl">✅</span>
          <p className="text-sm font-bold">Booking Berhasil Disimpan!</p>
        </div>
      )}

      {/* --- ERROR MESSAGE --- */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <span>⚠️</span> {errorMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-5">Booking Tempat</h1>

      {/* Kalender */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4 gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-sm outline-none bg-gray-50"
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-sm outline-none bg-gray-50"
          >
            {Array.from({ length: 5 }, (_, i) => 2026 + i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={i}></div>)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const fullDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(fullDate)}
                className={`h-9 rounded-lg text-xs border ${selectedDate === fullDate ? "bg-black text-white" : "hover:bg-gray-100 bg-white"}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Jam */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <label className="block mb-2 text-sm font-semibold">Jam Mulai</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border p-2.5 rounded-xl text-sm bg-white outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Jam</option>
            {times.map((t) => (
              <option key={`start-${t}`} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold">Jam Selesai</label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border p-2.5 rounded-xl text-sm bg-white outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Jam</option>
            {times.map((t) => (
              <option key={`end-${t}`} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mb-6 font-medium">* Maksimal durasi booking adalah 2 jam</p>

      {/* Form Input */}
      <div className="space-y-4">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama Anda"
          className="w-full border p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
        />
        <input
          type="text"
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
          placeholder="Nomor HP"
          className="w-full border p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
        />
        
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Catatan tambahan (opsional)"
          rows={3}
          className="w-full border p-3 rounded-xl text-sm outline-none resize-none shadow-sm focus:border-blue-500 transition-colors"
        />
      </div>

      <button
        onClick={handleBooking}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
      >
        Booking Sekarang
      </button>

      {/* Ringkasan */}
      {bookingSummary && (
        <div className="mt-8 border-2 border-dashed rounded-2xl p-4 bg-white">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
             🎟️ Tiket Booking Anda
          </h2>
          <div className="text-sm space-y-2 border-t pt-3">
            <div className="flex justify-between"><span className="text-gray-500">Tanggal:</span> <b>{bookingSummary.tanggal}</b></div>
            <div className="flex justify-between"><span className="text-gray-500">Waktu:</span> <b>{bookingSummary.jamMulai} - {bookingSummary.jamSelesai}</b></div>
            <div className="flex justify-between"><span className="text-gray-500">Nama:</span> <b>{bookingSummary.nama}</b></div>
            {bookingSummary.catatan && (
              <div className="mt-2 bg-gray-50 p-2 rounded-lg italic text-gray-600 text-xs text-center">
                "{bookingSummary.catatan}"
              </div>
            )}
          </div>
        </div>
      )}

      <Link href="/booking/list" className="block text-center mt-8 text-blue-600 text-sm font-semibold hover:underline">
        Lihat Riwayat Booking
      </Link>
    </div>
  );
}
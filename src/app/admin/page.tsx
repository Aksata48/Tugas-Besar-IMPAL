"use client"; // Wajib karena ada interaksi tombol (useState)
import { useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  // Data dummy antrean booking dari pelanggan
  const [bookings, setBookings] = useState([
    { id: "B01", nama: "Faza Fawzan", telepon: "081234567890", tanggal: "2026-03-20", waktu: "19:00", tempat: "Warkop Motekar Bojongsoang" },
    { id: "B02", nama: "Putri Rahayu", telepon: "089876543210", tanggal: "2026-03-21", waktu: "16:30", tempat: "Ruang Nugas Cafe" }
  ]);

  // Fungsi saat tombol Terima/Tolak diklik
  const handleAction = (namaPelanggan: string, status: string) => {
    // Menghapus pelanggan dari daftar antrean
    setBookings(bookings.filter((b) => b.nama !== namaPelanggan));
    
    // Memunculkan pop-up notifikasi sederhana
    alert(`Booking atas nama ${namaPelanggan} berhasil di${status}! Sistem mengirimkan notifikasi ke pelanggan.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar Admin (Kiri) */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 hidden md:block shadow-xl z-10">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-blue-500 text-white font-bold flex items-center justify-center rounded-md">O</div>
          <h2 className="text-xl font-bold">Owner Panel</h2>
        </div>
        
        <nav className="space-y-3">
          <div className="block px-4 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg font-semibold">
            🛎️ Permintaan Masuk
          </div>
          <Link href="/" className="block px-4 py-3 hover:bg-slate-800 rounded-lg text-slate-400 transition">
            🏠 Kembali ke Web
          </Link>
        </nav>
      </aside>

      {/* Konten Utama (Kanan) */}
      <main className="flex-1 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Reservasi</h1>
        <p className="text-gray-600 mb-10">Kelola antrean booking dari mahasiswa yang masuk ke tempat Anda.</p>

        {bookings.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm text-center border border-dashed border-gray-300">
            <span className="text-5xl block mb-4">☕</span>
            <h3 className="text-xl font-bold text-gray-800">Semua Beres!</h3>
            <p className="text-gray-500 mt-2">Tidak ada permintaan booking yang menunggu konfirmasi saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:shadow-md transition">
                
                {/* Info Pelanggan */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-extrabold text-gray-900">{booking.nama}</h3>
                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse">Menunggu</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-600 mt-4 text-sm">
                    <p className="flex items-center gap-2">📞 {booking.telepon}</p>
                    <p className="flex items-center gap-2">📍 {booking.tempat}</p>
                    <p className="flex items-center gap-2 text-blue-600 font-semibold bg-blue-50 w-max px-2 py-1 rounded">
                      📅 {booking.tanggal} | ⏰ {booking.waktu} WIB
                    </p>
                  </div>
                </div>
                
                {/* Tombol Aksi */}
                <div className="flex gap-3 w-full xl:w-auto mt-4 xl:mt-0 border-t xl:border-0 pt-4 xl:pt-0">
                  <button 
                    onClick={() => handleAction(booking.nama, "terima")}
                    className="flex-1 xl:flex-none bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm transition transform active:scale-95"
                  >
                    Terima
                  </button>
                  <button 
                    onClick={() => handleAction(booking.nama, "tolak")}
                    className="flex-1 xl:flex-none bg-red-50 text-red-600 hover:bg-red-100 px-8 py-3 rounded-xl font-bold transition transform active:scale-95"
                  >
                    Tolak
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, Phone, Download, Timer, MessageSquare, ChevronLeft, CheckCircle, MapPin, LayoutGrid } from 'lucide-react';
import Link from "next/link";

export default function UniversalTicketPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const userData = JSON.parse(storedUser);

        // Ambil semua data booking milik user ini
        const res = await fetch(`/api/my-bookings?username=${userData.username}`);
        const data = await res.json();
        
        if (data.success) {
          // Cari spesifik ID yang ada di URL
          const found = data.bookings.find((b: any) => b.id === params.id);
          setBooking(found);
        }
      } catch (error) {
        console.error("Gagal memuat data tiket");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse uppercase tracking-widest">Memvalidasi Tiket...</div>;

  if (!booking) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-bold text-gray-500">Tiket tidak ditemukan</p>
      <Link href="/my-bookings" className="text-blue-600 font-bold underline">Lihat Riwayat Booking</Link>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      {/* Header Navigasi */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center">
         <button onClick={() => router.push('/my-bookings')} className="flex items-center gap-2 text-gray-500 font-bold text-xs hover:text-blue-600 transition">
            <ChevronLeft size={16} /> RIWAYAT
         </button>
         <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-tighter">
            <CheckCircle size={16} /> Terverifikasi Sistem
         </div>
      </div>

      {/* Kartu Tiket */}
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 pb-4">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-600 font-black text-[10px] tracking-[0.3em] uppercase mb-1">E-Ticket Official</p>
              <h2 className="text-2xl font-black text-slate-800 leading-tight uppercase">
                {booking.tempat?.nama_tempat}
              </h2>
            </div>
            <div className="text-right">
              <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-[10px] font-black border border-amber-100 shadow-sm uppercase tracking-tighter">Menunggu</span>
              <p className="text-slate-400 font-bold text-[9px] mt-3 uppercase tracking-widest">#BK-{booking.id.slice(-5).toUpperCase()}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Info Utama: Nama */}
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Nama Pelanggan</p>
              <p className="text-slate-800 font-black text-xl">{booking.nama}</p>
            </div>

            {/* Info Lantai & Meja (BARU DITAMBAHKAN) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Area / Lantai</p>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <MapPin size={16} className="text-orange-500" />
                  {booking.lantai || "Lantai 1"}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Nomor Meja</p>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <LayoutGrid size={16} className="text-purple-500" />
                  {booking.nomorMeja || "-"}
                </div>
              </div>
            </div>

            {/* Info Tanggal & Waktu */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Tanggal</p>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Calendar size={16} className="text-blue-500" />
                  {new Date(booking.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Waktu</p>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Clock size={16} className="text-pink-500" />
                  {booking.jam}
                </div>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Kontak WhatsApp</p>
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Phone size={16} className="text-indigo-500" />
                {booking.nomor}
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-gray-200">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Catatan</p>
              <p className="text-slate-600 italic text-xs leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                "{booking.catatan || "Tidak ada catatan tambahan."}"
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-4 text-center">
          <p className="text-gray-300 font-bold text-[9px] tracking-[0.5em] uppercase">NongkiYuk Official Ticket</p>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="mt-8 w-full max-w-md space-y-3">
        <button onClick={() => window.print()} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm">
          <Download size={20} /> Simpan Tiket (PDF)
        </button>
        <button onClick={() => router.push('/')} className="w-full text-blue-600 font-black py-2 text-xs hover:underline uppercase tracking-widest">
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
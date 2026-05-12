"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Ticket, ChevronLeft, User } from "lucide-react";
import Link from "next/link";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      // Ambil data berdasarkan username
      fetch(`/api/my-bookings?username=${userData.username}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setBookings(data.bookings);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal mengambil data booking:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-bold text-sm transition-all group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Beranda
        </Link>
        
        <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg">
            <Ticket size={24} />
          </div>
          Booking Saya
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] h-40 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] text-center border border-gray-100 shadow-xl">
            <Ticket size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Kosong</h3>
            <p className="text-gray-500 mt-2">Belum ada data booking untuk akun ini.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((bk: any) => (
              <div key={bk.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-black text-xl text-slate-800 uppercase tracking-tight">
                      {bk.tempat?.nama_tempat || "Detail Tempat"}
                    </h2>
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm mt-1">
                      <User size={14} /> {bk.nama} 
                    </div>
                  </div>
                  <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-4 py-1.5 rounded-full border border-amber-100 shadow-sm uppercase">
                    Menunggu
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 text-sm font-bold text-gray-500 mb-4">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                    <Calendar size={16} className="text-blue-500"/> 
                    {new Date(bk.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                    <Clock size={16} className="text-pink-500"/> 
                    {bk.jam}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-400 font-medium italic mb-6">
                   <MapPin size={16} className="shrink-0 text-gray-300"/> 
                   {bk.tempat?.alamat || "Alamat tidak tersedia"}
                </div>
                
                <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">Booking ID</p>
                    <p className="text-xs font-black text-slate-400 uppercase">
                      #BK-{bk.id.slice(-5).toUpperCase()}
                    </p>
                  </div>
                  
                  {/* FIX KATA 'ticket' MENJADI 'success' */}
                  <Link 
                    href={`/booking/success/${bk.id}`} 
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-slate-900 transition-all shadow-md active:scale-95"
                  >
                    DETAIL TIKET
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
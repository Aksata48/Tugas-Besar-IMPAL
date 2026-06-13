export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { Calendar, Clock, Phone, MapPin, ReceiptText } from "lucide-react";

export default async function BookingListPage() {
  // 1. Ambil data booking terbaru dengan relasi 'tempat'
  const latestBooking = await prisma.booking.findFirst({
    include: {
      tempat: true, // INI WAJIB: Supaya nama cafe yang dipilih bisa muncul
    },
    orderBy: {
      createdAt: "desc", // Mengambil booking yang paling baru dibuat
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ReceiptText className="text-blue-600" size={24} />
            Booking Terbaru
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        {!latestBooking ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">Belum ada riwayat booking.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                  <MapPin size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {/* DISINI NAMA CAFE AKAN OTOMATIS SESUAI PILIHAN (Dinamis) */}
                    {latestBooking.tempat?.nama_tempat || "Lokasi Cafe"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  {latestBooking.nama}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase">ID Booking</p>
                <p className="text-sm font-mono font-bold text-slate-700">
                  #BK-{latestBooking.id.slice(-4).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-gray-50">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={18} className="text-blue-500" />
                <span className="text-sm font-semibold">
                  {new Date(latestBooking.tanggal).toLocaleDateString("id-ID", {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={18} className="text-pink-500" />
                <span className="text-sm font-semibold">{latestBooking.jam}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={18} className="text-indigo-500" />
                <span className="text-sm font-semibold">{latestBooking.nomor}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-[10px] text-gray-400 font-medium italic">
                * Tiket ini adalah pesanan terakhir Anda
              </p>
              <span className="bg-green-100 text-green-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                Aktif
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
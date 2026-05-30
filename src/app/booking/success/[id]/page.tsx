"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar, Clock, Phone, Download, Timer, MessageSquare,
  ChevronLeft, CheckCircle, MapPin, LayoutGrid, XCircle,
  Wallet, QrCode, Loader2, CreditCard
} from 'lucide-react';
import Link from "next/link";

// Helper: Get status config for badge, colors, etc.
function getStatusConfig(status: string) {
  switch (status) {
    case "pending":
      return {
        label: "Menunggu Persetujuan Owner",
        badgeBg: "bg-amber-50",
        badgeText: "text-amber-600",
        badgeBorder: "border-amber-100",
        icon: <Timer size={14} />,
        shortLabel: "Menunggu"
      };
    case "pending_payment":
      return {
        label: "Menunggu Pembayaran DP",
        badgeBg: "bg-orange-50",
        badgeText: "text-orange-600",
        badgeBorder: "border-orange-100",
        icon: <Wallet size={14} />,
        shortLabel: "Bayar DP"
      };
    case "accepted":
      return {
        label: "Diterima — Meja Terbooking",
        badgeBg: "bg-green-50",
        badgeText: "text-green-600",
        badgeBorder: "border-green-100",
        icon: <CheckCircle size={14} />,
        shortLabel: "Diterima"
      };
    case "rejected":
      return {
        label: "Ditolak oleh Owner",
        badgeBg: "bg-red-50",
        badgeText: "text-red-600",
        badgeBorder: "border-red-100",
        icon: <XCircle size={14} />,
        shortLabel: "Ditolak"
      };
    default:
      return {
        label: status,
        badgeBg: "bg-gray-50",
        badgeText: "text-gray-600",
        badgeBorder: "border-gray-100",
        icon: <Timer size={14} />,
        shortLabel: status
      };
  }
}

export default function UniversalTicketPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk QRIS payment
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [qrisLoading, setQrisLoading] = useState(false);
  const [qrisError, setQrisError] = useState("");
  const [paymentConfirming, setPaymentConfirming] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const userData = JSON.parse(storedUser);

        const res = await fetch(`/api/my-bookings?username=${userData.username}`);
        const data = await res.json();

        if (data.success) {
          const found = data.bookings.find((b: any) => b.id === params.id);
          setBooking(found);

          // Jika sudah ada midtrans_qr tersimpan, langsung tampilkan
          if (found && found.midtrans_qr) {
            setQrisUrl(found.midtrans_qr);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data tiket");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  // Generate QRIS via Midtrans
  const handleGenerateQRIS = async () => {
    if (!booking) return;
    setQrisLoading(true);
    setQrisError("");

    try {
      const res = await fetch(`/api/booking/${booking.id}/pay-dp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success && data.midtrans_qr) {
        setQrisUrl(data.midtrans_qr);
      } else {
        setQrisError(data.message || "Gagal generate QRIS. Coba lagi.");
      }
    } catch {
      setQrisError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setQrisLoading(false);
    }
  };

  // Konfirmasi pembayaran DP -> update status ke accepted
  const handleConfirmPayment = async () => {
    if (!booking) return;
    setPaymentConfirming(true);

    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: booking.id, status: "accepted" }),
      });
      const data = await res.json();
      if (data.success) {
        setBooking({ ...booking, status: "accepted" });
        setQrisUrl(null); // Hide QRIS after confirmed
      }
    } catch {
      console.error("Gagal mengonfirmasi pembayaran");
    } finally {
      setPaymentConfirming(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse uppercase tracking-widest">
      Memvalidasi Tiket...
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-bold text-gray-500">Tiket tidak ditemukan</p>
      <Link href="/my-bookings" className="text-blue-600 font-bold underline">Lihat Riwayat Booking</Link>
    </div>
  );

  const statusConfig = getStatusConfig(booking.status);
  const dpAmount = booking.dp_harga || 0;
  const totalAmount = booking.total_harga || 0;

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
              <span className={`${statusConfig.badgeBg} ${statusConfig.badgeText} px-3 py-1.5 rounded-full text-[10px] font-black border ${statusConfig.badgeBorder} shadow-sm uppercase tracking-tighter inline-flex items-center gap-1`}>
                {statusConfig.icon} {statusConfig.shortLabel}
              </span>
              <p className="text-slate-400 font-bold text-[9px] mt-3 uppercase tracking-widest">#BK-{booking.id.slice(-5).toUpperCase()}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`${statusConfig.badgeBg} border ${statusConfig.badgeBorder} rounded-2xl p-4`}>
              <div className={`flex items-center gap-2 ${statusConfig.badgeText} font-black text-sm`}>
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
              </div>
              {booking.status === "pending" && (
                <p className="text-gray-500 text-[11px] mt-2 leading-relaxed">
                  Pesanan Anda sedang menunggu persetujuan dari pemilik tempat. Anda akan diminta membayar DP setelah disetujui.
                </p>
              )}
              {booking.status === "pending_payment" && (
                <p className="text-gray-500 text-[11px] mt-2 leading-relaxed">
                  Owner telah menyetujui booking Anda! Silakan bayar DP sebesar <span className="font-black text-orange-700">Rp {dpAmount.toLocaleString("id-ID")}</span> melalui QRIS di bawah untuk mengonfirmasi meja Anda.
                </p>
              )}
              {booking.status === "accepted" && (
                <p className="text-gray-500 text-[11px] mt-2 leading-relaxed">
                  Meja Anda sudah terbooking! Tunjukkan tiket ini saat tiba di lokasi. Selamat nongkrong! 🎉
                </p>
              )}
              {booking.status === "rejected" && (
                <p className="text-gray-500 text-[11px] mt-2 leading-relaxed">
                  Maaf, booking Anda ditolak oleh pemilik tempat. Silakan coba booking di waktu lain atau tempat berbeda.
                </p>
              )}
            </div>

            {/* Info Utama: Nama */}
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Nama Pelanggan</p>
              <p className="text-slate-800 font-black text-xl">{booking.nama}</p>
            </div>

            {/* Info Lantai & Meja */}
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

            {/* Info Pembayaran DP (jika ada pesanan) */}
            {totalAmount > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Rincian Pembayaran</p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Total Pre-order Menu</span>
                    <span className="text-slate-800 font-bold">Rp {totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-dashed border-gray-200 pt-2">
                    <span className="text-orange-600 font-black">DP (50%)</span>
                    <span className="text-orange-600 font-black text-lg">Rp {dpAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* QRIS PAYMENT SECTION (hanya tampil saat pending_payment) */}
            {booking.status === "pending_payment" && (
              <div className="pt-4 border-t border-dashed border-orange-200">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-orange-600 font-black text-sm uppercase tracking-wider">
                    <QrCode size={18} />
                    <span>Pembayaran DP via QRIS</span>
                  </div>

                  {/* QRIS Error */}
                  {qrisError && (
                    <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100">
                      {qrisError}
                    </div>
                  )}

                  {/* QRIS Image */}
                  {qrisUrl ? (
                    <div className="space-y-4">
                      <div className="bg-white border-2 border-dashed border-orange-300 rounded-3xl p-6 inline-block mx-auto shadow-lg">
                        <img
                          src={qrisUrl}
                          alt="QRIS Payment"
                          className="w-56 h-56 object-contain mx-auto"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                        Scan kode QRIS di atas menggunakan GoPay, OVO, DANA, ShopeePay, atau aplikasi e-wallet lainnya.
                      </p>
                      <button
                        onClick={handleConfirmPayment}
                        disabled={paymentConfirming}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                      >
                        {paymentConfirming ? (
                          <><Loader2 size={18} className="animate-spin" /> Mengonfirmasi...</>
                        ) : (
                          <><CreditCard size={18} /> Konfirmasi Pembayaran DP</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateQRIS}
                      disabled={qrisLoading}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                    >
                      {qrisLoading ? (
                        <><Loader2 size={18} className="animate-spin" /> Generating QRIS...</>
                      ) : (
                        <><QrCode size={18} /> Tampilkan QRIS untuk Bayar DP</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-dashed border-gray-200">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Catatan</p>
              <p className="text-slate-600 italic text-xs leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-line">
                &quot;{booking.catatan || "Tidak ada catatan tambahan."}&quot;
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
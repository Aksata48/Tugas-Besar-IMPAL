import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Star, ArrowLeft, Wallet, Building, CheckCircle2, MessageSquare, Ticket } from "lucide-react";
import FavoriteActionCard from "./FavoriteActionCard";
import ReviewForm from "@/app/detailtempat/reviewfrom"; 
import StatusOperasional from "@/app/detailtempat/statusOperasional"; 

// Server Component: Sekarang params harus di-await sebelum dipakai
export default async function DetailTempatPage({ params }: { params: Promise<{ id: string }> }) {
  
  // PERBAIKAN UTAMA: Harus di-await karena params sekarang adalah Promise di Next.js terbaru
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Query lengkap mengambil detail tempat, fasilitas, kategori, dan info kampus
  const tempat = await prisma.tempat.findUnique({
    where: { id_tempat: id },
    include: {
      kampus: true,
      fasilitas: {
        include: { fasilitas: true },
      },
      kategori: {
        include: { kategori: true },
      },
      places: true, 
    },
  });

  if (!tempat) {
    notFound();
  }

  const reviews = (tempat as any).places || [];
  const hasReviews = reviews.length > 0;
  const displayRating = hasReviews 
    ? (reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "New";

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER / GAMBAR UTAMA */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <Image 
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop" 
          alt={tempat.nama_tempat}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 w-full p-8 max-w-5xl mx-auto left-0 right-0">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition font-medium">
            <ArrowLeft size={20} /> Kembali ke Beranda
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              {tempat.kategori[0]?.kategori.nama_kategori || 'Nongki'}
            </span>
            
            {/* 2. TAMBAHKAN KOMPONEN STATUS DI SINI (Dekat Badge Kategori) */}
            <StatusOperasional buka={tempat.waktu_buka} tutup={tempat.waktu_tutup} />

            <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              <Star size={16} className="fill-yellow-900" /> {displayRating}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{tempat.nama_tempat}</h1>
          <p className="text-gray-300 flex items-center gap-2 text-lg font-medium">
            <MapPin size={18} /> {tempat.alamat}
          </p>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* Card Info Dasar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Clock size={24} /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Jam Operasional</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-extrabold text-gray-800">{tempat.jam_buka}</p>
                  {/* 3. ATAU BISA JUGA DITAMBAHKAN DI SINI (Dalam card jam) */}
                </div>
              </div>
            </div>
            <div className="hidden sm:block w-px bg-gray-100"></div>
            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-xl text-green-600"><Wallet size={24} /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Kisaran Harga</p>
                <p className="text-lg font-extrabold text-gray-800">{tempat.kisaran_harga}</p>
              </div>
            </div>
          </div>

          {/* Lokasi Kampus Terdekat */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Lokasi Kampus Terdekat</h3>
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="bg-orange-50 p-3 rounded-full text-orange-600"><Building size={24} /></div>
              <div>
                <p className="font-bold text-gray-800">{tempat.kampus.nama_kampus}</p>
                <p className="text-sm text-gray-500 font-medium">{tempat.kampus.alamat_kampus}</p>
              </div>
            </div>
          </div>

          {/* Fasilitas */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Fasilitas Tersedia</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tempat.fasilitas.map((item: any) => (
                <div key={item.fasilitas.id_fasilitas} className="flex items-center gap-2 text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                  <span className="font-bold text-sm text-gray-600">{item.fasilitas.nama_fasilitas}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ulasan/Review */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
              <MessageSquare size={20} /> Ulasan & Rating
            </h3>
            <div className="space-y-4">
              {hasReviews ? (
                reviews.map((rev: any) => (
                  <div key={rev.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold border border-yellow-100">
                        <Star size={12} className="fill-yellow-700" /> {rev.rating}
                      </div>
                      {rev.voucher && (
                        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-wider bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                          <Ticket size={12} /> {rev.voucher}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 font-medium italic">"{rev.review}"</p>
                    <p className="text-[10px] text-gray-400 mt-3 uppercase font-black tracking-widest text-right">— {rev.name}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-sm">Belum ada ulasan untuk tempat ini.</p>
              )}
            </div>

            {/* FORM TULIS ULASAN */}
            <div className="mt-8">
              <ReviewForm tempatId={id} />
            </div>
          </div>
          
        </div>

        {/* Kolom Kanan: Sidebar Aksi */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <FavoriteActionCard tempatId={id} />
          </div>
        </div>

      </div>
    </main>
  );
}
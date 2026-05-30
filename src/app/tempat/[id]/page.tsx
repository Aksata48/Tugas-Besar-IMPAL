import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Star, ArrowLeft, Wallet, Building, CheckCircle2, MessageSquare, UtensilsCrossed, BookOpen } from "lucide-react";
import FavoriteActionCard from "./FavoriteActionCard";
import ReviewForm from "@/app/detailtempat/reviewfrom";
import StatusOperasional from "@/app/detailtempat/statusOperasional";
import TempatMap from "@/components/Map";
import EstimasiJarak from "@/app/detailtempat/estimasiJarak";
import Footer from "@/components/Footer";
import SeatingPreview from "./SeatingPreview";

export default async function DetailTempatPage({ params }: { params: Promise<{ id: string }> }) {

  const resolvedParams = await params;
  const id = resolvedParams.id;

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
      places: true, // Ambil data ulasan/review untuk rating
      mejas: true,  // Ambil data meja untuk pratinjau tata letak visual
    },
  });

  if (!tempat) {
    notFound();
  }

  const reviews = tempat.places || [];
  const hasReviews = reviews.length > 0;
  const displayRating = hasReviews
    ? (reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "New";

  const kampusData = tempat.kampus as any;
  const kampusLat: number = typeof kampusData.latitude === "number" ? kampusData.latitude : -6.9731;
  const kampusLng: number = typeof kampusData.longitude === "number" ? kampusData.longitude : 107.6306;
  const tempatLat: number = typeof tempat.latitude === "number" ? tempat.latitude : -6.9175;
  const tempatLng: number = typeof tempat.longitude === "number" ? tempat.longitude : 107.6191;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* HEADER / GAMBAR UTAMA */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <Image
          src={tempat.gambar || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop"}
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
            <StatusOperasional
              buka={tempat.waktu_buka}
              tutup={tempat.waktu_tutup}
            />
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

        {/* KOLOM KIRI */}
        <div className="md:col-span-2 space-y-8">

          {/* Card Info Dasar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Clock size={24} /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Jam Operasional</p>
                <p className="text-lg font-extrabold text-gray-800">{tempat.jam_buka}</p>
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

          {/* Lokasi Kampus Terdekat + Estimasi Jarak */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Lokasi Kampus Terdekat</h3>
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="bg-orange-50 p-3 rounded-full text-orange-600"><Building size={24} /></div>
              <div>
                <p className="font-bold text-gray-800">{tempat.kampus.nama_kampus}</p>
                <p className="text-sm text-gray-500 font-medium">{tempat.kampus.alamat_kampus}</p>
              </div>
            </div>

            <EstimasiJarak
              kampusLat={kampusLat}
              kampusLng={kampusLng}
              tempatLat={tempatLat}
              tempatLng={tempatLng}
              namaKampus={tempat.kampus.nama_kampus}
            />
          </div>

          {/* Lokasi Map */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Lokasi</h3>
            <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative">
              <TempatMap
                lat={tempatLat}
                lng={tempatLng}
                nama={tempat.nama_tempat}
              />
            </div>
          </div>

          {/* Fasilitas */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Fasilitas Tersedia</h3>
            {tempat.fasilitas && tempat.fasilitas.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {tempat.fasilitas.map((item: any) => (
                  <div key={item.fasilitas.id_fasilitas} className="flex items-center gap-2 text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                    <span className="font-bold text-sm text-gray-600">{item.fasilitas.nama_fasilitas}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Belum ada informasi fasilitas khusus dari pengelola tempat.</p>
            )}
          </div>

          {/* Menu & Andalan Kafe */}
          {(tempat.menu_text || tempat.menu_gambar) && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <UtensilsCrossed size={20} className="text-orange-500" /> Menu & Andalan Kafe
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                {tempat.menu_text && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-gray-700 text-sm flex items-center gap-1.5">
                      <BookOpen size={16} className="text-blue-500" /> Rekomendasi Menu
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-150/50">
                      {tempat.menu_text.trim().startsWith("[") ? (
                        (() => {
                          try {
                            const parsedItems = JSON.parse(tempat.menu_text);
                            if (Array.isArray(parsedItems)) {
                              return (
                                <div className="space-y-3">
                                  {parsedItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start border-b border-gray-200/60 pb-2.5 last:border-b-0 last:pb-0">
                                      <div className="space-y-0.5">
                                        <p className="font-bold text-xs text-gray-800">{item.name}</p>
                                        {item.description && (
                                          <p className="text-[10px] text-gray-500 font-medium">{item.description}</p>
                                        )}
                                      </div>
                                      <span className="text-xs font-extrabold text-green-600 shrink-0">
                                        Rp {Number(item.price).toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                          } catch (e) {
                            console.error(e);
                          }
                          return (
                            <p className="text-gray-600 text-sm whitespace-pre-line font-medium leading-relaxed">
                              {tempat.menu_text}
                            </p>
                          );
                        })()
                      ) : (
                        <p className="text-gray-600 text-sm whitespace-pre-line font-medium leading-relaxed">
                          {tempat.menu_text}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {tempat.menu_gambar && (
                  <div className="space-y-3 flex flex-col">
                    <h4 className="font-extrabold text-gray-700 text-sm flex items-center gap-1.5">
                      🖼️ Foto Daftar Menu
                    </h4>
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 flex-grow hover:shadow-md transition duration-300">
                      <Image
                        src={tempat.menu_gambar}
                        alt="Foto Daftar Menu"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tata Letak Kursi Preview */}
          <SeatingPreview mejas={tempat.mejas} />

          {/* Ulasan & Rating */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
              <MessageSquare size={20} /> Ulasan & Rating
            </h3>
            <ReviewForm tempatId={id} />
          </div>

        </div>
        {/* END KOLOM KIRI */}

        {/* KOLOM KANAN: Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-4">
            <FavoriteActionCard
              tempatId={id}
              lat={tempatLat}
              lng={tempatLng}
            />
            {/* FIX ERROR TYPE: Memberikan fallback "" atau string operasional jika null */}
            <Link
              href={`/booking?id=${id}&nama=${encodeURIComponent(tempat.nama_tempat || "")}&jam=${encodeURIComponent(tempat.jam_buka || "08:00 - 22:00")}`}
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-2xl font-bold shadow-sm transition"
            >
              Booking Tempat
            </Link>
          </div>
        </div>
        {/* END KOLOM KANAN */}

      </div>
      {/* END KONTEN UTAMA */}
        
        <Footer />
    </main>
  );
}
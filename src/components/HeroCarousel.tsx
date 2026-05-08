"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Sparkles } from "lucide-react";

// Kumpulan URL gambar kualitas tinggi untuk mempercantik UI
// Nantinya bisa diganti dengan field 'image_url' dari database jika sudah ada
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521017430209-a6af30f48d27?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?q=80&w=1200&auto=format&fit=crop"
];

export default function HeroCarousel({ tempatList }: { tempatList: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === tempatList.length - 1 ? 0 : prev + 1));
  }, [tempatList.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? tempatList.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (tempatList.length === 0) return;
    // Timer bergeser otomatis setiap 5 Detik
    const timer = setInterval(() => {
      nextSlide();
    }, 5000); 
    return () => clearInterval(timer);
  }, [nextSlide, tempatList.length]);

  if (!tempatList || tempatList.length === 0) return null;

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl mb-12 group">
      
      {/* Container Slide */}
      <div className="relative w-full h-full">
        {tempatList.map((tempat, index) => (
          <div
            key={tempat.id_tempat}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={HERO_IMAGES[index % HERO_IMAGES.length]}
              alt={tempat.nama_tempat}
              fill
              priority={index === 0}
              className="object-cover"
            />
            {/* Gradasi Hitam agar teks terbaca jelas */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>

            {/* Konten Teks di atas Gambar */}
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1 bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  <Sparkles size={12} /> Rekomendasi
                </span>
                <span className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-3 py-1.5 rounded-full uppercase shadow-sm">
                  {tempat.kategori?.[0]?.kategori?.nama_kategori || "Cafe"}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-lg tracking-tight">
                {tempat.nama_tempat}
              </h2>
              <p className="flex items-center gap-2 text-sm md:text-base font-medium text-gray-200 mb-6 max-w-2xl line-clamp-1">
                <MapPin size={18} className="shrink-0" /> {tempat.alamat}
              </p>
              <Link href={`/tempat/${tempat.id_tempat}`} className="inline-block bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all shadow-lg transform hover:-translate-y-0.5">
                Lihat Detail
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Geser Kiri/Kanan (Muncul saat di-hover) */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-white/40 transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-white/40 transition-all"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indikator Titik (Dots) di pojok kanan bawah */}
      <div className="absolute bottom-8 right-8 z-20 flex gap-2">
        {tempatList.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-10 bg-blue-500 shadow-lg" : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
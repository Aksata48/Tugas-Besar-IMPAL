"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Star, ChevronLeft, ChevronRight, LayoutGrid, Coffee, Beer, Utensils, Laptop, Store } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Footer from "./Footer"; 

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521017430209-a6af30f48d27?q=80&w=1600&auto=format&fit=crop"
];

const CATEGORIES = [
  { name: "Semua", icon: LayoutGrid },
  { name: "Kafe", icon: Coffee },
  { name: "Warkop", icon: Beer },
  { name: "Restoran", icon: Utensils },
  { name: "Workspace", icon: Laptop },
];

export default function HomeClient({ tempatList }: { tempatList: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentIndex, setCurrentIndex] = useState(0);

  // =====================================================
  // ROLE-BASED GUARD: Jika OWNER masuk ke Homepage,
  // langsung redirect ke /owner/dashboard.
  // =====================================================
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        if (userData?.role === "OWNER") {
          router.replace("/owner/dashboard");
        }
      } catch {
        // localStorage corrupt → biarkan
      }
    }
  }, [router]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === HERO_IMAGES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? HERO_IMAGES.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const filteredData = tempatList.filter((tempat) => {
    const matchSearch = 
      tempat.nama_tempat.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tempat.alamat.toLowerCase().includes(searchQuery.toLowerCase());
    
    const categoryName = tempat.kategori[0]?.kategori.nama_kategori || 'Lainnya';
    const matchCategory = activeCategory === "Semua" || categoryName === activeCategory;
    
    return matchSearch && matchCategory;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full max-w-[1600px] mx-auto h-[550px] md:h-[600px] sm:rounded-b-[40px] xl:rounded-[40px] xl:mt-4 overflow-hidden shadow-2xl group">
        {HERO_IMAGES.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
            }`}
          >
            <Image src={src} alt="NongkiYuk Hero" fill priority={index === 0} className="object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gray-900/60 z-10"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-20">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">
            Temukan Tempat Nongkrong Favoritmu
          </h1>
          <p className="text-gray-200 text-sm md:text-lg mb-10 max-w-2xl drop-shadow-md font-medium">
            Berdasarkan preferensi fasilitas dan budget kantong Anda. Cari tempat kerja, nugas, atau sekadar kopi santai.
          </p>
          <div className="w-full max-w-3xl bg-white p-2 rounded-full shadow-2xl flex items-center gap-2 mb-8 transform transition-all focus-within:scale-[1.02] focus-within:ring-4 focus-within:ring-blue-500/30">
            <div className="bg-gray-100 p-3.5 rounded-full text-gray-500 ml-1 flex-shrink-0">
              <Search size={24} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tempat atau lokasi..." 
              className="flex-1 bg-transparent border-none outline-none px-3 text-gray-800 font-medium text-lg min-w-0" 
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-extrabold transition-colors shadow-lg flex-shrink-0">
              Cari
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 backdrop-blur-md shadow-lg border border-white/20 ${
                  activeCategory === cat.name
                    ? "bg-white text-blue-700 scale-105"
                    : "bg-white/10 text-white hover:bg-white/30 hover:scale-105"
                }`}
              >
                <cat.icon size={18} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all border border-white/20">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all border border-white/20">
          <ChevronRight size={24} />
        </button>
      </section>

      {/* 2. DAFTAR TEMPAT SECTION */}
      <section className="px-6 md:px-8 py-16 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 border-b border-gray-200 pb-5 gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight text-center md:text-left">Rekomendasi Untukmu</h3>
            <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">
              Menampilkan {filteredData.length} tempat {activeCategory !== "Semua" && `kategori ${activeCategory}`}
            </p>
          </div>
          <Link href="/tempat" className="text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors">
            Lihat Semua Tempat
          </Link>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm px-4">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Yah, tempat tidak ditemukan.</h3>
            <button onClick={() => {setSearchQuery(""); setActiveCategory("Semua");}} className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full font-bold">Reset Pencarian</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredData.map((tempat) => (
              <Link 
                href={`/tempat/${tempat.id_tempat}?nama=${encodeURIComponent(tempat.nama_tempat)}&jam=${encodeURIComponent(tempat.jam_buka)}`} 
                key={tempat.id_tempat} 
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 p-3"
              >
                <div className="relative h-48 md:h-52 w-full rounded-xl overflow-hidden mb-4">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      {tempat.kategori[0]?.kategori.nama_kategori || 'Nongki'}
                    </span>
                  </div>
                  <Image src={tempat.gambar || `https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=500&auto=format&fit=crop`} alt={tempat.nama_tempat} fill className="object-cover group-hover:scale-110 transition duration-700 ease-in-out" />
                </div>
                <div className="space-y-2 flex-grow px-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{tempat.nama_tempat}</h4>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                      <Star size={12} className="fill-yellow-500 text-yellow-500" />
                      <span className="text-[11px] font-bold text-yellow-700">4.5</span>
                    </div>
                  </div>
                  <p className="flex items-center gap-1.5 text-gray-500 text-sm truncate">
                    <MapPin size={14} className="shrink-0 text-gray-400" /> {tempat.alamat}
                  </p>
                  <div className="flex justify-between items-center pt-4 mt-3 border-t border-gray-50">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Harga</p>
                      <p className="text-sm font-extrabold text-blue-600">{tempat.kisaran_harga}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Jam Buka</p>
                      <p className="text-sm font-bold text-gray-800">{tempat.jam_buka}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. CALL TO ACTION SECTION */}
      <section className="px-6 md:px-8 pb-20 pt-10">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[40px] p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-500/30 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm border border-white/10">
                <Store size={16} /> Business Partnership
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                Punya Kafe atau Warkop Sendiri?
              </h2>
              <p className="text-blue-100 text-lg mb-8 font-medium">
                Jangkau lebih banyak mahasiswa dan pelanggan dengan mendaftarkan tempat bisnismu di NongkiYuk. 
                Mudah, cepat, dan 100% GRATIS!
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link href="/register" className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                  Daftar Sebagai Mitra
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block relative w-[400px] h-[300px]">
                <Image 
                  src="https://images.unsplash.com/photo-1463797221720-6b07e6426c24?q=80&w=800&auto=format&fit=crop" 
                  alt="Business Partner" 
                  fill 
                  className="object-cover rounded-3xl shadow-2xl border-4 border-white/10 rotate-3 scale-110"
                />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, HeartCrack, Filter, MapPin, Star, Heart, Clock, Store, ChevronRight } from "lucide-react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      const extractedId = parsedData?.id || parsedData?.user?.id || parsedData?.data?.id;
      if (extractedId) {
        setUserId(extractedId);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetch(`/api/favorites?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.favorites) {
            setFavorites(data.favorites.map((fav: any) => fav.tempat));
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Gagal load favorites:", err);
          setIsLoading(false);
        });
    }
  }, [userId]);

  const availableCategories = [
    "Semua",
    ...Array.from(
      new Set(
        favorites.map((tempat) => tempat.kategori?.[0]?.kategori?.nama_kategori || 'Lainnya')
      )
    )
  ];

  const filteredFavorites = favorites.filter((tempat) => {
    const matchesSearch = tempat.nama_tempat.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryName = tempat.kategori?.[0]?.kategori?.nama_kategori || 'Lainnya';
    const matchesCategory = selectedCategory === "Semua" || categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRemoveFavorite = async (tempatId: string) => {
    try {
      setFavorites(prev => prev.filter(t => t.id_tempat !== tempatId));
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tempatId })
      });
    } catch (error) {
      console.error("Gagal menghapus dari favorit", error);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
          <div className="h-6 w-96 bg-gray-200 rounded-lg animate-pulse mb-10"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="w-full h-48 bg-gray-200 rounded-xl animate-pulse mb-4"></div>
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="flex justify-between">
                   <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                   <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-6 text-center">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
          <HeartCrack size={72} className="text-gray-300 mb-6 mx-auto" />
          <h2 className="text-3xl font-black text-gray-900 mb-2">Belum Login?</h2>
          <p className="text-gray-500 mb-8 font-medium">Masuk sekarang untuk menyimpan tempat nongkrong impianmu agar tidak hilang.</p>
          <Link href="/login" className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
            Masuk ke Akun <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION (PREMIUM DARK GRADIENT) */}
        <div className="relative rounded-[2.5rem] p-8 md:p-12 mb-12 overflow-hidden shadow-2xl shadow-blue-900/10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-slate-900 z-0"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 z-0"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 z-0"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-blue-200 border border-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-inner">
                <Heart size={14} className="fill-blue-400 text-blue-400" /> Koleksi Pribadi
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
                Tempat Favorit
              </h1>
              <p className="text-blue-100/80 text-lg font-medium leading-relaxed max-w-lg">
                Ada <span className="text-white font-bold">{favorites.length} destinasi</span> nongkrong yang menunggu untuk dikunjungi.
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex-1 max-w-md">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-blue-200/60 group-focus-within:text-white transition-colors duration-300">
                  <Search size={22} />
                </div>
                <input
                  type="text"
                  placeholder="Cari kafe, warkop, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/10 shadow-inner text-white placeholder-blue-100/50 font-medium transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* FILTER KATEGORI */}
          {favorites.length > 0 && (
            <div className="relative z-10 flex items-center gap-3 mt-10 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2 text-blue-200/70 mr-2 shrink-0 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
                <Filter size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">Filter</span>
              </div>
              {availableCategories.map((kategori, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(kategori)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 backdrop-blur-md ${
                    selectedCategory === kategori
                      ? "bg-white text-blue-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105 border border-white"
                      : "bg-white/10 border border-white/10 text-blue-50 hover:bg-white/20 hover:border-white/30"
                  }`}
                >
                  {kategori}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* HANDLING TAMPILAN KOSONG */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center border border-gray-100 shadow-sm mt-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Store size={200} /></div>
            
            <div className="relative z-10 max-w-lg mx-auto">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <HeartCrack size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                {(searchQuery || selectedCategory !== "Semua") ? "Tidak ada hasil." : "Wah, koleksimu masih kosong!"}
              </h3>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                {(searchQuery || selectedCategory !== "Semua")
                  ? `Tidak ada tempat yang cocok dengan pencarian atau filter "${selectedCategory}".` 
                  : "Mulai jelajahi berbagai kafe dan warkop menarik, lalu simpan ke favoritmu."}
              </p>
              
              {(!searchQuery && selectedCategory === "Semua") && (
                <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1">
                  Eksplor Tempat Sekarang <Search size={18} />
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* GRID MENAMPILKAN KARTU FAVORIT */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredFavorites.map((tempat, index) => (
              <div key={tempat.id_tempat} className="group relative bg-white rounded-[1.5rem] border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFavorite(tempat.id_tempat);
                  }}
                  title="Hapus dari Favorit"
                  className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg text-red-500 hover:bg-red-50 hover:scale-110 transition-all duration-300"
                >
                  <Heart size={20} className="fill-red-500" />
                </button>

                <Link href={`/tempat/${tempat.id_tempat}`} className="flex flex-col h-full p-3">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-5">
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
                        {tempat.kategori?.[0]?.kategori?.nama_kategori || 'Nongki'}
                      </span>
                    </div>
                    <Image 
                      src={`https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=500&auto=format&fit=crop`} 
                      alt={tempat.nama_tempat}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={index < 4}
                      className="object-cover group-hover:scale-110 transition duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="px-2 flex-grow flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                        {tempat.nama_tempat}
                      </h4>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 shrink-0">
                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                        <span className="text-[11px] font-bold text-yellow-700">4.5</span>
                      </div>
                    </div>
                    
                    <p className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                      <MapPin size={14} className="shrink-0 text-blue-500" /> 
                      <span className="truncate">{tempat.alamat}</span>
                    </p>

                    {/* PERBAIKAN BUG WAKTU & HARGA */}
                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-1">Mulai dari</p>
                        <p className="text-sm font-extrabold text-gray-900 line-clamp-2 leading-tight">
                          {tempat.kisaran_harga}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-1">Buka</p>
                        <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100">
                          <Clock size={12} className="text-gray-400" /> 
                          <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">
                            {tempat.jam_buka}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
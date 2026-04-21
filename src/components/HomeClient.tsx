"use client";
import { useState } from "react";
import { Search, MapPin, Clock, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomeClient({ tempatList }: { tempatList: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = ['Semua', 'Kafe', 'Warkop', 'Restoran', 'Workspace'];

  // Logika Filter Data
  const filteredData = tempatList.filter((tempat) => {
    const matchSearch = 
      tempat.nama_tempat.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tempat.alamat.toLowerCase().includes(searchQuery.toLowerCase());
    
    const categoryName = tempat.kategori[0]?.kategori.nama_kategori || 'Lainnya';
    const matchCategory = activeCategory === "Semua" || categoryName === activeCategory;
    
    return matchSearch && matchCategory;
  });

  return (
    <main className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="px-8 py-16 max-w-7xl mx-auto text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Temukan Tempat Nongkrong Favoritmu
        </h2>
        <p className="text-gray-500 mt-4 text-lg max-w-2xl">
          Berdasarkan preferensi fasilitas dan budget kantong Anda. Cari tempat kerja, 
          nugas, atau sekadar kopi santai.
        </p>

        {/* SEARCH BAR & FILTER INTERAKTIF */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex-1 flex items-center gap-3 px-4 w-full">
            <Search className="text-blue-600" size={24} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tempat atau lokasi..." 
              className="w-full py-3 outline-none text-gray-700 font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-2 px-4 py-2 border-t md:border-t-0 md:border-l border-gray-100">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  activeCategory === cat ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LIST TEMPAT - HASIL FILTER */}
      <section className="px-8 py-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Rekomendasi Untukmu</h3>
            <p className="text-gray-500 text-sm">
              Menampilkan {filteredData.length} tempat
            </p>
          </div>
          <Link href="/tempat" className="text-blue-600 font-bold hover:underline">Lihat Semua</Link>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Yah, tempat yang kamu cari tidak ditemukan.</p>
            <button onClick={() => {setSearchQuery(""); setActiveCategory("Semua");}} className="mt-4 text-blue-600 font-bold hover:underline">Reset Pencarian</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredData.map((tempat, index) => (
              // 🔥 PERBAIKAN: Mengubah <div> menjadi <Link> agar bisa diklik ke halaman detail
              <Link 
                href={`/tempat/${tempat.id_tempat}`} 
                key={tempat.id_tempat} 
                className="group cursor-pointer flex flex-col bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all p-3"
              >
                {/* Gambar / Card */}
                <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {tempat.kategori[0]?.kategori.nama_kategori || 'Nongki'}
                    </span>
                  </div>
                  
                  <Image 
                    src={`https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=500&auto=format&fit=crop`} 
                    alt={tempat.nama_tempat}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    priority={index < 4}
                    className="object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Info Detail */}
                <div className="space-y-2 flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition truncate pr-2">
                      {tempat.nama_tempat}
                    </h4>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md shrink-0">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-700">4.5</span>
                    </div>
                  </div>
                  
                  <p className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin size={14} className="shrink-0" /> <span className="truncate">{tempat.alamat}</span>
                  </p>

                  <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Harga</p>
                      <p className="text-sm font-extrabold text-blue-600">{tempat.kisaran_harga}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Jam Buka</p>
                      <p className="text-sm font-bold text-gray-800 flex items-center gap-1 justify-end">
                        <Clock size={12} /> {tempat.jam_buka}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🔥 PERBAIKAN: Mengembalikan tombol Lihat Detail */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="w-full text-center py-2 bg-blue-50 text-blue-600 font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                    Lihat Detail
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER SEDERHANA */}
      <footer className="mt-20 py-10 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm">© 2026 NongkiYuk. Dikembangkan oleh Tim Aksata48.</p>
      </footer>
    </main>
  );
}
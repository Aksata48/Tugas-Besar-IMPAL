"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PlaceCard from "@/components/PlaceCard"; 
import { Search, HeartCrack, Loader2, Filter } from "lucide-react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua"); // State untuk filter kategori
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Ambil User ID dari localStorage
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

  // 2. Fetch data semua favorit dari API
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

  // 3. Ekstrak kategori unik dari daftar favorit secara dinamis
  const availableCategories = [
    "Semua",
    ...Array.from(
      new Set(
        favorites.map((tempat) => tempat.kategori?.[0]?.kategori?.nama_kategori || 'Nongkrong')
      )
    )
  ];

  // 4. Logika Filter Berlapis (Search Bar + Kategori)
  const filteredFavorites = favorites.filter((tempat) => {
    const matchesSearch = tempat.nama_tempat.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryName = tempat.kategori?.[0]?.kategori?.nama_kategori || 'Nongkrong';
    const matchesCategory = selectedCategory === "Semua" || categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Memuat tempat favoritmu...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-6 text-center">
        <HeartCrack size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Belum Login</h2>
        <p className="text-gray-500 mt-2 max-w-md">Silakan login terlebih dahulu untuk melihat daftar tempat nongkrong favorit Anda.</p>
        <Link href="/" className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header dan Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Tempat Favoritku</h1>
            <p className="text-gray-500 mt-1 font-medium">Daftar tempat nongkrong yang sudah kamu simpan.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari dari favoritmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* Deretan Tombol Filter Kategori */}
        {favorites.length > 0 && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-gray-500 mr-2 shrink-0">
              <Filter size={18} />
              <span className="text-sm font-bold">Filter:</span>
            </div>
            {availableCategories.map((kategori, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(kategori)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === kategori
                    ? "bg-blue-600 text-white border-transparent"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-300"
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>
        )}

        {/* Handling Tampilan Kosong */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm mt-4">
            <HeartCrack size={56} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">
              {(searchQuery || selectedCategory !== "Semua") ? "Tempat tidak ditemukan" : "Belum ada favorit"}
            </h3>
            <p className="text-gray-500 mt-2">
              {(searchQuery || selectedCategory !== "Semua")
                ? `Tidak ada tempat favorit yang cocok dengan kata kunci atau filter "${selectedCategory}".` 
                : "Kamu belum menyimpan tempat apapun. Yuk cari tempat nongkrong asik!"}
            </p>
            {(!searchQuery && selectedCategory === "Semua") && (
              <Link href="/" className="inline-block mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
                Eksplor Tempat
              </Link>
            )}
          </div>
        ) : (
          /* Grid Menampilkan PlaceCard */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((tempat) => (
              <PlaceCard 
                key={tempat.id_tempat} 
                id={tempat.id_tempat}
                namaTempat={tempat.nama_tempat}
                kategori={tempat.kategori?.[0]?.kategori?.nama_kategori || 'Nongkrong'}
                alamat={tempat.alamat}
                jamBuka={tempat.jam_buka}
                kisaranHarga={tempat.kisaran_harga}
                rating={4.5} 
                gambar="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
"use client"; // Wajib ditambahkan agar halaman bisa interaktif

import { useState } from "react";
import Navbar from "@/components/Navbar";
import PlaceCard from "@/components/PlaceCard";
import FilterBar from "@/components/FilterBar";
import { daftarTempat } from "@/data/tempat";

export default function Home() {
  // Tempat menyimpan apa yang diketik dan diklik user
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  // Logika untuk menyaring data
  const tempatYangDitemukan = daftarTempat.filter((tempat) => {
    // 1. Cek kecocokan nama (abaikan huruf besar/kecil)
    const cocokNama = tempat.namaTempat.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Cek kecocokan kategori
    const cocokKategori = activeCategory === "Semua" || tempat.kategori === activeCategory;

    // Tampilkan hanya jika nama DAN kategori cocok
    return cocokNama && cocokKategori;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Temukan Tempat Nongkrong Favoritmu
          </h2>
          <p className="mt-2 text-gray-600">
            Berdasarkan preferensi fasilitas dan budget kantong mahasiswa.
          </p>
        </div>

        <FilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* Cek apakah ada data yang cocok */}
        {tempatYangDitemukan.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <span className="text-4xl block mb-4">🥲</span>
            <p>Maaf, tempat yang kamu cari tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tempatYangDitemukan.map((tempat) => (
              <PlaceCard
                key={tempat.id}
                id={tempat.id}
                namaTempat={tempat.namaTempat}
                kategori={tempat.kategori}
                alamat={tempat.alamat}
                jamBuka={tempat.jamBuka}
                kisaranHarga={tempat.kisaranHarga}
                rating={tempat.rating}
                gambar={tempat.gambar}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
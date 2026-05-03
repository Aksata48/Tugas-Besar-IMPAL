"use client";

import { useState, useEffect } from "react";

export default function FavoriteActionCard({ tempatId }: { tempatId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Ambil ID User langsung dari localStorage browser (Cara Paling Cepat & Aman)
  useEffect(() => {
    try {
      // Biasanya data login disimpan dengan key "user", "user-storage", atau semacamnya
      const storedUserData = localStorage.getItem("user"); 
      
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        // Sesuaikan dengan letak ID di objek user Anda
        const extractedId = parsedData?.id || parsedData?.user?.id || parsedData?.data?.id;
        
        if (extractedId) {
          setUserId(extractedId);
          console.log("✅ ID User ditemukan di localStorage:", extractedId);
        } else {
          console.log("⚠️ Data user ada di localStorage, tapi ID tidak ditemukan:", parsedData);
        }
      } else {
        console.log("ℹ️ Belum login (tidak ada data user di localStorage).");
      }
    } catch (error) {
      console.error("❌ Gagal membaca localStorage:", error);
    }
  }, []);

  // 2. Cek status favorit ke database (hanya jalan kalau userId sudah dapat)
  useEffect(() => {
    if (userId && tempatId) {
      fetch(`/api/favorites?userId=${userId}&tempatId=${tempatId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.isFavorite !== undefined) {
            setIsFavorite(data.isFavorite);
          }
        })
        .catch((err) => console.error("Gagal cek favorit:", err));
    }
  }, [userId, tempatId]);

  // 3. Eksekusi tombol
  const handleFavoriteClick = async () => {
    if (!userId) {
      alert("Silakan login terlebih dahulu untuk menyimpan tempat favorit.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tempatId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsFavorite(data.isFavorite);
      } else {
        alert(data.error || "Gagal mengubah status favorit");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link lokasi berhasil disalin!");
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
      <h3 className="font-bold text-lg mb-2 text-gray-800">Ingin ke sini?</h3>
      <p className="text-gray-500 text-sm mb-5">
        Simpan tempat ini atau bagikan ke teman nongkrongmu.
      </p>
      
      <button 
        onClick={handleFavoriteClick}
        disabled={isLoading}
        className={`w-full py-2.5 rounded-lg font-semibold mb-3 transition-colors flex items-center justify-center gap-2 ${
          isFavorite 
            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isLoading ? "Memproses..." : (isFavorite ? "Hapus dari Favorit" : "Simpan ke Favorit")}
      </button>

      <button 
        onClick={handleShareClick}
        className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
      >
        Bagikan Lokasi
      </button>
      
      <p className="text-center text-xs text-gray-400 mt-4 font-mono uppercase">
        REF_ID: {tempatId}
      </p>
    </div>
  );
}
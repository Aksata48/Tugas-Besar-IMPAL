"use client";

import { useState, useEffect } from "react";

export default function FavoriteActionCard({ tempatId, lat, lng }: { tempatId: string; lat: number; lng: number }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false); // Dipindah ke atas agar rapi

  // 1. Ambil ID User dari localStorage
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem("user"); 
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        const extractedId = parsedData?.id || parsedData?.user?.id || parsedData?.data?.id;
        
        if (extractedId) {
          setUserId(extractedId);
          console.log("✅ ID User ditemukan:", extractedId);
        }
      }
    } catch (error) {
      console.error("❌ Gagal membaca localStorage:", error);
    }
  }, []);

  // 2. Cek status favorit ke database
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

  // 3. Fungsi Tambah/Hapus Favorit
  const handleFavoriteClick = async () => {
    if (!userId) {
      alert("Silakan login terlebih dahulu untuk menyimpan favorit.");
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

  // 4. Fungsi Bagikan Lokasi (Google Maps)
  const handleShareClick = async () => {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    try {
      await navigator.clipboard.writeText(googleMapsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback jika clipboard gagal
      alert(`Link lokasi: ${googleMapsUrl}`);
    }
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
        {isLoading ? "Memproses..." : (isFavorite ? "❤️ Hapus dari Favorit" : "⭐ Simpan ke Favorit")}
      </button>

      <button 
       onClick={handleShareClick}
       className={`w-full py-2.5 border rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
         copied 
           ? "border-green-200 bg-green-50 text-green-600" 
           : "border-gray-300 text-gray-700 hover:bg-gray-50"
       }`}
      >
       {copied ? "✓ Link Maps Disalin!" : "🔗 Bagikan Lokasi"}
      </button>

    </div>
  );
}
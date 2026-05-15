"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2, X } from "lucide-react";

// Data dummy ulasan
const DUMMY_REVIEWS = [
  {
    id: "1",
    name: "Rizky Aditya",
    rating: 5,
    review: "Tempatnya nyaman banget buat ngerjain tugas! WiFi kenceng, AC dingin, dan colokan ada di mana-mana. Highly recommended buat anak Telkom!",
    waktu: "2 hari lalu",
    avatar: "RA",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    rating: 4,
    review: "Suasananya cozy, kopinya enak. Agak rame di jam siang tapi masih kondusif buat kerja. Harga juga reasonable.",
    waktu: "5 hari lalu",
    avatar: "SN",
  },
  {
    id: "3",
    name: "Bima Prasetyo",
    rating: 4,
    review: "Sering nongki di sini bareng temen-temen. Tempatnya luas, ada area indoor dan outdoor. WiFi stabil sampai malem.",
    waktu: "1 minggu lalu",
    avatar: "BP",
  },
  {
    id: "4",
    name: "Aulia Rahma",
    rating: 5,
    review: "Paling suka sama vibes-nya, estetik buat foto juga. Menu makanannya variatif dan harga mahasiswa banget!",
    waktu: "2 minggu lalu",
    avatar: "AR",
  },
];

// Komponen notifikasi toast
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl">
      <CheckCircle2 size={22} className="shrink-0" />
      <p className="font-semibold text-sm whitespace-nowrap">{message}</p>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition">
        <X size={18} />
      </button>
    </div>
  );
}

export default function ReviewForm({ tempatId }: { tempatId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    setIsSubmitting(true);

    // Simulasi delay kirim ke server
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Tambah ulasan baru ke list (lokal)
    const newReview = {
      id: Date.now().toString(),
      name: "Kamu",
      rating,
      review: comment,
      waktu: "Baru saja",
      avatar: "KM",
    };

    setReviews((prev) => [newReview, ...prev]);
    setRating(0);
    setComment("");
    setIsSubmitting(false);
    setShowToast(true);

    // Auto-hide toast setelah 3 detik
    setTimeout(() => setShowToast(false), 3000);
  };

  // Hitung rata-rata rating
  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="space-y-6">

      {/* Ringkasan Rating */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-6">
        <div className="text-center">
          <p className="text-5xl font-extrabold text-gray-800">{avgRating}</p>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={
                  s <= Math.round(Number(avgRating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-200"
                }
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{reviews.length} ulasan</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = (count / reviews.length) * 100;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2">{star}</span>
                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-4 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* List Ulasan */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-extrabold text-sm flex items-center justify-center shrink-0">
              {rev.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-gray-800 text-sm">{rev.name}</p>
                <p className="text-[10px] text-gray-400">{rev.waktu}</p>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className={
                      s <= rev.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{rev.review}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form Tulis Ulasan */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Tulis Ulasanmu</h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bintang Rating */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-500 mr-1">Rating:</p>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={`${
                    (hover || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-gray-500 ml-1">
                {["", "Buruk", "Kurang", "Cukup", "Bagus", "Luar Biasa!"][rating]}
              </span>
            )}
          </div>

          {/* Textarea */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ceritakan pengalamanmu di sini (suasana, menu, atau wifi)..."
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] transition-all resize-none"
            required
          />

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={rating === 0 || !comment.trim() || isSubmitting}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send size={18} />
                Kirim Ulasan
              </>
            )}
          </button>
        </form>
      </div>

      {/* Toast Notifikasi */}
      {showToast && (
        <Toast
          message="Ulasan berhasil dikirim! Terima kasih 🎉"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
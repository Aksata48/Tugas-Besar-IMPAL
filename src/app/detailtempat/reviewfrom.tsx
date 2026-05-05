"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";

export default function ReviewForm({ tempatId }: { tempatId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Di sini nanti kamu panggil API route untuk simpan ke database
    console.log({ tempatId, rating, comment });
    alert("Ulasan berhasil dikirim! (Simulasi)");
    setRating(0);
    setComment("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-gray-800 mb-4">Tulis Ulasanmu</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Rating Bintang */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-500 mr-2">Rating:</p>
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
        </div>

        {/* Input Teks Ulasan */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ceritakan pengalamanmu di sini (suasana, menu, atau wifi)..."
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] transition-all"
          required
        />

        <button
          type="submit"
          disabled={rating === 0 || !comment}
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          <Send size={18} />
          Kirim Ulasan
        </button>
      </form>
    </div>
  );
}
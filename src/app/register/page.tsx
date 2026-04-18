"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    nomor_telepon: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman reload
    setLoading(true);

    try {
      // Mengirim data ke API Route yang kita buat di Langkah 2
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Pendaftaran berhasil! Silakan Login.");
        router.push("/login"); // Otomatis pindah ke halaman login
      } else {
        alert(data.error); // Tampilkan pesan error jika email sudah ada
      }
    } catch (error) {
      alert("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Daftar NongkiYuk</h1>
          <p className="text-gray-500">Buat akun untuk mulai mencari tempat favoritmu.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              required
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" 
              placeholder="Ryan Maulana"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" 
              placeholder="mahasiswa@telkomuniversity.ac.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input 
              type="tel" 
              required
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" 
              placeholder="08123456789"
              value={formData.nomor_telepon}
              onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold text-lg py-3 rounded-xl mt-6 hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:bg-gray-400"
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Sudah punya akun? <Link href="/login" className="text-blue-600 font-bold hover:underline">Masuk di sini</Link>
        </p>

        {/* --- Area Khusus Login Pemilik --- */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Apakah Anda pengelola tempat nongkrong?</p>
          <Link href="/admin" className="inline-block bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition">
            Login sebagai Pemilik
          </Link>
        </div>
      </div>
    </div>
  );
}
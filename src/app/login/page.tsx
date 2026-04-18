"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        // Simpan data user ke browser
        localStorage.setItem("user", JSON.stringify(data.user));
        // Redirect ke beranda
        router.push("/");
        // Paksa refresh agar Navbar mendeteksi user baru
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        setError(data.message || "Email atau password salah");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Masuk ke NongkiYuk</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Kampus</label>
            <input 
              type="email" 
              required
              placeholder="nama@student.telkomuniversity.ac.id"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
          >
            Masuk Sekarang
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-gray-600">
          Belum punya akun? <Link href="/register" className="text-blue-600 font-bold hover:underline">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
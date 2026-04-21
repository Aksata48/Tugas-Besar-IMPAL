"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, User, ArrowLeft } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Pilih Role, Step 2: Form
  const [role, setRole] = useState<"USER" | "OWNER">("USER");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState({ username: "", email: "", password: "", server: "" });
  const [isLoading, setIsLoading] = useState(false);

  const validateRealTime = (name: string, value: string) => {
    let errorMsg = "";
    if (name === "username" && value.length > 50) errorMsg = "Maksimal 50 karakter";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value) && value.length > 0) errorMsg = "Format email tidak valid";
    }
    if (name === "password") {
      const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!pwdRegex.test(value) && value.length > 0) errorMsg = "Minimal 8 karakter (huruf & angka)";
    }
    setErr(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username" && value.length > 50) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateRealTime(name, value);
    setErr(prev => ({ ...prev, server: "" }));
  };

  // Register Manual
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (err.email || err.password || err.username) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ ...formData, role }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setErr(prev => ({ ...prev, server: data.message || "Gagal mendaftar." }));
      }
    } catch (error) {
      setErr(prev => ({ ...prev, server: "Gagal terhubung ke server." }));
    } finally {
      setIsLoading(false);
    }
  };

  // Register / Login via Google
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErr(prev => ({ ...prev, server: "" }));
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential: credentialResponse.credential, role }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "OWNER") {
          router.push("/owner/dashboard");
        } else {
          router.push("/");
        }
        setTimeout(() => window.location.reload(), 100);
      } else {
        setErr(prev => ({ ...prev, server: data.message || "Gagal mendaftar via Google." }));
      }
    } catch (error) {
      setErr(prev => ({ ...prev, server: "Terjadi kesalahan saat verifikasi Google." }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-800">Daftar NongkiYuk</h2>
              <p className="text-gray-500 mt-2 text-sm">Pilih jenis akun yang ingin Anda buat</p>
            </div>
            
            <div className="grid gap-4 mt-8">
              <button onClick={() => { setRole("USER"); setStep(2); }} className="flex items-center p-5 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group text-left">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"><User size={24} /></div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-800">Pengguna Biasa</h3>
                  <p className="text-xs text-gray-500 mt-1">Cari tempat nongkrong & beri ulasan</p>
                </div>
              </button>

              <button onClick={() => { setRole("OWNER"); setStep(2); }} className="flex items-center p-5 border-2 border-gray-100 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition group text-left">
                <div className="bg-orange-100 p-3 rounded-full text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition"><Store size={24} /></div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-800">Pemilik Tempat</h3>
                  <p className="text-xs text-gray-500 mt-1">Daftarkan & kelola bisnis kafe Anda</p>
                </div>
              </button>
            </div>
            <p className="text-center mt-6 text-sm text-gray-600">Sudah punya akun? <Link href="/login" className="text-blue-600 font-bold hover:underline">Masuk di sini</Link></p>
          </div>
        )}

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6 font-medium transition">
              <ArrowLeft size={16} className="mr-1" /> Kembali
            </button>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Daftar Akun {role === "USER" ? "Pengguna" : "Pemilik"}</h2>
            <p className="text-center text-gray-500 text-sm mb-6">Gunakan Google untuk pendaftaran lebih cepat</p>

            {err.server && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-100">{err.server}</p>}

            {/* TOMBOL GOOGLE REGISTER */}
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErr(prev => ({ ...prev, server: "Gagal terhubung dengan Google" }))}
                theme="outline"
                shape="rectangular"
                width="320px"
              />
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-3 text-sm text-gray-400 font-medium">Atau daftar manual</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <input type="text" name="username" required value={formData.username} onChange={handleChange} placeholder="Contoh: ryanmaulana" className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 outline-none transition ${err.username ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} />
                {err.username && <p className="text-red-500 text-xs mt-1 font-medium">{err.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Aktif</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="email@contoh.com" className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 outline-none transition ${err.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} />
                {err.email && <p className="text-red-500 text-xs mt-1 font-medium">{err.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Minimal 8 karakter (huruf & angka)" className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 outline-none transition ${err.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} />
                {err.password && <p className="text-red-500 text-xs mt-1 font-medium">{err.password}</p>}
              </div>
              <button type="submit" disabled={!!(err.email || err.password || err.username) || isLoading} className={`w-full py-3 rounded-lg font-bold text-white transition mt-2 ${role === "OWNER" ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"} disabled:bg-gray-400`}>
                {isLoading ? "Memproses..." : "Buat Akun Sekarang"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, User, ArrowLeft } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"USER" | "OWNER">("USER");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [err, setErr] = useState({ email: "", password: "", server: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Validasi Real-Time persis seperti di form Register
  const validateRealTime = (name: string, value: string) => {
    let errorMsg = "";
    
    if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|yahoo\.co\.id|outlook\.com|hotmail\.com|icloud\.com)$/i;
      if (!emailRegex.test(value) && value.length > 0) {
        errorMsg = "Gunakan provider valid (contoh: @gmail.com, @yahoo.com)";
      }
    }
    
    if (name === "password") {
      const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,32}$/;
      if (!pwdRegex.test(value) && value.length > 0) {
        errorMsg = "Format password salah (8-32 karakter, huruf & angka)";
      }
    }
    
    setErr(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Mencegah input lebih dari batas maksimal
    if (name === "email" && value.length > 50) return;
    if (name === "password" && value.length > 32) return;

    setFormData(prev => ({ ...prev, [name]: value }));
    validateRealTime(name, value);
    setErr(prev => ({ ...prev, server: "" }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (err.email || err.password) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ ...formData, role }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      processLoginSuccess(res.ok, data);
    } catch (error) {
      setErr(prev => ({ ...prev, server: "Gagal terhubung ke server." }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErr(prev => ({ ...prev, server: "" }));
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential: credentialResponse.credential, role }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      processLoginSuccess(res.ok, data);
    } catch (error) {
      setErr(prev => ({ ...prev, server: "Terjadi kesalahan saat verifikasi Google." }));
    } finally {
      setIsLoading(false);
    }
  };

  const processLoginSuccess = (isOk: boolean, data: any) => {
    if (isOk) {
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "OWNER") {
        router.push("/owner/dashboard");
      } else {
        router.push("/");
      }
      setTimeout(() => window.location.reload(), 100);
    } else {
      setErr(prev => ({ ...prev, server: data.message || "Email atau password salah." }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-800">Masuk ke NongkiYuk</h2>
              <p className="text-gray-500 mt-2 text-sm">Masuk sebagai apa hari ini?</p>
            </div>
            
            <div className="grid gap-4 mt-8">
              <button onClick={() => { setRole("USER"); setStep(2); }} className="flex items-center p-5 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group text-left">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"><User size={24} /></div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-800">Pengguna Biasa</h3>
                  <p className="text-xs text-gray-500 mt-1">Lanjut mencari tempat nongkrong</p>
                </div>
              </button>

              <button onClick={() => { setRole("OWNER"); setStep(2); }} className="flex items-center p-5 border-2 border-gray-100 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition group text-left">
                <div className="bg-orange-100 p-3 rounded-full text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition"><Store size={24} /></div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-800">Pemilik Tempat</h3>
                  <p className="text-xs text-gray-500 mt-1">Masuk ke Dashboard Manajemen</p>
                </div>
              </button>
            </div>
            <p className="text-center mt-6 text-sm text-gray-600">Belum punya akun? <Link href="/register" className="text-blue-600 font-bold hover:underline">Daftar di sini</Link></p>
          </div>
        )}

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6 font-medium transition">
              <ArrowLeft size={16} className="mr-1" /> Kembali
            </button>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Login {role === "USER" ? "Pengguna" : "Pemilik"}</h2>
            <p className="text-center text-gray-500 text-sm mb-6">Gunakan akun Google atau email Anda</p>

            {err.server && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-100">{err.server}</div>}

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
              <span className="px-3 text-sm text-gray-400 font-medium">Atau dengan email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  required 
                  maxLength={50}
                  value={formData.email}
                  placeholder="email@gmail.com" 
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 outline-none transition ${err.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} 
                />
                {err.email && <p className="text-red-500 text-xs mt-1 font-medium">{err.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  required 
                  maxLength={32}
                  value={formData.password}
                  placeholder="••••••••" 
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 outline-none transition ${err.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} 
                />
                {err.password && <p className="text-red-500 text-xs mt-1 font-medium">{err.password}</p>}
              </div>
              <button 
                type="submit" 
                disabled={!!(err.email || err.password) || isLoading || !formData.email || !formData.password}
                className={`w-full py-3 rounded-lg font-bold text-white transition mt-2 shadow-md ${role === "OWNER" ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"} disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {isLoading ? "Memproses..." : "Masuk Sekarang"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
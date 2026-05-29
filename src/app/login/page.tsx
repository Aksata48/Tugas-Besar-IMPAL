"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, User, ArrowLeft, Mail, Lock, Coffee } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"USER" | "OWNER">("USER");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [err, setErr] = useState({ email: "", password: "", server: "" });
  const [isLoading, setIsLoading] = useState(false);

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

  // =====================================================
  // ROLE-BASED REDIRECT:
  //   OWNER → /owner/dashboard
  //   USER  → / (Homepage)
  // =====================================================
  const processLoginSuccess = (isOk: boolean, data: any) => {
    if (isOk) {
      localStorage.setItem("user", JSON.stringify(data.user));
      const userRole: string = data.user?.role || "USER";
      if (userRole === "OWNER") {
        window.location.href = "/owner/dashboard";
      } else {
        window.location.href = "/";
      }
    } else {
      setErr(prev => ({ ...prev, server: data.message || "Email atau password salah." }));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden px-4 py-12">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob"></div>
        <div className="absolute top-40 -right-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Form Container */}
      <div className="relative z-10 max-w-lg w-full bg-white/90 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/50">
        
        {/* Logo/Header */}
        <div className="flex justify-center mb-6">
           <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30">
              <Coffee size={28} className="text-white" />
           </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Selamat Datang di NongkiYuk</h2>
              <p className="text-gray-500 mt-2 text-sm">Lanjutkan perjalanan Anda sebagai apa hari ini?</p>
            </div>
            
            <div className="grid gap-4 mt-6">
              <button 
                onClick={() => { setRole("USER"); setStep(2); }} 
                className="group relative flex items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-500 transition-all duration-300 text-left hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 bg-blue-50 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <User size={20} />
                </div>
                <div className="relative z-10 ml-4">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors">Pengguna Biasa</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Cari dan jelajahi tempat nongkrong favorit</p>
                </div>
              </button>

              <button 
                onClick={() => { setRole("OWNER"); setStep(2); }} 
                className="group relative flex items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-orange-500 transition-all duration-300 text-left hover:shadow-lg hover:shadow-orange-500/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 bg-orange-50 p-3 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Store size={20} />
                </div>
                <div className="relative z-10 ml-4">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-orange-700 transition-colors">Mitra Bisnis Kafe</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Kelola tempat, menu, dan lihat analitik</p>
                </div>
              </button>
            </div>
            
            <p className="text-center mt-6 text-sm text-gray-600">
              Belum punya akun? <Link href="/register" className="text-blue-600 font-bold hover:text-blue-800 transition-colors hover:underline">Daftar sekarang</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <button 
              onClick={() => setStep(1)} 
              className="group flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full w-fit"
            >
              <ArrowLeft size={14} className="mr-1.5 group-hover:-translate-x-1 transition-transform" /> Kembali
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Login <span className={role === "OWNER" ? "text-orange-600" : "text-blue-600"}>{role === "USER" ? "Pengguna" : "Mitra"}</span>
              </h2>
              <p className="text-gray-500 mt-1.5 text-sm">Selamat datang kembali! Silakan masuk ke akun Anda.</p>
            </div>

            {err.server && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5 text-sm font-semibold border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                {err.server}
              </div>
            )}

            <div className="flex justify-center mb-6 w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErr(prev => ({ ...prev, server: "Gagal terhubung dengan Google" }))}
                theme="outline"
                shape="pill"
                width="380px"
              />
            </div>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-4 text-[11px] uppercase tracking-wider text-gray-400 font-bold">Atau gunakan email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-0.5">Alamat Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    required 
                    maxLength={50}
                    value={formData.email}
                    placeholder="email@gmail.com" 
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium text-gray-800 ${
                      err.email 
                        ? "border-red-300 focus:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]" 
                        : "border-gray-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    }`} 
                  />
                </div>
                {err.email && <p className="text-red-500 text-xs mt-1.5 font-semibold ml-0.5">{err.email}</p>}
              </div>

              <div className="relative">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-0.5">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    name="password"
                    required 
                    maxLength={32}
                    value={formData.password}
                    placeholder="••••••••" 
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium text-gray-800 tracking-widest ${
                      err.password 
                        ? "border-red-300 focus:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]" 
                        : "border-gray-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    }`} 
                  />
                </div>
                {err.password && <p className="text-red-500 text-xs mt-1.5 font-semibold ml-0.5">{err.password}</p>}
              </div>

              <button 
                type="submit" 
                disabled={!!(err.email || err.password) || isLoading || !formData.email || !formData.password}
                className={`relative w-full py-3 mt-6 rounded-xl font-bold text-white text-sm transition-all duration-300 shadow-md
                  ${role === "OWNER" 
                    ? "bg-orange-600 hover:bg-orange-500 shadow-orange-500/20" 
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                  } 
                  disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </span>
                ) : (
                  "Masuk Sekarang"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
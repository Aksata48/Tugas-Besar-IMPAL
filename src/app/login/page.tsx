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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    processLoginSuccess(res.ok, data);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    const res = await fetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential: credentialResponse.credential, role }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    processLoginSuccess(res.ok, data);
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
      setError(data.message || "Gagal masuk");
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

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-100">{error}</div>}

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Gagal terhubung dengan Google")}
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
                <input type="email" required placeholder="email@contoh.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" required placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" className={`w-full py-3 rounded-lg font-bold text-white transition mt-2 shadow-md ${role === "OWNER" ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                Masuk Sekarang
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
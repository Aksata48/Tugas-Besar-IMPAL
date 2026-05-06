"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, CheckCircle2, ArrowLeft, Camera, ShieldCheck, KeyRound, AlertTriangle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userData, setUserData] = useState<any>(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email_baru: "",
    no_telp: "",
    current_password: "", 
    password: "",         
    confirm_password: "", 
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserData(parsed);
      setPreviewImage(parsed.foto_profil || null);
      setFormData(prev => ({
        ...prev,
        username: parsed.username || "",
        email_baru: parsed.email || "",
        no_telp: parsed.no_telp || "",
      }));
    } else {
      router.push("/login");
    }
  }, [router]);

  // Logika Cerdas: Cek apakah user melakukan perubahan sensitif
  const isEmailChanged = formData.email_baru !== (userData?.email || "");
  const isPasswordChanged = formData.password.trim() !== "";
  const isSensitiveChange = isEmailChanged || isPasswordChanged;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    // Validasi Frontend 1: Konfirmasi password baru harus cocok
    if (formData.password && formData.password !== formData.confirm_password) {
      setStatus({ type: "error", message: "Konfirmasi password baru tidak cocok!" });
      return;
    }

    // Validasi Frontend 2: Wajib isi password saat ini JIKA melakukan perubahan sensitif (dan bukan akun murni Google)
    if (isSensitiveChange && !formData.current_password && !userData.google_id) {
       setStatus({ type: "error", message: "Masukkan password saat ini untuk memverifikasi perubahan keamanan!" });
       return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("email_lama", userData.email);
      submitData.append("username", formData.username);
      submitData.append("email_baru", formData.email_baru);
      submitData.append("no_telp", formData.no_telp);
      submitData.append("current_password", formData.current_password); 
      submitData.append("password", formData.password); 
      
      if (selectedFile) {
        submitData.append("foto_profil", selectedFile);
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        body: submitData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: data.message || "Profil berhasil diperbarui!" });
        localStorage.setItem("user", JSON.stringify(data.user));
        setUserData(data.user);
        
        // Reset kolom password setelah berhasil
        setFormData(prev => ({ ...prev, current_password: "", password: "", confirm_password: "" }));
        window.dispatchEvent(new Event("storage"));
      } else {
        setStatus({ type: "error", message: data.message || "Gagal memperbarui profil." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Terjadi kesalahan koneksi server." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBindGoogle = async (credentialResponse: any) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential: credentialResponse.credential, action: "bind", email_lama: userData.email }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: "Akun Google berhasil dikaitkan!" });
        localStorage.setItem("user", JSON.stringify(data.user));
        setUserData(data.user);
      } else {
        setStatus({ type: "error", message: data.message || "Gagal mengaitkan." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Gagal terhubung." });
    }
  };

  if (!userData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden">
        
        {/* Header Profile */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-3 transition-colors font-medium">
              <ArrowLeft size={16} className="mr-1.5" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-black tracking-tight">Pengaturan Profil</h1>
            <p className="text-gray-400 text-sm mt-1">Kelola data diri & keamanan akun Anda.</p>
          </div>
          
          {/* Foto Profil */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative h-28 w-28 rounded-full border-4 border-gray-700 bg-blue-600 flex items-center justify-center cursor-pointer group overflow-hidden shadow-2xl shrink-0 transition-transform hover:scale-105"
          >
            {previewImage ? (
              <Image src={previewImage} alt="Profile" fill className="object-cover" />
            ) : (
              <User size={48} className="text-white" />
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <Camera size={28} className="text-white" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
        </div>

        <div className="p-8 md:p-10">
          {status.message && (
            <div className={`p-4 rounded-xl mb-8 text-sm font-bold flex items-center gap-3 border ${status.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              {status.type === "success" ? <CheckCircle2 size={20} className="shrink-0" /> : <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shrink-0"></div>}
              {status.message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-8">
            {/* Bagian 1: Data Diri (Bebas diubah tanpa verifikasi password lama) */}
            <div>
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Informasi Pribadi</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="relative">
                   <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-0.5">Username</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500"><User size={16} /></div>
                     <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-800" required />
                   </div>
                 </div>

                 <div className="relative">
                   <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-0.5">No. Telepon</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500"><Phone size={16} /></div>
                     <input type="text" value={formData.no_telp} onChange={(e) => setFormData({...formData, no_telp: e.target.value})} placeholder="Contoh: 08123456789" className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-800" />
                   </div>
                 </div>

                 <div className="relative md:col-span-2">
                   <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-0.5">Alamat Email</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500"><Mail size={16} /></div>
                     <input type="email" value={formData.email_baru} onChange={(e) => setFormData({...formData, email_baru: e.target.value})} className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-800" required />
                   </div>
                 </div>
               </div>
            </div>

            {/* Bagian 2: Password Baru (Opsional) */}
            <div>
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Ubah Keamanan</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="relative">
                   <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-0.5">Password Baru <span className="normal-case font-normal text-gray-400">(Opsional)</span></label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500"><ShieldCheck size={16} /></div>
                     <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Ketik jika ingin ganti..." className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-800" />
                   </div>
                 </div>

                 <div className="relative">
                   <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-0.5">Konfirmasi Password Baru</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500"><ShieldCheck size={16} /></div>
                     <input type="password" value={formData.confirm_password} onChange={(e) => setFormData({...formData, confirm_password: e.target.value})} placeholder="Ketik ulang password baru..." className={`w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium text-gray-800 ${formData.password && formData.password !== formData.confirm_password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} disabled={!formData.password} />
                   </div>
                   {formData.password && formData.password !== formData.confirm_password && (
                     <p className="text-red-500 text-xs mt-1.5 ml-1 font-bold">Password tidak cocok</p>
                   )}
                 </div>
               </div>
            </div>

            {/* Bagian 3: DINAMIS - HANYA MUNCUL JIKA EMAIL ATAU PASSWORD DIUBAH */}
            {isSensitiveChange && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-yellow-100 p-2 rounded-full shrink-0"><AlertTriangle size={20} className="text-yellow-600" /></div>
                  <div>
                    <h4 className="font-bold text-yellow-900">Verifikasi Keamanan Diperlukan</h4>
                    <p className="text-xs text-yellow-700 mt-1">Sistem mendeteksi adanya percobaan perubahan Email atau Password Baru. Harap masukkan Password Lama Anda untuk mengonfirmasi bahwa ini benar-benar Anda.</p>
                  </div>
                </div>
                
                <div className="relative mt-2">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-yellow-600"><Lock size={16} /></div>
                    <input type="password" value={formData.current_password} onChange={(e) => setFormData({...formData, current_password: e.target.value})} placeholder="Masukkan password lama Anda..." className="w-full pl-10 pr-4 py-3 text-sm bg-white border-2 border-yellow-300 rounded-xl focus:border-yellow-500 outline-none transition-all font-medium text-gray-800" required={!userData?.google_id} />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="relative w-full py-4 mt-4 bg-gray-900 text-white rounded-xl font-black text-lg transition-all duration-300 shadow-xl hover:bg-gray-800 hover:-translate-y-1 hover:shadow-2xl disabled:bg-gray-400 disabled:transform-none disabled:shadow-none">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Memproses Perubahan...
                </span>
              ) : (
                "Simpan Perubahan Profil"
              )}
            </button>
          </form>

          <hr className="my-10 border-gray-200" />

          {/* Bagian SSO Google */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">Tautan Akun Cepat (SSO)</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Kaitkan akun ini dengan Google agar Anda bisa login dengan satu klik di masa depan, tanpa perlu mengingat password.</p>
            
            {userData?.google_id ? (
              <div className="flex items-center gap-3 p-4 bg-white border border-green-200 rounded-xl text-green-700 font-bold shadow-sm">
                <div className="bg-green-100 p-2 rounded-full"><CheckCircle2 size={20} className="text-green-600" /></div>
                Akun ini sudah terlindungi & terhubung dengan Google.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl w-fit">
                <GoogleLogin
                  onSuccess={handleBindGoogle}
                  onError={() => setStatus({ type: "error", message: "Gagal memuat Google Pop-up" })}
                  text="signup_with"
                  shape="rectangular"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, CheckCircle2, ArrowLeft, Camera } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userData, setUserData] = useState<any>(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk gambar
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email_baru: "",
    no_telp: "",
    password: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserData(parsed);
      setPreviewImage(parsed.foto_profil || null);
      setFormData({
        username: parsed.username || "",
        email_baru: parsed.email || "",
        no_telp: parsed.no_telp || "",
        password: "",
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  // Handle Pilih Gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Buat preview sementara
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // Gunakan FormData karena ada file gambar
      const submitData = new FormData();
      submitData.append("email_lama", userData.email);
      submitData.append("username", formData.username);
      submitData.append("email_baru", formData.email_baru);
      submitData.append("no_telp", formData.no_telp);
      submitData.append("password", formData.password);
      
      if (selectedFile) {
        submitData.append("foto_profil", selectedFile);
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        body: submitData, // Tidak pakai JSON.stringify lagi
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "Profil berhasil diperbarui!" });
        localStorage.setItem("user", JSON.stringify(data.user));
        setUserData(data.user);
        setFormData(prev => ({ ...prev, password: "" }));
        
        // Memaksa Navbar update foto dengan reload halus
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
    // ... (Kode bind Google biarkan sama seperti sebelumnya)
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

  if (!userData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="bg-gray-900 px-8 py-6 text-white flex items-center justify-between">
          <div>
            <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-2 transition">
              <ArrowLeft size={16} className="mr-1" /> Kembali
            </Link>
            <h1 className="text-2xl font-extrabold">Pengaturan Profil</h1>
            <p className="text-gray-400 text-sm">Kelola informasi data diri dan keamanan akun Anda.</p>
          </div>
          
          {/* AREA FOTO PROFIL BISA DIKLIK */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative h-20 w-20 rounded-full border-4 border-gray-800 bg-blue-600 flex items-center justify-center cursor-pointer group overflow-hidden shadow-lg"
          >
            {previewImage ? (
              <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} />
            )}
            {/* Overlay Icon Kamera saat di-hover */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
        </div>

        <div className="p-8">
          {status.message && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-bold flex items-center gap-2 ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {status.type === "success" && <CheckCircle2 size={18} />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">No. Telepon</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={18} /></div>
                  <input type="text" value={formData.no_telp} onChange={(e) => setFormData({...formData, no_telp: e.target.value})} placeholder="Contoh: 08123456789" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                  <input type="email" value={formData.email_baru} onChange={(e) => setFormData({...formData, email_baru: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Ganti Password <span className="text-gray-400 text-xs font-normal">(Kosongkan jika tidak ingin ganti)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Ketik password baru..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400">
              {isLoading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
            </button>
          </form>

          <hr className="my-8 border-gray-200" />

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Keamanan Ekstra (SSO)</h3>
            <p className="text-sm text-gray-500 mb-4">Kaitkan akun ini dengan Google agar Anda bisa login dengan satu klik di masa depan.</p>
            
            {userData.google_id ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-bold">
                <CheckCircle2 size={24} className="text-green-600" />
                Akun ini sudah terhubung secara aman dengan Google.
              </div>
            ) : (
              <div className="flex justify-start">
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
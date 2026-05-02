"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Menu, X, Coffee } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fungsi khusus untuk mengambil/memuat ulang data user
  const loadUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser(); // Muat data saat pertama kali website dibuka

    // Dengarkan perubahan pada storage agar foto otomatis update tanpa refresh
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Bagian Kiri: Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition shadow-md">
              <Coffee size={20} />
            </div>
            <span className="font-extrabold text-xl text-gray-900 tracking-tight">
              Nongki<span className="text-blue-600">Yuk</span>
            </span>
          </Link>

          {/* Bagian Kanan: Menu Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-5">
                <Link 
                  href={user.role === "OWNER" ? "/owner/dashboard" : "/"} 
                  className="text-sm font-bold text-gray-600 hover:text-blue-600 transition"
                >
                  {user.role === "OWNER" ? "Dashboard" : "Beranda"}
                </Link>
                
                <div className="h-6 w-px bg-gray-200"></div>

                {/* Tombol ke Halaman Profil DENGAN FOTO */}
                <Link href="/profile" className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-blue-600 transition group">
                  <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-blue-300 transition flex items-center justify-center bg-gray-100 shrink-0">
                    {user.foto_profil ? (
                      <img src={user.foto_profil} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User size={16} className="text-gray-500 group-hover:text-blue-600" />
                    )}
                  </div>
                  {user.username}
                </Link>

                {/* Tombol Logout */}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-700 transition px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">Masuk</Link>
                <Link href="/register" className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition shadow-md hover:shadow-lg">Daftar</Link>
              </div>
            )}
          </div>

          {/* Tombol Menu Hamburger untuk HP (Mobile) */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-900 focus:outline-none bg-gray-50 p-2 rounded-lg">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu untuk Layar HP */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-3 shadow-lg absolute w-full">
          {user ? (
            <>
              <div className="px-3 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                
                {/* FOTO PROFIL DI MOBILE MENU */}
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-blue-200 bg-blue-100 flex items-center justify-center shrink-0">
                  {user.foto_profil ? (
                    <img src={user.foto_profil} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User size={20} className="text-blue-600" />
                  )}
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Masuk sebagai</p>
                  <p className="font-bold text-gray-900">{user.username}</p>
                </div>
              </div>
              <Link href={user.role === "OWNER" ? "/owner/dashboard" : "/"} className="block px-3 py-2 text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition">
                {user.role === "OWNER" ? "Dashboard" : "Beranda"}
              </Link>
              <Link href="/profile" className="block px-3 py-2 text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition">
                Pengaturan Profil
              </Link>
              <div className="border-t border-gray-100 my-2"></div>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-bold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2">
                <LogOut size={18} /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-3 py-2 text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition">Masuk</Link>
              <Link href="/register" className="block px-3 py-3 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-center mt-2 shadow-md transition">Daftar Sekarang</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
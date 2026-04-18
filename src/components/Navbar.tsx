"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserCircle, LogOut, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); 
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white font-bold flex items-center justify-center rounded-md">N</div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Nongki<span className="text-blue-600">Yuk</span>
          </h1>
        </Link>
      </div>
      
      <div className="flex gap-6 items-center">
        <Link href="/" className="text-gray-600 font-medium hover:text-blue-600 transition">Beranda</Link>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
              {user.role === "OWNER" ? (
                <ShieldAlert size={20} className="text-orange-500" />
              ) : (
                <UserCircle size={20} className="text-blue-600" />
              )}
              <span className="text-sm font-semibold text-gray-700">
                {user.username} {user.role === "OWNER" && "(Owner)"}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg transition hover:bg-blue-700 shadow-sm"
          >
            Masuk / Daftar
          </Link>
        )}
      </div>
    </nav>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, PlusCircle, MapPin, Edit, Trash2, LogOut } from "lucide-react";

export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Ambil data user saat halaman dimuat
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push("/login"); // Usir kalau belum login
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 px-6 py-8 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-orange-600 text-white font-bold flex items-center justify-center rounded-md">N</div>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
            Owner<span className="text-orange-600">Panel</span>
          </h1>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <button className="flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-600 font-semibold rounded-lg transition">
            <Store size={20} /> Tempat Saya
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 hover:text-gray-800 font-semibold rounded-lg transition">
            <PlusCircle size={20} /> Tambah Tempat
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-800">{user.username}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 font-bold hover:text-red-700 transition">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800">Halo, {user.username}! 👋</h2>
            <p className="text-gray-500 mt-2">Selamat datang di dashboard pengelolaan tempat nongkrong Anda.</p>
          </div>
          <button className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-orange-700 transition flex items-center gap-2 shadow-sm">
            <PlusCircle size={20} /> Tambah Baru
          </button>
        </header>

        {/* AREA DAFTAR KAFE (Saat ini pakai data bohongan dulu) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Tempat yang Anda Kelola</h3>
          
          <div className="grid gap-4">
            {/* Kartu Kafe Dummy */}
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition">
              <div>
                <h4 className="font-bold text-gray-800 text-lg">Warkop Motekar</h4>
                <div className="flex items-center text-gray-500 text-sm mt-1 gap-1">
                  <MapPin size={14} /> Telkom University
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition" title="Edit">
                  <Edit size={18} />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-md transition" title="Hapus">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            {/* Info Jika Kosong */}
            {/* <div className="text-center py-12 text-gray-500">
              <Store size={48} className="mx-auto text-gray-300 mb-4" />
              <p>Anda belum menambahkan tempat nongkrong apapun.</p>
            </div> */}

          </div>
        </div>
      </main>

    </div>
  );
}
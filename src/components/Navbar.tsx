import Link from "next/link"; // <-- Tambahkan ini di baris paling atas

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 text-white font-bold flex items-center justify-center rounded-md">N</div>
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
          Nongki<span className="text-blue-600">Yuk</span>
        </h1>
      </div>
      
      <div className="flex gap-4">
        <Link href="/" className="text-gray-600 font-medium hover:text-blue-600 transition flex items-center">
          Beranda
        </Link>
        
        {/* Tombol ini sekarang berfungsi memindahkan halaman ke /admin */}
        <Link 
          href="/admin" 
          className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition shadow-md"
        >
          Login Pemilik
        </Link>
      </div>
    </nav>
  );
}
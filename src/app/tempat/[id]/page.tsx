import Navbar from "@/components/Navbar";
import { daftarTempat } from "@/data/tempat";

export default async function DetailTempat({ params }: { params: Promise<{ id: string }> }) {
  // 1. Ambil ID dari URL (misal: T01)
  const { id } = await params;
  
  // 2. Cari data tempat yang sesuai ID
  const tempat = daftarTempat.find((t) => t.id === id);

  // Jika tidak ketemu, tampilkan ini
  if (!tempat) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-800">404 - Tempat Tidak Ditemukan</h1>
      </div>
    );
  }

  // Jika ketemu, tampilkan UI Split-Screen (Informasi Kiri, Form Kanan)
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Gambar Header Lebar */}
      <div className="w-full h-80 bg-gray-300 relative">
        <img src={tempat.gambar} alt={tempat.namaTempat} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* KIRI: Informasi Tempat */}
          <div className="flex-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 -mt-20 relative z-10">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                {tempat.kategori}
              </span>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{tempat.namaTempat}</h1>
              <p className="text-gray-500 text-lg mb-6">📍 {tempat.alamat}</p>
              
              <div className="flex gap-6 border-y border-gray-100 py-6 mb-6">
                <div>
                  <p className="text-sm text-gray-400">Jam Operasional</p>
                  <p className="font-bold text-gray-800">{tempat.jamBuka}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Kisaran Harga</p>
                  <p className="font-bold text-green-600">{tempat.kisaranHarga}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Rating Pengguna</p>
                  <p className="font-bold text-yellow-500">★ {tempat.rating} / 5.0</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentang Tempat Ini</h2>
              <p className="text-gray-600 leading-relaxed">
                Tempat nongkrong yang cocok untuk nugas maupun sekadar berkumpul dengan teman kampus. 
                Sesuai dengan data aplikasi NongkiYuk, tempat ini menyediakan fasilitas yang memadai untuk 
                menunjang produktivitas mahasiswa.
              </p>
            </div>
          </div>

          {/* KANAN: Form Booking (Sticky) */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Tempat</h3>
              <p className="text-gray-500 text-sm mb-6">Amankan kursimu sebelum kehabisan.</p>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" placeholder="Contoh: Ryan Maulana" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon / WA</label>
                  <input type="tel" className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" placeholder="08123456789" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input type="date" className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
                    <input type="time" className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                  </div>
                </div>
                <button type="button" className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl mt-4 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                  Konfirmasi Booking
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
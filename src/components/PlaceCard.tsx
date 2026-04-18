import Link from "next/link"; // Wajib diimpor untuk navigasi pindah halaman

interface PlaceCardProps {
  id: string; // Tambahkan ID di sini
  namaTempat: string;
  kategori: string;
  alamat: string;
  jamBuka: string;
  kisaranHarga: string;
  rating: number;
  gambar: string;
}

export default function PlaceCard({
  id,
  namaTempat,
  kategori,
  alamat,
  jamBuka,
  kisaranHarga,
  rating,
  gambar,
}: PlaceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="relative h-48 w-full bg-gray-200">
        <img src={gambar} alt={namaTempat} className="object-cover w-full h-full" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
          {kategori}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight">
            {namaTempat}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md shrink-0">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm font-bold text-gray-700">{rating}</span>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-1">{alamat}</p>
        
        <div className="flex items-center justify-between text-sm mt-auto border-t border-gray-100 pt-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs">Harga</span>
            <span className="font-semibold text-green-600">{kisaranHarga}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-gray-400 text-xs">Jam Buka</span>
            <span className="font-semibold text-gray-700">{jamBuka}</span>
          </div>
        </div>

        {/* Ini yang berubah: Tombol diganti menjadi Link bawaan Next.js */}
        <Link 
          href={`/tempat/${id}`}
          className="w-full mt-4 bg-blue-50 text-blue-600 font-semibold py-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-center block"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
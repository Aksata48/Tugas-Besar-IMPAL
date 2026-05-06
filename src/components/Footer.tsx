"use client";
import Link from "next/link";
// Perbaikan: Mengganti ikon brand dengan ikon universal yang pasti ada di lucide-react
import { Coffee, Mail, Globe, MapPin, Camera, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Kolom 1: Brand & Deskripsi */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Coffee size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">NongkiYuk</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Platform pencarian tempat nongkrong terbaik di sekitar kampus. 
              Temukan kafe, warkop, dan ruang kerja yang sesuai dengan kantong dan kebutuhanmu.
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <h4 className="text-white font-bold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Beranda</Link></li>
              <li><Link href="/tempat" className="hover:text-blue-400 transition-colors">Cari Tempat</Link></li>
              <li><Link href="/favorites" className="hover:text-blue-400 transition-colors">Favorit Saya</Link></li>
              <li><Link href="/booking/list" className="hover:text-blue-400 transition-colors">Riwayat Booking</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Dukungan & Perusahaan */}
          <div>
            <h4 className="text-white font-bold mb-4">Dukungan</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Pusat Bantuan</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Kerja Sama</Link></li>
            </ul>
          </div>

          {/* Kolom 4: Kontak Tim */}
          <div>
            <h4 className="text-white font-bold mb-4">Kontak Tim</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                Telkom University, Bandung
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                support@nongkiyuk.id
              </li>
              <li className="flex gap-4 pt-2">
                <Link href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-all text-white">
                  <Camera size={18} />
                </Link>
                <Link href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-all text-white">
                  <MessageCircle size={18} />
                </Link>
                <Link href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-all text-white">
                  <Globe size={18} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Garis Pembatas & Copyright */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <p>© 2026 NongkiYuk. Dikembangkan oleh Tim Aksata48.</p>
          <div className="flex gap-6">
            <span>Tugas Besar IMPAL</span>
            <span>Telkom University</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
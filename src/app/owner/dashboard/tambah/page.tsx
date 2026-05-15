"use client";
import { useState } from "react";
import { Store, MapPin, Image as ImageIcon, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TambahTempatOwner() {
  const [isLoading, setIsLoading] = useState(false);

  // 1. STATE UNTUK DATA UMUM
  const [formData, setFormData] = useState({
    nama_tempat: "",
    alamat: "",
    waktu_buka: "",
    waktu_tutup: "",
    kisaran_harga: "",
    contact_person: "",
    latitude: -6.9740, // Default koordinat (Contoh: Telkom University)
    longitude: 107.6303,
  });

  // 2. STATE UNTUK LANTAI DAN MEJA (Dinamis)
  const [lantaiData, setLantaiData] = useState([
    { nama_lantai: "Lantai 1", meja: [{ nomor_meja: "", kapasitas_kursi: 0 }] }
  ]);

  // 3. STATE UNTUK GAMBAR
  const [gambarResto, setGambarResto] = useState<File[]>([]);
  const [errGambar, setErrGambar] = useState("");

  // --- LOGIKA LANTAI & MEJA ---
  const handleTambahLantai = () => {
    setLantaiData([...lantaiData, { nama_lantai: "", meja: [{ nomor_meja: "", kapasitas_kursi: 0 }] }]);
  };

  const handleHapusLantai = (indexLantai: number) => {
    const dataBaru = [...lantaiData];
    dataBaru.splice(indexLantai, 1);
    setLantaiData(dataBaru);
  };

  const handleTambahMeja = (indexLantai: number) => {
    const dataBaru = [...lantaiData];
    dataBaru[indexLantai].meja.push({ nomor_meja: "", kapasitas_kursi: 0 });
    setLantaiData(dataBaru);
  };

  const handleHapusMeja = (indexLantai: number, indexMeja: number) => {
    const dataBaru = [...lantaiData];
    dataBaru[indexLantai].meja.splice(indexMeja, 1);
    setLantaiData(dataBaru);
  };

  const handleChangeMeja = (indexLantai: number, indexMeja: number, field: string, value: string) => {
    const dataBaru = [...lantaiData];
    dataBaru[indexLantai].meja[indexMeja] = { ...dataBaru[indexLantai].meja[indexMeja], [field]: value };
    setLantaiData(dataBaru);
  };

  // --- LOGIKA VALIDASI GAMBAR (Maks 5 File, 10MB) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrGambar("");
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      if (gambarResto.length + files.length > 5) {
        setErrGambar("Maksimal hanya boleh mengunggah 5 gambar.");
        return;
      }

      const validFiles = files.filter(file => {
        const isSizeValid = file.size <= 10 * 1024 * 1024; // 10MB
        if (!isSizeValid) setErrGambar("Ada gambar yang ukurannya melebihi 10MB.");
        return isSizeValid;
      });

      setGambarResto(prev => [...prev, ...validFiles]);
    }
  };

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Nanti di sini kita akan memanggil API Route yang sudah kita buat sebelumnya
    console.log("Data yang akan dikirim:", { ...formData, lantai: lantaiData, gambar: gambarResto });
    
    setTimeout(() => {
      setIsLoading(false);
      alert("Simulasi Berhasil! Data siap dikirim ke backend.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Tempat Baru</h1>
            <p className="text-gray-500 text-sm">Lengkapi detail tempat nongkrong Anda di bawah ini.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Informasi Dasar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4 border-b pb-3">
              <Store className="text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800">Informasi Dasar</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Nama Tempat</label>
                <input type="text" className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Contact Person</label>
                <input type="text" className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" required />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Alamat Lengkap</label>
                <input type="text" className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Waktu Buka (HH:MM)</label>
                <input type="time" className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 outline-none transition" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Waktu Tutup (HH:MM)</label>
                <input type="time" className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-orange-500 outline-none transition" required />
              </div>
            </div>
          </div>

          {/* Card 2: Pengaturan Lantai & Meja (DINAMIS) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="text-blue-500" />
                <h2 className="text-lg font-bold text-gray-800">Layout Lantai & Meja</h2>
              </div>
              <button type="button" onClick={handleTambahLantai} className="flex items-center space-x-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-semibold transition">
                <Plus size={16} /> <span>Tambah Lantai</span>
              </button>
            </div>

            <div className="space-y-6">
              {lantaiData.map((lantai, indexLantai) => (
                <div key={indexLantai} className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <input 
                      type="text" 
                      value={lantai.nama_lantai}
                      onChange={(e) => {
                        const dataBaru = [...lantaiData];
                        dataBaru[indexLantai].nama_lantai = e.target.value;
                        setLantaiData(dataBaru);
                      }}
                      className="px-3 py-1.5 font-bold text-gray-700 bg-white border rounded-lg focus:border-blue-500 outline-none" 
                      placeholder="Nama Lantai (Ex: Rooftop)"
                    />
                    {lantaiData.length > 1 && (
                      <button type="button" onClick={() => handleHapusLantai(indexLantai)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Render Meja per Lantai */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {lantai.meja.map((meja, indexMeja) => (
                      <div key={indexMeja} className="flex space-x-2 items-center bg-white p-2 rounded-lg border">
                        <input 
                          type="text" 
                          placeholder="No. Meja (Ex: 01)" 
                          value={meja.nomor_meja}
                          onChange={(e) => handleChangeMeja(indexLantai, indexMeja, 'nomor_meja', e.target.value)}
                          className="w-1/2 px-2 py-1 text-sm bg-gray-50 border rounded-md outline-none" 
                        />
                        <input 
                          type="number" 
                          placeholder="Kapasitas Kursi" 
                          value={meja.kapasitas_kursi || ''}
                          onChange={(e) => handleChangeMeja(indexLantai, indexMeja, 'kapasitas_kursi', e.target.value)}
                          className="w-1/3 px-2 py-1 text-sm bg-gray-50 border rounded-md outline-none" 
                        />
                        <button type="button" onClick={() => handleHapusMeja(indexLantai, indexMeja)} className="text-gray-400 hover:text-red-500 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button type="button" onClick={() => handleTambahMeja(indexLantai)} className="text-xs font-bold text-blue-600 hover:underline">
                    + Tambah Meja di {lantai.nama_lantai || "Lantai ini"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Upload Gambar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4 border-b pb-3">
              <ImageIcon className="text-green-500" />
              <h2 className="text-lg font-bold text-gray-800">Foto Tempat</h2>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Maksimal 5 foto. Ukuran maksimal 10MB per foto.</p>
              
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500 font-semibold">Klik untuk memilih gambar</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              
              {errGambar && <p className="text-red-500 text-xs font-bold">{errGambar}</p>}
              
              {/* Preview Nama File */}
              {gambarResto.length > 0 && (
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {gambarResto.map((file, i) => (
                    <li key={i}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Tombol Submit */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? "Menyimpan Data..." : <><Save size={20} /> Simpan Tempat Nongkrong</>}
          </button>

        </form>
      </div>
    </div>
  );
}
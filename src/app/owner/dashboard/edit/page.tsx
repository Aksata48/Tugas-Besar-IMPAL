"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function EditTempat() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    jam_buka: "",
    kisaran_harga: "",
    id_kampus: "",
  });

  // Ambil data tempat yang akan diedit
  useEffect(() => {
    fetch(`/api/tempat/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          nama: data.nama_tempat,
          alamat: data.alamat,
          jam_buka: data.jam_buka,
          kisaran_harga: data.kisaran_harga,
          id_kampus: data.id_kampus,
        });
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch(`/api/tempat/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/owner/dashboard");
    } else {
      alert("Gagal mengupdate tempat.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-8">
        <button
          onClick={() => router.push("/owner/dashboard")}
          className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-800"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <h1 className="text-2xl font-bold mb-6">Edit Tempat</h1>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nama Tempat *</label>
            <input name="nama" value={form.nama} onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Alamat</label>
            <input name="alamat" value={form.alamat} onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Jam Buka</label>
            <input name="jam_buka" value={form.jam_buka} onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Kisaran Harga</label>
            <select name="kisaran_harga" value={form.kisaran_harga} onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">-- Pilih --</option>
              <option value="murah">Murah (di bawah 20rb)</option>
              <option value="sedang">Sedang (20rb - 50rb)</option>
              <option value="mahal">Mahal (di atas 50rb)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Kampus *</label>
            <select name="id_kampus" value={form.id_kampus} onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">-- Pilih Kampus --</option>
              <option value="KAMPUS1">Telkom University</option>
              <option value="KAMPUS2">ITB</option>
            </select>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="mt-2 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50">
            {loading ? "Menyimpan..." : "Update Tempat"}
          </button>
        </div>
      </div>
    </div>
  );
}
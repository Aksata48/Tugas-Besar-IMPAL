"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store, PlusCircle, MapPin, Edit, Trash2, LogOut,
  X, Clock, Phone, CalendarCheck, CheckCircle, XCircle, AlertCircle, Wallet
} from "lucide-react";

// ===== TIPE DATA =====
interface Tempat {
  id_tempat: string;
  nama_tempat: string;
  alamat: string;
  jam_buka: string;
  kisaran_harga: string;
  jumlah_meja?: number;
  jumlah_lantai?: number;
}

interface Booking {
  id: string;
  nama: string;
  tanggal: string;
  jam: string;
  nomor: string;
  status: "pending" | "accepted" | "rejected";
  tempat?: { nama_tempat: string };
}

const FORM_KOSONG = {
  nama_tempat: "",
  alamat: "",
  jam_buka: "",
  kisaran_harga: "",
  jumlah_meja: "",
  jumlah_lantai: "",
};

export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeNav, setActiveNav] = useState<"daftar" | "tambah" | "booking">("daftar");

  // State Tempat
  const [tempatList, setTempatList] = useState<Tempat[]>([]);
  const [loadingTempat, setLoadingTempat] = useState(false);
  const [modalTambah, setModalTambah] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [tempatDipilih, setTempatDipilih] = useState<Tempat | null>(null);
  const [form, setForm] = useState(FORM_KOSONG);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // State Booking
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"semua" | "pending" | "accepted" | "rejected">("semua");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    else router.push("/login");
  }, [router]);

  useEffect(() => {
    if (activeNav === "daftar") fetchTempat();
    if (activeNav === "booking") fetchBookings();
  }, [activeNav]);

  // Fetch tempat dari database
  const fetchTempat = async () => {
    setLoadingTempat(true);
    try {
      const response = await fetch('/api/tempat');

      if (!response.ok) {
        console.error(`Server merespons dengan status: ${response.status}`);
        return; 
      }

      const text = await response.text();
      if (!text) {
        console.warn("Respons kosong dari server.");
        return;
      }

      const data = JSON.parse(text);
      if (data.success) {
        setTempatList(data.tempat);
      }
    } catch (error) {
      console.error("Error saat mengambil data tempat:", error);
    } finally {
      setLoadingTempat(false);
    }
  };

  // Fetch booking dari database
  const fetchBookings = async () => {
    setLoadingBooking(true);
    try {
      const res = await fetch("/api/booking");
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBooking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]:
      name === "jumlah_meja" || name === "jumlah_lantai"
        ? value === "" ? "" : Number(value)
        : value,
  }));
};
  // TAMBAH
  const bukaModalTambah = () => {
    setForm(FORM_KOSONG);
    setModalTambah(true);
    setActiveNav("tambah");
  };

  const handleTambah = async () => {
    if (!form.nama_tempat || !form.alamat) return alert("Nama dan alamat wajib diisi!");
    setLoadingSubmit(true);
    try {
      const res = await fetch("/api/tempat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setTempatList((prev) => [...prev, data.tempat]);
        setModalTambah(false);
        setActiveNav("daftar");
      } else {
        alert(data.message || "Gagal menambah tempat");
      }
    } catch (e) {
      alert("Terjadi error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // EDIT
  const bukaModalEdit = (tempat: Tempat) => {
    setTempatDipilih(tempat);
    setForm({
      nama_tempat: tempat.nama_tempat,
      alamat: tempat.alamat,
      jam_buka: tempat.jam_buka,
      kisaran_harga: tempat.kisaran_harga,
      jumlah_meja: tempat.jumlah_meja || "",
      jumlah_lantai: tempat.jumlah_lantai || "",
    });
    setModalEdit(true);
  };

  const handleEdit = async () => {
    if (!form.nama_tempat || !form.alamat) return alert("Nama dan alamat wajib diisi!");
    setLoadingSubmit(true);
    try {
      const res = await fetch("/api/tempat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tempat: tempatDipilih?.id_tempat, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setTempatList((prev) =>
          prev.map((t) => (t.id_tempat === tempatDipilih?.id_tempat ? data.tempat : t))
        );
        setModalEdit(false);
      } else {
        alert(data.message || "Gagal mengedit tempat");
      }
    } catch (e) {
      alert("Terjadi error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // HAPUS
  const bukaModalHapus = (tempat: Tempat) => {
    setTempatDipilih(tempat);
    setModalHapus(true);
  };

  const handleHapus = async () => {
    setLoadingSubmit(true);
    try {
      const res = await fetch("/api/tempat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tempat: tempatDipilih?.id_tempat }),
      });
      const data = await res.json();
      if (data.success) {
        setTempatList((prev) => prev.filter((t) => t.id_tempat !== tempatDipilih?.id_tempat));
        setModalHapus(false);
      } else {
        alert(data.message || "Gagal menghapus tempat");
      }
    } catch (e) {
      alert("Terjadi error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // UPDATE STATUS BOOKING
  const handleUpdateStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const bookingFiltered = filterStatus === "semua"
    ? bookings
    : bookings.filter((b) => b.status === filterStatus);

  const badgeCount = bookings.filter((b) => b.status === "pending").length;

  if (!user) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pt-16">

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 px-6 py-8 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-orange-600 text-white font-bold flex items-center justify-center rounded-md">N</div>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
            Owner<span className="text-orange-600">Panel</span>
          </h1>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <button
            onClick={() => { setActiveNav("daftar"); }}
            className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition ${activeNav === "daftar" || activeNav === "tambah" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
          >
            <Store size={20} /> Tempat Saya
          </button>
          <button
            onClick={bukaModalTambah}
            className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition ${activeNav === "tambah" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
          >
            <PlusCircle size={20} /> Tambah Tempat
          </button>
          <button
            onClick={() => setActiveNav("booking")}
            className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition relative ${activeNav === "booking" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
          >
            <CalendarCheck size={20} /> Kelola Booking
            {badgeCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {badgeCount}
              </span>
            )}
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

        {/* TAB: DAFTAR TEMPAT */}
        {(activeNav === "daftar" || activeNav === "tambah") && (
          <>
            <header className="mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-800">Halo, {user.username}! 👋</h2>
                <p className="text-gray-500 mt-2">Kelola tempat nongkrong yang Anda miliki.</p>
              </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                Tempat yang Anda Kelola
                <span className="ml-2 text-sm font-normal text-gray-400">({tempatList.length} tempat)</span>
              </h3>

              {loadingTempat ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Memuat data tempat...</p>
                </div>
              ) : tempatList.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Store size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="font-semibold">Belum ada tempat yang ditambahkan.</p>
                  <button onClick={bukaModalTambah} className="mt-4 text-orange-600 font-bold hover:underline text-sm">
                    + Tambah sekarang
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tempatList.map((tempat) => (
                    <div key={tempat.id_tempat} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-lg">{tempat.nama_tempat}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="flex items-center text-gray-500 text-sm gap-1"><MapPin size={14} /> {tempat.alamat}</span>
                          {tempat.jam_buka && <span className="flex items-center text-gray-500 text-sm gap-1"><Clock size={14} /> {tempat.jam_buka}</span>}
                          {tempat.kisaran_harga && <span className="flex items-center text-gray-500 text-sm gap-1"><Wallet size={14} /> {tempat.kisaran_harga}</span>}
                          {tempat.jumlah_meja && <span className="text-gray-500 text-sm">Meja: {tempat.jumlah_meja}</span>}
                          {tempat.jumlah_lantai && <span className="text-gray-500 text-sm">Lantai: {tempat.jumlah_lantai}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => bukaModalEdit(tempat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition" title="Edit"><Edit size={18} /></button>
                        <button onClick={() => bukaModalHapus(tempat)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition" title="Hapus"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: KELOLA BOOKING */}
        {activeNav === "booking" && (
          <>
            <header className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-800">Kelola Booking 📋</h2>
              <p className="text-gray-500 mt-2">Terima atau tolak permintaan booking dari pelanggan.</p>
            </header>

            <div className="flex gap-2 mb-6 flex-wrap">
              {(["semua", "pending", "accepted", "rejected"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${filterStatus === s ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"}`}
                >
                  {s === "semua" ? "Semua" : s === "pending" ? "Menunggu" : s === "accepted" ? "Diterima" : "Ditolak"}
                  {s === "pending" && badgeCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{badgeCount}</span>
                  )}
                </button>
              ))}
              <button onClick={fetchBookings} className="ml-auto px-4 py-1.5 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:border-orange-300 transition">
                🔄 Refresh
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {loadingBooking ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Memuat data booking...</p>
                </div>
              ) : bookingFiltered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <CalendarCheck size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="font-semibold">Tidak ada booking{filterStatus !== "semua" ? " dengan status ini" : ""}.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookingFiltered.map((booking) => (
                    <div key={booking.id} className={`p-4 border rounded-xl transition ${booking.status === "pending" ? "border-yellow-200 bg-yellow-50" : booking.status === "accepted" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800 text-lg">{booking.nama}</h4>
                            <StatusBadge status={booking.status} />
                          </div>
                          {booking.tempat && (
                            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                              <MapPin size={13} /> {booking.tempat.nama_tempat}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span>📅 {new Date(booking.tanggal).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                            <span>🕒 {booking.jam}</span>
                            <span>📞 {booking.nomor}</span>
                          </div>
                        </div>
                        {booking.status === "pending" && (
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleUpdateStatus(booking.id, "accepted")} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition">
                              <CheckCircle size={16} /> Terima
                            </button>
                            <button onClick={() => handleUpdateStatus(booking.id, "rejected")} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition">
                              <XCircle size={16} /> Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* MODAL TAMBAH */}
      {modalTambah && (
        <ModalWrapper onClose={() => { setModalTambah(false); setActiveNav("daftar"); }}>
          <ModalHeader title="Tambah Tempat Baru" onClose={() => { setModalTambah(false); setActiveNav("daftar"); }} />
          <FormTempat form={form} onChange={handleFormChange} />
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => { setModalTambah(false); setActiveNav("daftar"); }} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">Batal</button>
            <button onClick={handleTambah} disabled={loadingSubmit} className="px-5 py-2 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition disabled:opacity-60">
              {loadingSubmit ? "Menyimpan..." : "Simpan Tempat"}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* MODAL EDIT */}
      {modalEdit && (
        <ModalWrapper onClose={() => setModalEdit(false)}>
          <ModalHeader title="Edit Tempat" onClose={() => setModalEdit(false)} />
          <FormTempat form={form} onChange={handleFormChange} />
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setModalEdit(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">Batal</button>
            <button onClick={handleEdit} disabled={loadingSubmit} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60">
              {loadingSubmit ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* MODAL HAPUS */}
      {modalHapus && (
        <ModalWrapper onClose={() => setModalHapus(false)}>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">Hapus Tempat?</h3>
            <p className="text-gray-500 mb-6">
              Yakin ingin menghapus <span className="font-bold text-gray-800">"{tempatDipilih?.nama_tempat}"</span>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setModalHapus(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleHapus} disabled={loadingSubmit} className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-60">
                {loadingSubmit ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}

// ===== KOMPONEN BANTU =====

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") return (
    <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
      <AlertCircle size={11} /> Menunggu
    </span>
  );
  if (status === "accepted") return (
    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <CheckCircle size={11} /> Diterima
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
      <XCircle size={11} /> Ditolak
    </span>
  );
}

function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex justify-between items-center mb-5">
      <h3 className="text-xl font-extrabold text-gray-800">{title}</h3>
      <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition">
        <X size={20} />
      </button>
    </div>
  );
}

function FormTempat({
  form,
  onChange,
}: {
  form: typeof FORM_KOSONG;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Nama Tempat <span className="text-red-500">*</span></label>
        <input name="nama_tempat" value={form.nama_tempat} onChange={onChange} placeholder="cth: Warkop Motekar" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Alamat <span className="text-red-500">*</span></label>
        <input name="alamat" value={form.alamat} onChange={onChange} placeholder="cth: Jl. Telekomunikasi No. 1" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Jam Buka</label>
        <input name="jam_buka" value={form.jam_buka} onChange={onChange} placeholder="cth: 08:00 - 22:00" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Kisaran Harga</label>
        <input name="kisaran_harga" value={form.kisaran_harga} onChange={onChange} placeholder="cth: Rp 10.000 - Rp 30.000" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Jumlah Meja</label>
        <input name="jumlah_meja" type="number" value={form.jumlah_meja} onChange={onChange} placeholder="cth: 15" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Jumlah Lantai</label>
        <input name="jumlah_lantai" type="number" value={form.jumlah_lantai} onChange={onChange} placeholder="cth: 2" className={inputClass} />
      </div>
    </div>
  );
}
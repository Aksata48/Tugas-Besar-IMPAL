import prisma from '../src/lib/prisma'; 

async function main() {
  console.log('Memulai proses seeding dengan dukungan waktu real-time...');

  // 1. BERSIHKAN DATA LAMA
  await prisma.booking.deleteMany({}); // ✅ penting ditambah
  await prisma.place.deleteMany({}); 
  await prisma.tempatFasilitas.deleteMany({});
  await prisma.tempatKategori.deleteMany({});
  await prisma.tempat.deleteMany({});
  await prisma.kategori.deleteMany({});
  await prisma.fasilitas.deleteMany({});
  await prisma.kampus.deleteMany({});

  console.log('Data lama berhasil dibersihkan.');

  // 2. BUAT DATA KAMPUS (Top 20 Indonesia dengan koordinat geografis akurat)
  const listKampus = [
    {
      id_kampus: "KMP-TELU-01",
      nama_kampus: "Telkom University",
      alamat_kampus: "Jl. Telekomunikasi No. 1, Bojongsoang, Bandung, Jawa Barat",
      latitude: -6.9731,
      longitude: 107.6306,
    },
    {
      id_kampus: "KMP-UI-02",
      nama_kampus: "Universitas Indonesia (UI)",
      alamat_kampus: "Kampus UI Depok, Pondok Cina, Kec. Beji, Kota Depok, Jawa Barat",
      latitude: -6.3606,
      longitude: 106.8272,
    },
    {
      id_kampus: "KMP-UGM-03",
      nama_kampus: "Universitas Gadjah Mada (UGM)",
      alamat_kampus: "Bulaksumur, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta",
      latitude: -7.7681,
      longitude: 110.3786,
    },
    {
      id_kampus: "KMP-ITB-04",
      nama_kampus: "Institut Teknologi Bandung (ITB)",
      alamat_kampus: "Jl. Ganesa No. 10, Lb. Siliwangi, Kec. Coblong, Kota Bandung, Jawa Barat",
      latitude: -6.8915,
      longitude: 107.6106,
    },
    {
      id_kampus: "KMP-IPB-05",
      nama_kampus: "IPB University (IPB)",
      alamat_kampus: "Jl. Raya Dramaga, Babakan, Kec. Dramaga, Kabupaten Bogor, Jawa Barat",
      latitude: -6.5562,
      longitude: 106.7243,
    },
    {
      id_kampus: "KMP-UNAIR-06",
      nama_kampus: "Universitas Airlangga (UNAIR)",
      alamat_kampus: "Jl. Mayjen Prof. Dr. Moestopo No. 47, Pacar Kembang, Kec. Tambaksari, Kota Surabaya, Jawa Timur",
      latitude: -7.2676,
      longitude: 112.7844,
    },
    {
      id_kampus: "KMP-ITS-07",
      nama_kampus: "Institut Teknologi Sepuluh Nopember (ITS)",
      alamat_kampus: "Jl. Teknik Kimia, Keputih, Kec. Sukolilo, Kota Surabaya, Jawa Timur",
      latitude: -7.2824,
      longitude: 112.7949,
    },
    {
      id_kampus: "KMP-UNPAD-08",
      nama_kampus: "Universitas Padjadjaran (UNPAD)",
      alamat_kampus: "Jl. Raya Bandung Sumedang KM.21, Hegarmanah, Kec. Jatinangor, Kabupaten Sumedang, Jawa Barat",
      latitude: -6.9265,
      longitude: 107.7744,
    },
    {
      id_kampus: "KMP-UNDIP-09",
      nama_kampus: "Universitas Diponegoro (UNDIP)",
      alamat_kampus: "Jl. Prof. Sudarto No. 13, Tembalang, Kec. Tembalang, Kota Semarang, Jawa Tengah",
      latitude: -7.0494,
      longitude: 110.4392,
    },
    {
      id_kampus: "KMP-UB-10",
      nama_kampus: "Universitas Brawijaya (UB)",
      alamat_kampus: "Jl. Veteran, Ketawanggede, Kec. Lowokwaru, Kota Malang, Jawa Timur",
      latitude: -7.9526,
      longitude: 112.6144,
    },
    {
      id_kampus: "KMP-UNHAS-11",
      nama_kampus: "Universitas Hasanuddin (UNHAS)",
      alamat_kampus: "Jl. Perintis Kemerdekaan KM.10, Tamalanrea Indah, Kec. Tamalanrea, Kota Makassar, Sulawesi Selatan",
      latitude: -5.1328,
      longitude: 119.4883,
    },
    {
      id_kampus: "KMP-UNS-12",
      nama_kampus: "Universitas Sebelas Maret (UNS)",
      alamat_kampus: "Jl. Ir Sutami No. 36, Kentingan, Kec. Jebres, Kota Surakarta, Jawa Tengah",
      latitude: -7.5587,
      longitude: 110.8569,
    },
    {
      id_kampus: "KMP-UPI-13",
      nama_kampus: "Universitas Pendidikan Indonesia (UPI)",
      alamat_kampus: "Jl. Dr. Setiabudi No. 229, Isola, Kec. Sukasari, Kota Bandung, Jawa Barat",
      latitude: -6.8610,
      longitude: 107.5946,
    },
    {
      id_kampus: "KMP-USU-14",
      nama_kampus: "Universitas Sumatera Utara (USU)",
      alamat_kampus: "Jl. Dr. T. Mansur No. 9, Padang Bulan, Kec. Medan Baru, Kota Medan, Sumatera Utara",
      latitude: 3.5649,
      longitude: 98.6560,
    },
    {
      id_kampus: "KMP-USK-15",
      nama_kampus: "Universitas Syiah Kuala (USK)",
      alamat_kampus: "Jl. Teuku Nyak Arief No. 441, Kopelma Darussalam, Kec. Syiah Kuala, Kota Banda Aceh, Aceh",
      latitude: 5.5702,
      longitude: 95.3695,
    },
    {
      id_kampus: "KMP-UNAND-16",
      nama_kampus: "Universitas Andalas (UNAND)",
      alamat_kampus: "Limau Manis, Kec. Pauh, Kota Padang, Sumatera Barat",
      latitude: -0.9141,
      longitude: 100.4619,
    },
    {
      id_kampus: "KMP-UNSRI-17",
      nama_kampus: "Universitas Sriwijaya (UNSRI)",
      alamat_kampus: "Jl. Raya Palembang - Prabumulih KM.32, Timbangan, Kec. Indralaya, Kabupaten Ogan Ilir, Sumatera Selatan",
      latitude: -3.2185,
      longitude: 104.6506,
    },
    {
      id_kampus: "KMP-UNY-18",
      nama_kampus: "Universitas Negeri Yogyakarta (UNY)",
      alamat_kampus: "Jl. Colombo No. 1, Karang Malang, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta",
      latitude: -7.7736,
      longitude: 110.3868,
    },
    {
      id_kampus: "KMP-BINUS-19",
      nama_kampus: "Universitas Bina Nusantara (BINUS)",
      alamat_kampus: "Jl. K. H. Syahdan No. 9, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta",
      latitude: -6.2241,
      longitude: 106.7826,
    },
    {
      id_kampus: "KMP-UMY-20",
      nama_kampus: "Universitas Muhammadiyah Yogyakarta (UMY)",
      alamat_kampus: "Jl. Brawijaya, Geblagan, Tamantirto, Kec. Kasihan, Kabupaten Bantul, Daerah Istimewa Yogyakarta",
      latitude: -7.8118,
      longitude: 110.3218,
    }
  ];

  for (const k of listKampus) {
    await prisma.kampus.create({ data: k });
  }

  const kampusTelU = await prisma.kampus.findUnique({
    where: { id_kampus: "KMP-TELU-01" },
  });
  if (!kampusTelU) {
    throw new Error("Telkom University campus KMP-TELU-01 failed to seed.");
  }

  // 3. BUAT DATA KATEGORI
  const katKafe = await prisma.kategori.create({ data: { id_kategori: "KAT-1", nama_kategori: "Kafe" } });
  const katWarkop = await prisma.kategori.create({ data: { id_kategori: "KAT-2", nama_kategori: "Warkop" } });
  const katRestoran = await prisma.kategori.create({ data: { id_kategori: "KAT-3", nama_kategori: "Restoran" } });
  const katWorkspace = await prisma.kategori.create({ data: { id_kategori: "KAT-4", nama_kategori: "Workspace" } });

  // 4. BUAT DATA FASILITAS
  const fasWifi = await prisma.fasilitas.create({ data: { id_fasilitas: "FAS-1", nama_fasilitas: "WiFi Cepat (Up to 50Mbps)" } });
  const fasColokan = await prisma.fasilitas.create({ data: { id_fasilitas: "FAS-2", nama_fasilitas: "Banyak Stopkontak" } });
  const fasAC = await prisma.fasilitas.create({ data: { id_fasilitas: "FAS-3", nama_fasilitas: "Ruangan Full AC" } });
  const fasSmoking = await prisma.fasilitas.create({ data: { id_fasilitas: "FAS-4", nama_fasilitas: "Area Smoking" } });
  const fasMushola = await prisma.fasilitas.create({ data: { id_fasilitas: "FAS-5", nama_fasilitas: "Mushola Bersih" } });

  // 5. DATA TEMPAT
  const dataTempat = [
    {
      id: "TMP-001",
      nama: "Plumeria Cafe & Creative Space",
      alamat: "Jl. Cikawao, dekat area Bojongsoang",
      w_buka: "10:00", w_tutup: "22:00", text_buka: "10:00 - 22:00",
      harga: "Rp 25.000 - Rp 60.000",
      kategori: katKafe.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasColokan.id_fasilitas, fasAC.id_fasilitas, fasMushola.id_fasilitas],
      rating: 4.8, review: "Sangat nyaman untuk nugas", voucher: "PROMO10K",
      gambar: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop",
      menu_text: "Signature Coffee, Warm Croissant, Premium Matcha Latte, Chocolate Waffle, Spaghetti Carbonara"
    },
    {
      id: "TMP-002",
      nama: "Warkop ADD (Area Dalam)",
      alamat: "Kawasan Kost Telkom University, Sukabirus",
      w_buka: "00:00", w_tutup: "23:59", text_buka: "24 Jam",
      harga: "Rp 5.000 - Rp 20.000",
      kategori: katWarkop.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasSmoking.id_fasilitas],
      rating: 4.2, review: "Tempat nongkrong legendaris", voucher: null,
      gambar: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
      menu_text: "Indomie Goreng Double, Indomie Rebus Telur, Kopi Susu ADD, Es Teh Manis Jumbo, Nutrisari Dingin"
    },
    {
      id: "TMP-003",
      nama: "Ruang Delapan Workspace",
      alamat: "Jl. Terusan Buah Batu No. 120",
      w_buka: "08:00", w_tutup: "23:00", text_buka: "08:00 - 23:00",
      harga: "Mulai Rp 35.000 / Hari",
      kategori: katWorkspace.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasColokan.id_fasilitas, fasAC.id_fasilitas],
      rating: 4.9, review: "Internet sangat kencang", voucher: "WORKFREE",
      gambar: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop",
      menu_text: "Ice Americano, Creamy Cafe Latte, Cold Brew Coffee, Crispy French Fries, Classic Sandwich"
    },
    {
      id: "TMP-004",
      nama: "Tom Sushi Trans Studio Mall",
      alamat: "Lantai 2 TSM, Jl. Gatot Subroto, Bandung",
      w_buka: "10:00", w_tutup: "21:00", text_buka: "10:00 - 21:00",
      harga: "Rp 15.000 - Rp 50.000 / Plate",
      kategori: katRestoran.id_kategori,
      fasilitas: [fasAC.id_fasilitas],
      rating: 4.5, review: "Sushi murah tapi enak", voucher: "SUSHI5",
      gambar: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=800&auto=format&fit=crop",
      menu_text: "Salmon Mentaki Sushi, Tuna Salad Roll, Chicken Gyoza, Ebi Tempura, Hot Miso Soup"
    }
  ];

  // INSERT TEMPAT + PLACE
  for (const item of dataTempat) {
    await prisma.tempat.create({
      data: {
        id_tempat: item.id,
        nama_tempat: item.nama,
        alamat: item.alamat,
        waktu_buka: item.w_buka,
        waktu_tutup: item.w_tutup,
        jam_buka: item.text_buka,
        kisaran_harga: item.harga,
        id_kampus: kampusTelU.id_kampus,
        gambar: item.gambar,
        menu_text: item.menu_text,
        kategori: {
          create: { id_kategori: item.kategori }
        },
        fasilitas: {
          create: item.fasilitas.map((id) => ({
            id_fasilitas: id
          }))
        }
      }
    });

    await prisma.place.create({
      data: {
        name: item.nama,
        rating: item.rating,
        review: item.review,
        voucher: item.voucher,
        id_kampus: kampusTelU.id_kampus,
        tempatId: item.id
      }
    });

    console.log(`Berhasil insert: ${item.nama}`);
  }

  // 5b. SEED MEJA (Tables configuration)
  console.log("Memulai seeding data meja/lantai...");
  const mejasData = [
    // Plumeria Cafe (TMP-001)
    { nomor_meja: "Meja 01", nama_lantai: "Lantai 1", tipe_lantai: "INDOOR", kapasitas_kursi: 4, x: 25, y: 35, tempatId: "TMP-001" },
    { nomor_meja: "Meja 02", nama_lantai: "Lantai 1", tipe_lantai: "INDOOR", kapasitas_kursi: 4, x: 50, y: 35, tempatId: "TMP-001" },
    { nomor_meja: "Meja 03", nama_lantai: "Lantai 1", tipe_lantai: "INDOOR", kapasitas_kursi: 2, x: 75, y: 35, tempatId: "TMP-001" },
    { nomor_meja: "Meja 04", nama_lantai: "Lantai 2", tipe_lantai: "OUTDOOR_BALKON", kapasitas_kursi: 2, x: 35, y: 45, tempatId: "TMP-001" },
    { nomor_meja: "Meja 05", nama_lantai: "Lantai 2", tipe_lantai: "OUTDOOR_BALKON", kapasitas_kursi: 4, x: 65, y: 45, tempatId: "TMP-001" },

    // Warkop ADD (TMP-002)
    { nomor_meja: "Meja 01", nama_lantai: "Lantai 1", tipe_lantai: "OUTDOOR_TAMAN", kapasitas_kursi: 4, x: 30, y: 40, tempatId: "TMP-002" },
    { nomor_meja: "Meja 02", nama_lantai: "Lantai 1", tipe_lantai: "OUTDOOR_TAMAN", kapasitas_kursi: 6, x: 70, y: 40, tempatId: "TMP-002" },

    // Ruang Delapan Workspace (TMP-003)
    { nomor_meja: "Meja 01", nama_lantai: "Lantai 1", tipe_lantai: "INDOOR", kapasitas_kursi: 2, x: 20, y: 35, tempatId: "TMP-003" },
    { nomor_meja: "Meja 02", nama_lantai: "Lantai 1", tipe_lantai: "INDOOR", kapasitas_kursi: 4, x: 50, y: 35, tempatId: "TMP-003" },
    { nomor_meja: "Meja 03", nama_lantai: "Lantai 1", tipe_lantai: "INDOOR", kapasitas_kursi: 2, x: 80, y: 35, tempatId: "TMP-003" },

    // Tom Sushi (TMP-004)
    { nomor_meja: "Meja 01", nama_lantai: "Lantai 1", tipe_lantai: "INDOOR", kapasitas_kursi: 4, x: 35, y: 45, tempatId: "TMP-004" },
    { nomor_meja: "Meja 02", nama_lantai: "Lantai 1", tipe_lantai: "INDOOR", kapasitas_kursi: 4, x: 65, y: 45, tempatId: "TMP-004" },
  ];

  for (const m of mejasData) {
    await prisma.meja.create({ data: m });
  }
  console.log("Seeding data meja selesai!");

  // 6. SEED BOOKING 
  const semuaTempat = await prisma.tempat.findMany();
  const user = await prisma.user.findFirst();

  // Ambil meja contoh dari Plumeria Cafe untuk di-booking
  const mejaPlumeria = await prisma.meja.findFirst({
    where: { tempatId: "TMP-001" },
  });

  if (semuaTempat.length > 0 && mejaPlumeria) {
    // Booking contoh 1: 10:00 - 12:00
    await prisma.booking.create({
      data: {
        tanggal: new Date(),
        jam: "10:00 - 12:00",
        jam_mulai: "10:00",
        jam_selesai: "12:00",
        nama: "Putri",
        nomor: "081234567890",
        tempatId: "TMP-001",
        mejaId: mejaPlumeria.id,
        lantai: "Lantai 1 — Indoor",
        nomorMeja: mejaPlumeria.nomor_meja,
        userId: user?.id || null,
        status: "accepted",
      },
    });

    // Booking contoh 2: 14:00 - 16:00
    await prisma.booking.create({
      data: {
        tanggal: new Date(),
        jam: "14:00 - 16:00",
        jam_mulai: "14:00",
        jam_selesai: "16:00",
        nama: "Budi",
        nomor: "089876543210",
        tempatId: "TMP-001",
        mejaId: mejaPlumeria.id,
        lantai: "Lantai 1 — Indoor",
        nomorMeja: mejaPlumeria.nomor_meja,
        userId: user?.id || null,
        status: "accepted",
      },
    });

    console.log("Seed booking berhasil!");
  }

  console.log('Seeding selesai! Database siap digunakan.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
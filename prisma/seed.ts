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

  // 2. BUAT DATA KAMPUS
  const kampusTelU = await prisma.kampus.create({
    data: {
      id_kampus: "KMP-TELU-01",
      nama_kampus: "Telkom University",
      alamat_kampus: "Jl. Telekomunikasi No. 1, Terusan Buahbatu - Bojongsoang, Bandung",
    },
  });

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
      rating: 4.8, review: "Sangat nyaman untuk nugas", voucher: "PROMO10K"
    },
    {
      id: "TMP-002",
      nama: "Warkop ADD (Area Dalam)",
      alamat: "Kawasan Kost Telkom University, Sukabirus",
      w_buka: "00:00", w_tutup: "23:59", text_buka: "24 Jam",
      harga: "Rp 5.000 - Rp 20.000",
      kategori: katWarkop.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasSmoking.id_fasilitas],
      rating: 4.2, review: "Tempat nongkrong legendaris", voucher: null
    },
    {
      id: "TMP-003",
      nama: "Ruang Delapan Workspace",
      alamat: "Jl. Terusan Buah Batu No. 120",
      w_buka: "08:00", w_tutup: "23:00", text_buka: "08:00 - 23:00",
      harga: "Mulai Rp 35.000 / Hari",
      kategori: katWorkspace.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasColokan.id_fasilitas, fasAC.id_fasilitas],
      rating: 4.9, review: "Internet sangat kencang", voucher: "WORKFREE"
    },
    {
      id: "TMP-004",
      nama: "Tom Sushi Trans Studio Mall",
      alamat: "Lantai 2 TSM, Jl. Gatot Subroto, Bandung",
      w_buka: "10:00", w_tutup: "21:00", text_buka: "10:00 - 21:00",
      harga: "Rp 15.000 - Rp 50.000 / Plate",
      kategori: katRestoran.id_kategori,
      fasilitas: [fasAC.id_fasilitas],
      rating: 4.5, review: "Sushi murah tapi enak", voucher: "SUSHI5"
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

  // 6. SEED BOOKING 
  const semuaTempat = await prisma.tempat.findMany();
  const user = await prisma.user.findFirst();

  if (semuaTempat.length > 0) {
    await prisma.booking.createMany({
      data: [
        {
          tanggal: new Date(),
          jam: "10:00",
          nama: "Putri",
          nomor: "081234567890",
          tempatId: semuaTempat[0].id_tempat,
          userId: user?.id || null,
        },
        {
          tanggal: new Date(),
          jam: "14:00",
          nama: "Budi",
          nomor: "089876543210",
          tempatId: semuaTempat[0].id_tempat,
          userId: user?.id || null,
        },
      ],
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
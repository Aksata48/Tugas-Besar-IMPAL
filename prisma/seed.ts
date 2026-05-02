import prisma from '../src/lib/prisma'; // KUNCI SOLUSINYA DI SINI!

async function main() {
  console.log('Memulai proses seeding...')

  // 1. BERSIHKAN DATA LAMA (Dari relasi paling luar ke utama)
  await prisma.tempatFasilitas.deleteMany({});
  await prisma.tempatKategori.deleteMany({});
  await prisma.tempat.deleteMany({});
  await prisma.kategori.deleteMany({});
  await prisma.fasilitas.deleteMany({});
  await prisma.kampus.deleteMany({});

  console.log('Data lama berhasil dibersihkan.')

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

  // 5. BUAT 10 DUMMY TEMPAT
  const dataTempat = [
    {
      id: "TMP-001",
      nama: "Plumeria Cafe & Creative Space",
      alamat: "Jl. Cikawao, dekat area Bojongsoang",
      buka: "10:00 - 22:00",
      harga: "Rp 25.000 - Rp 60.000",
      kategori: katKafe.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasColokan.id_fasilitas, fasAC.id_fasilitas, fasMushola.id_fasilitas]
    },
    {
      id: "TMP-002",
      nama: "Warkop ADD (Area Dalam)",
      alamat: "Kawasan Kost Telkom University, Sukabirus",
      buka: "24 Jam",
      harga: "Rp 5.000 - Rp 20.000",
      kategori: katWarkop.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasSmoking.id_fasilitas]
    },
    {
      id: "TMP-003",
      nama: "Ruang Delapan Workspace",
      alamat: "Jl. Terusan Buah Batu No. 120",
      buka: "08:00 - 23:00",
      harga: "Mulai Rp 35.000 / Hari",
      kategori: katWorkspace.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasColokan.id_fasilitas, fasAC.id_fasilitas]
    },
    {
      id: "TMP-004",
      nama: "Tom Sushi Trans Studio Mall",
      alamat: "Lantai 2 TSM, Jl. Gatot Subroto, Bandung",
      buka: "10:00 - 21:00",
      harga: "Rp 15.000 - Rp 50.000 / Plate",
      kategori: katRestoran.id_kategori,
      fasilitas: [fasAC.id_fasilitas]
    },
    {
      id: "TMP-005",
      nama: "Kopi Anjis Buah Batu",
      alamat: "Jl. Buah Batu No. 132, Bandung",
      buka: "07:00 - 23:00",
      harga: "Rp 20.000 - Rp 45.000",
      kategori: katKafe.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasColokan.id_fasilitas, fasSmoking.id_fasilitas]
    },
    {
      id: "TMP-006",
      nama: "Sejiwa Coffee",
      alamat: "Jl. Progo No. 15, Citarum, Bandung",
      buka: "07:00 - 22:00",
      harga: "Rp 35.000 - Rp 100.000",
      kategori: katKafe.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasColokan.id_fasilitas, fasAC.id_fasilitas, fasMushola.id_fasilitas]
    },
    {
      id: "TMP-007",
      nama: "Shinju Ramen",
      alamat: "Jl. Lengkong Kecil, Bandung",
      buka: "11:00 - 22:00",
      harga: "Rp 30.000 - Rp 70.000",
      kategori: katRestoran.id_kategori,
      fasilitas: [fasAC.id_fasilitas, fasWifi.id_fasilitas]
    },
    {
      id: "TMP-008",
      nama: "Eduplex Coworking Space",
      alamat: "Jl. Ir. H. Juanda No. 84, Dago",
      buka: "24 Jam",
      harga: "Rp 50.000 / Hari",
      kategori: katWorkspace.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasColokan.id_fasilitas, fasAC.id_fasilitas, fasSmoking.id_fasilitas, fasMushola.id_fasilitas]
    },
    {
      id: "TMP-009",
      nama: "Warkop Gemboel",
      alamat: "PGA, Bojongsoang",
      buka: "18:00 - 04:00",
      harga: "Rp 10.000 - Rp 25.000",
      kategori: katWarkop.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasSmoking.id_fasilitas, fasColokan.id_fasilitas]
    },
    {
      id: "TMP-010",
      nama: "Sydwic",
      alamat: "Jl. Cilaki No. 63, Bandung",
      buka: "08:00 - 22:00",
      harga: "Rp 30.000 - Rp 80.000",
      kategori: katKafe.id_kategori,
      fasilitas: [fasWifi.id_fasilitas, fasAC.id_fasilitas, fasSmoking.id_fasilitas]
    }
  ];

  for (const item of dataTempat) {
    await prisma.tempat.create({
      data: {
        id_tempat: item.id,
        nama_tempat: item.nama,
        alamat: item.alamat,
        jam_buka: item.buka,
        kisaran_harga: item.harga,
        id_kampus: kampusTelU.id_kampus,
        kategori: {
          create: {
            id_kategori: item.kategori
          }
        },
        fasilitas: {
          create: item.fasilitas.map((id_fas) => ({
            id_fasilitas: id_fas
          }))
        }
      }
    });
    console.log(`Berhasil insert: ${item.nama}`);
  }

  console.log('Seeding selesai dengan sukses!');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
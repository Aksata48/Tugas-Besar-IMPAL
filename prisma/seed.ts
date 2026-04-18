import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Menyiapkan sapu ajaib untuk membersihkan data lama... 🧹")
  
  await prisma.tempatFasilitas.deleteMany()
  await prisma.tempatKategori.deleteMany()
  await prisma.fasilitas.deleteMany()
  await prisma.kategori.deleteMany()
  await prisma.tempat.deleteMany()
  await prisma.kampus.deleteMany()
  await prisma.user.deleteMany()

  console.log("Menanam 10 Data Kampus... 🏛️")
  const dataKampus = [
    { nama_kampus: 'Telkom University', alamat_kampus: 'Bojongsoang, Bandung' },
    { nama_kampus: 'ITB', alamat_kampus: 'Jl. Ganesa, Bandung' },
    { nama_kampus: 'Unpad', alamat_kampus: 'Jatinangor, Sumedang' },
    { nama_kampus: 'UI', alamat_kampus: 'Depok, Jawa Barat' },
    { nama_kampus: 'UGM', alamat_kampus: 'Bulaksumur, Yogyakarta' },
    { nama_kampus: 'UB', alamat_kampus: 'Jl. Veteran, Malang' },
    { nama_kampus: 'ITS', alamat_kampus: 'Sukolilo, Surabaya' },
    { nama_kampus: 'Undip', alamat_kampus: 'Tembalang, Semarang' },
    { nama_kampus: 'IPB', alamat_kampus: 'Dramaga, Bogor' },
    { nama_kampus: 'UPI', alamat_kampus: 'Setiabudi, Bandung' }
  ]
  const kps = []
  for (const k of dataKampus) { kps.push(await prisma.kampus.create({ data: k })) }

  console.log("Menanam 10 Data Fasilitas... 🔌")
  const fasNames = ['WiFi', 'AC', 'Parkir', 'Mushola', 'Stopkontak', 'Outdoor', 'Indoor', 'Live Music', 'Buka 24 Jam', 'Smoking Area']
  const fss = []
  for (const f of fasNames) { fss.push(await prisma.fasilitas.create({ data: { nama_fasilitas: f } })) }

  console.log("Menanam 10 Data Kategori... ☕")
  const katNames = ['Kafe', 'Warkop', 'Restoran', 'Library', 'Food Court', 'Bakery', 'Angkringan', 'Lounge', 'Kantin', 'Workspace']
  const kts = []
  for (const k of katNames) { kts.push(await prisma.kategori.create({ data: { nama_kategori: k } })) }

  console.log("Menanam 10 Data User & 1 Owner... 👤")
  const pass = await bcrypt.hash('password123', 10)
  
  // Buat 1 Akun Pemilik Cafe (Owner)
  await prisma.user.create({
    data: { username: 'Bos Kafe', email: 'owner@gmail.com', password: pass, role: 'OWNER' }
  })

  // Buat 10 Akun User Biasa (Umum)
  for (let i = 1; i <= 10; i++) {
    await prisma.user.create({
      data: {
        username: `Pengguna ${i}`,
        email: `user${i}@gmail.com`,
        password: pass,
        role: 'USER'
      }
    })
  }

  console.log("Membangun 10 Tempat Nongkrong... 🏗️")
  const tmpt = ['Nongki Hub', 'Kopi Senja', 'Warkop Abah', 'Point Cafe', 'Selasar Kopi', 'Gudang Diskusi', 'Warung Kita', 'Basecamp', 'Ruang Tamu', 'Sisi Jalan']
  
  for (let i = 0; i < tmpt.length; i++) {
    await prisma.tempat.create({
      data: {
        id_kampus: kps[0].id_kampus,
        nama_tempat: tmpt[i],
        alamat: `Alamat No. ${i+1}`,
        jam_buka: '08:00 - 22:00',
        kisaran_harga: 'Rp10rb - Rp30rb',
        fasilitas: { create: [{ id_fasilitas: fss[i % 10].id_fasilitas }, { id_fasilitas: fss[(i+1) % 10].id_fasilitas }] },
        kategori: { create: [{ id_kategori: kts[i % 10].id_kategori }] }
      }
    })
  }

  console.log("Selesai Wok! 10 data per class sudah masuk semua! ✨")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
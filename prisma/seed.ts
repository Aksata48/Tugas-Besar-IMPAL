import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Memulai penanaman data (seeding)... 🌱")

  // 1. Bersihkan data lama (opsional, agar tidak dobel jika di-run berkali-kali)
  await prisma.tempat.deleteMany()
  await prisma.kampus.deleteMany()

  // 2. Buat Data Kampus Induk
  const telkom = await prisma.kampus.create({
    data: {
      nama_kampus: 'Telkom University',
      alamat_kampus: 'Jl. Telekomunikasi, Bojongsoang',
    },
  })

  // 3. Masukkan banyak Data Tempat sekaligus dan hubungkan ke ID Kampus tadi
  await prisma.tempat.createMany({
    data: [
      {
        id_kampus: telkom.id_kampus, // Otomatis mengambil ID Telkom yang baru dibuat
        nama_tempat: 'Warkop Motekar Bojongsoang',
        alamat: 'Jl. Sukabirus, Bojongsoang',
        jam_buka: '24 Jam',
        kisaran_harga: 'Rp0-10rb',
        rating: 4.6,
        gambar: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&auto=format&fit=crop'
      },
      {
        id_kampus: telkom.id_kampus,
        nama_tempat: 'Ruang Nugas Cafe',
        alamat: 'Jl. Telekomunikasi, Dayeuhkolot',
        jam_buka: '09:00 - 23:00',
        kisaran_harga: 'Rp10rb-25rb',
        rating: 4.8,
        gambar: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=400&auto=format&fit=crop'
      },
      // Anda bisa menambahkan ratusan data lain di sini dengan mudah!
    ]
  })

  console.log("Seeding selesai! Data berhasil dimasukkan ke database. ✅")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
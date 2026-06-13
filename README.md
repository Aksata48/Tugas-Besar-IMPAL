
# ☕ NongkiYuk - Platform Pencarian & Booking Cafe Terdekat

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Payment_Gateway-002E5B?style=for-the-badge)](https://midtrans.com/)

**NongkiYuk** adalah platform berbasis web modern yang dirancang untuk membantu mahasiswa dan pencinta kopi menemukan tempat nongkrong (cafe/coworking space) terbaik di sekitar kampus mereka. Platform ini juga dilengkapi dengan fitur booking meja interaktif dan pembayaran DP secara online.

🌐 **Website URL (Vercel)**: [https://nongkiyuk.vercel.app](https://nongkiyuk.vercel.app)

---

## 👥 Anggota Kelompok 01 (Aksata)

Kami adalah mahasiswa/i Universitas Telkom (IF-48-06) untuk mata kuliah **IMPAL**:

| No | Foto / Avatar | Nama Lengkap | NIM | Peran |
|:---:|:---:|:---|:---|:---|
| **1** | 🧑‍💻 | **Ryan Maulana Bagus Putra** | 103012430029 | Full Stack Developer |
| **2** | 🧑‍💻 | **Faza Fawzan Azima** | 103012400248 | Lead Developer & Full Stack Developer |
| **3** | 👩‍💻 | **Putri Rahayu Damayanti** | 103012400277 | Full Stack Developer |
| **4** | 👩‍💻 | **Nurul Mukrima Amir** | 103012400047 | Full Stack Developer |
| **5** | 👩‍💻 | **Putri Ayu Lestari** | 103012430055 | Full Stack Developer |

---

## ✨ Fitur Utama

- 📍 **Pencarian Cafe Berbasis Lokasi Kampus**: Menemukan cafe terdekat dari kampus pilihan secara real-time.
- 🕒 **Logika Operasional Real-time**: Menampilkan status buka/tutup cafe secara otomatis berdasarkan waktu operasional saat ini.
- 🗺️ **Integrasi Peta Interaktif (Leaflet)**: Navigasi visual untuk melihat koordinat lokasi cafe secara presisi.
- 🪑 **Booking Meja Visual Interaktif**: Memilih lokasi meja (Indoor/Outdoor), lantai, dan kapasitas kursi secara visual untuk menghindari tumpang tindih waktu booking.
- 💳 **Pembayaran DP Digital (Midtrans QRIS)**: Integrasi dengan Midtrans Payment Gateway untuk pembayaran DP booking yang aman dan instan menggunakan QRIS.
- ⭐️ **Sistem Rating & Ulasan (Places & Reviews)**: Pengguna dapat memberikan ulasan, bintang rating, dan membagikan voucher menarik.
- 🔑 **Otentikasi Ganda**: Pendaftaran akun dan login menggunakan Email/Password tradisional atau Google OAuth yang praktis.
- ❤️ **Favorit & Bookmark**: Menyimpan cafe favorit ke dalam profil pribadi untuk akses cepat.

---

## 🛠️ Tech Stack & Dependensi

### Frontend & UI
- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4** (Modern styling & utility-first)
- **Lucide React** (Ikon modern & clean)
- **Leaflet & React-Leaflet** (Peta interaktif)
- **Recharts** (Visualisasi statistik dan chart)

### Backend & Database
- **Next.js Route Handlers** (Serverless API)
- **Prisma ORM** (Object-Relational Mapping)
- **SQLite / PostgreSQL** (Penyimpanan data relasional)
- **Bcrypt.js** (Hashing password aman)

### Integrasi Eksternal
- **Google Auth Library & React OAuth** (Login Google)
- **Midtrans Payment SDK** (Simulasi pembayaran QRIS/DP)

---

## 🚀 Panduan Penggunaan & Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek **NongkiYuk** di lingkungan lokal Anda:

### 1. Klon Repositori
```bash
git clone https://github.com/Aksata48/Tugas-Besar-IMPAL.git
cd Tugas-Besar-IMPAL
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Buat file bernama `.env` di root direktori dan sesuaikan variabel berikut:
```env
# Database URL (Sesuaikan dengan SQLite lokal atau PostgreSQL)
DATABASE_URL="file:./prisma/dev.db"

# Next Auth / Secret JWT
NEXTAUTH_SECRET="your-super-secret-key"

# Google Client OAuth (Opsional untuk Login Google)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Midtrans API Keys (Opsional untuk pembayaran)
MIDTRANS_MERCHANT_ID="your-midtrans-merchant-id"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
```

### 4. Setup Database & Migrasi Prisma
Jalankan migrasi database dan buat client Prisma:
```bash
npx prisma generate
npx prisma db push
```

### 5. Seeding Data Awal (Opsional)
Jalankan seeder untuk mengisi data kampus dan tempat rekomendasi awal:
```bash
npx prisma db seed
```

### 6. Jalankan Server Development
Jalankan server lokal:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi NongkiYuk berjalan!

---

## 🧪 Pengujian / Testing

Proyek ini dilengkapi dengan suite testing yang dapat dijalankan menggunakan:
```bash
npm run test
```

---

*Dibuat dengan ❤️ oleh Kelompok Aksata (Kelompok 01 - IF-48-06 Telkom University)*


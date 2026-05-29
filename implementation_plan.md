# Rencana Implementasi: Tambah Tempat Dinamis, Booking Anti-Overlap, & Batasan Akses Role

Rencana ini dibuat untuk menambahkan detail data meja/lantai pada sistem pendaftaran tempat, menyinkronkan data tersebut ke halaman booking secara dinamis, meningkatkan keandalan booking agar tidak terjadi tabrakan jadwal (*double-booking*), serta membatasi akses halaman agar Owner hanya bisa mengakses halaman Owner (tidak bisa ke Homepage) dan User biasa tidak bisa masuk ke halaman Owner.

---

## 📌 Pendapat & Rekomendasi Desain

Berikut adalah pendapat dan usulan arsitektur terbaik untuk mengakomodasi kebutuhan Anda:

### 1. Database Relasional untuk Lantai & Meja
Saat ini data meja dan lantai untuk booking masih di-hardcode di frontend (`DATA_DENAH`). Jika pemilik kafe baru mendaftarkan kafenya, pelanggan tidak akan bisa memilih meja karena nama kafenya belum terdaftar di kode.
*   **Rekomendasi**: Kita membuat model `Meja` baru di `schema.prisma`. Model ini akan menyimpan nama lantai, nomor meja, dan kapasitas kursi. Setiap meja berelasi langsung dengan model `Tempat`.
*   **Keuntungan**: Layout meja bersifat dinamis dan langsung tersimpan di database. Saat halaman booking dibuka, kita cukup memanggil API untuk mengambil daftar meja yang terdaftar pada tempat tersebut.

### 2. Logika Booking Jam Mulai & Selesai (Anti Double-Booking)
*   **Rekomendasi**: Memecah kolom waktu booking menjadi `jam_mulai` dan `jam_selesai` (misal: 10:00 - 12:00).
*   **Validasi Overlap**: Kita tambahkan logika di API Backend untuk memeriksa apakah pada tanggal dan meja yang sama sudah ada booking yang tumpang tindih. 
    *   *Rumus Overlap*: `JamMulaiBaru < JamSelesaiLama` DAN `JamSelesaiBaru > JamMulaiLama`. Jika benar, kembalikan error "Meja sudah di-booking pada jam tersebut."
*   **Batas Durasi**: Tetap kita batasi maksimal 2 jam untuk menjaga sirkulasi meja kafe.

### 3. Menu Makanan & Foto Tempat (URL Gambar)
*   **Rekomendasi**: Kita sediakan dua kolom di database untuk Menu:
    *   `menu_text`: Teks deskripsi menu andalan (opsional).
    *   `menu_gambar`: URL foto menu (opsional).
*   **Logika Validasi Menu**: Pada form Tambah Tempat, sistem akan mewajibkan Owner mengisi **salah satu dari keduanya** (bisa berupa Teks Menu ATAU URL Foto Menu, atau keduanya). Tidak boleh kosong dua-duanya. Jika memilih menggunakan Foto Menu, URL-nya harus diisi.
*   **Foto Tempat (URL Gambar)**: Untuk foto tempat utama, kita juga menggunakan input **URL Gambar** agar proses pengerjaan lebih ringan, cepat, dan terhindar dari bug hak akses folder (*file permission*) di Windows lokal Anda.

### 4. Tambah Tempat: Menggunakan Halaman Baru
*   **Rekomendasi**: Kita menggunakan halaman penuh khusus di `/owner/dashboard/tambah` (bukan pop-up/modal). Karena formulir penambahan tempat memiliki input yang sangat lengkap (termasuk peta interaktif dan rancangan meja dinamis), halaman baru akan memberikan kenyamanan navigasi yang jauh lebih baik dan mencegah data terhapus secara tidak sengaja.

### 5. Batasan Akses Peran (Role-Based Authorization & Redirect)
*   **Akses Owner**: Akun dengan role `OWNER` hanya boleh mengakses halaman miliknya (`/owner/...`). Jika mereka mencoba mengakses Homepage (`/`) atau halaman umum, sistem akan mendeteksi rolenya dan mengalihkan (*redirect*) mereka kembali ke `/owner/dashboard`.
*   **Akses User**: Akun dengan role `USER` hanya boleh mengakses halaman umum. Jika mereka mencoba masuk ke `/owner/dashboard`, sistem akan mendeteksi rolenya dan mengalihkan mereka kembali ke `/` (Homepage).
*   **Login & Register**: Alur setelah masuk/mendaftar disesuaikan. `OWNER` diarahkan langsung ke `/owner/dashboard`, sedangkan `USER` diarahkan ke `/`.

---

## 🛠️ Rincian Perubahan Kode

Berikut adalah berkas-berkas yang akan kita ubah:

### 💾 1. Komponen Basis Data & Seed

#### [MODIFY] [schema.prisma](file:///d:/ravi/Tugas-Besar-IMPAL/prisma/schema.prisma)
*   Menambahkan model `Meja`:
    ```prisma
    model Meja {
      id              String    @id @default(cuid())
      nomor_meja      String    // Contoh: "Meja 01"
      nama_lantai     String    // Contoh: "Lantai 1"
      kapasitas_kursi Int       // Contoh: 4
      tempatId        String
      tempat          Tempat    @relation(fields: [tempatId], references: [id_tempat], onDelete: Cascade)
      bookings        Booking[]
    }
    ```
*   Menambahkan kolom baru ke `Tempat`:
    *   `menu_text String?`
    *   `menu_gambar String?`
    *   `mejas Meja[]`
*   Memperbarui `Booking` agar memiliki relasi opsional dengan `Meja` (untuk kompatibilitas data lama):
    *   `mejaId String?`
    *   `meja Meja? @relation(fields: [mejaId], references: [id], onDelete: Cascade)`
    *   `jam_mulai String?` (Format "HH:mm")
    *   `jam_selesai String?` (Format "HH:mm")

#### [MODIFY] [seed.ts](file:///d:/ravi/Tugas-Besar-IMPAL/prisma/seed.ts)
*   Memperbarui proses seeding agar memasukkan data meja tiruan untuk tempat-tempat default (*Plumeria*, *Warkop ADD*, dsb.).
*   Memperbarui data booking contoh agar mereferensikan ID meja hasil seed.

---

### 🌐 2. API Routes (Backend)

#### [MODIFY] [route.ts (API Tempat)](file:///d:/ravi/Tugas-Besar-IMPAL/src/app/api/tempat/route.ts)
*   **POST**: Menerima data tempat baru beserta array meja (`lantaiData`), `menu_text`, dan `menu_gambar`. Backend akan membuat `Tempat` sekaligus melakukan `createMany` untuk model `Meja` yang terhubung.
*   **GET**: Memperbarui query agar melakukan *include* data `mejas` sehingga daftar meja bisa diakses oleh frontend.

#### [MODIFY] [route.ts (API Booking)](file:///d:/ravi/Tugas-Besar-IMPAL/src/app/api/booking/route.ts)
*   **POST**:
    1.  Menerima `mejaId`, `tanggal`, `jamMulai`, dan `jamSelesai`.
    2.  Mengambil jam operasional tempat (`waktu_buka` dan `waktu_tutup`) dan memverifikasi apakah waktu booking yang diminta berada di dalam jam operasional tempat tersebut. Jika di luar jam operasional, tolak pemesanan.
    3.  Melakukan query pengecekan tabrakan jadwal (*overlap query*) pada tabel `Booking` dengan filter `mejaId`, `tanggal`, dan irisan waktu. Jika meja sudah terisi di jam tersebut, tolak pemesanan.
    4.  Jika aman, buat record booking baru.

---

### 🎨 3. Frontend & Halaman User

#### [MODIFY] [login/page.tsx](file:///d:/ravi/Tugas-Besar-IMPAL/src/app/login/page.tsx)
*   Menyesuaikan alur setelah login berhasil: Jika user memiliki role `OWNER`, arahkan ke `/owner/dashboard`. Jika memiliki role `USER`, arahkan ke `/`.

#### [MODIFY] [register/page.tsx](file:///d:/ravi/Tugas-Besar-IMPAL/src/app/register/page.tsx)
*   Menyesuaikan alur setelah registrasi berhasil: Arahkan ke `/owner/dashboard` jika role pendaftar adalah `OWNER`, dan ke `/` jika `USER`.

#### [MODIFY] [HomeClient.tsx](file:///d:/ravi/Tugas-Besar-IMPAL/src/components/HomeClient.tsx)
*   Menambahkan logika otorisasi pada *hook* `useEffect`: Jika mendeteksi bahwa pengguna yang masuk memiliki role `OWNER`, segera alihkan mereka ke `/owner/dashboard`.

#### [MODIFY] [page.tsx (Dashboard Owner)](file:///d:/ravi/Tugas-Besar-IMPAL/src/app/owner/dashboard/page.tsx)
*   Mengubah aksi tombol "Tambah Tempat" agar melakukan `router.push('/owner/dashboard/tambah')` daripada membuka modal.
*   Menambahkan logika otorisasi: Jika mendeteksi pengguna masuk adalah `USER` biasa (bukan `OWNER`), segera alihkan mereka ke `/`.

#### [MODIFY] [tambah/page.tsx](file:///d:/ravi/Tugas-Besar-IMPAL/src/app/owner/dashboard/tambah/page.tsx)
*   Menghubungkan form submit dengan `fetch("/api/tempat")` metode `POST` untuk menyimpan tempat dan mejanya secara dinamis.
*   Menambahkan input teks untuk `menu_text` dan input URL untuk `menu_gambar`.
*   Memperbaiki navigasi tombol kembali agar mengarah ke `/owner/dashboard` (sebelumnya mengarah ke `/dashboard` yang tidak ada).

#### [MODIFY] [page.tsx (Halaman Booking)](file:///d:/ravi/Tugas-Besar-IMPAL/src/app/booking/page.tsx)
*   Menghapus `DATA_DENAH` yang di-hardcode.
*   Saat halaman dimuat, panggil database untuk mengambil data meja yang terdaftar untuk tempat tersebut, lalu kelompokkan secara dinamis berdasarkan nama lantai untuk ditampilkan pada dropdown Lantai dan Meja.

---

## 🧪 Rencana Verifikasi

### Pengujian Otomatis & Manual:
1.  **Pengujian Relasi Database**: Menjalankan `npx prisma db push` dan `npx prisma db seed`, lalu memverifikasi melalui Prisma Studio (`npx prisma studio`) apakah data meja berhasil terbuat dan berelasi dengan benar.
2.  **Otorisasi & Pengalihan**: 
    - Login sebagai akun `OWNER` dan coba buka halaman Homepage (`/`). Sistem harus mengalihkan kembali ke `/owner/dashboard`.
    - Login sebagai akun `USER` dan coba buka `/owner/dashboard`. Sistem harus mengalihkan kembali ke `/`.
3.  **Tambah Tempat & Meja**: Membuat kafe baru melalui form tambah tempat dengan daftar lantai & kapasitas meja kustom. Memastikan data masuk ke database.
4.  **Uji Overlap (Double-Booking Check)**: Mencoba membuat dua booking pada meja yang sama di hari yang sama pada jam yang bertabrakan. Pastikan booking kedua ditolak dengan pesan peringatan.
 meja sudah dipesan.

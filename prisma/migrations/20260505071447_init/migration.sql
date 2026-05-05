-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "no_telp" TEXT,
    "google_id" TEXT,
    "foto_profil" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Kampus" (
    "id_kampus" TEXT NOT NULL PRIMARY KEY,
    "nama_kampus" TEXT NOT NULL,
    "alamat_kampus" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id_kategori" TEXT NOT NULL PRIMARY KEY,
    "nama_kategori" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Fasilitas" (
    "id_fasilitas" TEXT NOT NULL PRIMARY KEY,
    "nama_fasilitas" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Tempat" (
    "id_tempat" TEXT NOT NULL PRIMARY KEY,
    "nama_tempat" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "waktu_buka" TEXT NOT NULL,
    "waktu_tutup" TEXT NOT NULL,
    "jam_buka" TEXT,
    "kisaran_harga" TEXT NOT NULL,
    "id_kampus" TEXT NOT NULL,
    CONSTRAINT "Tempat_id_kampus_fkey" FOREIGN KEY ("id_kampus") REFERENCES "Kampus" ("id_kampus") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TempatKategori" (
    "id_tempat" TEXT NOT NULL,
    "id_kategori" TEXT NOT NULL,

    PRIMARY KEY ("id_tempat", "id_kategori"),
    CONSTRAINT "TempatKategori_id_tempat_fkey" FOREIGN KEY ("id_tempat") REFERENCES "Tempat" ("id_tempat") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TempatKategori_id_kategori_fkey" FOREIGN KEY ("id_kategori") REFERENCES "Kategori" ("id_kategori") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TempatFasilitas" (
    "id_tempat" TEXT NOT NULL,
    "id_fasilitas" TEXT NOT NULL,

    PRIMARY KEY ("id_tempat", "id_fasilitas"),
    CONSTRAINT "TempatFasilitas_id_tempat_fkey" FOREIGN KEY ("id_tempat") REFERENCES "Tempat" ("id_tempat") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TempatFasilitas_id_fasilitas_fkey" FOREIGN KEY ("id_fasilitas") REFERENCES "Fasilitas" ("id_fasilitas") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tempatId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorit_tempatId_fkey" FOREIGN KEY ("tempatId") REFERENCES "Tempat" ("id_tempat") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "review" TEXT,
    "voucher" TEXT,
    "id_kampus" TEXT,
    "tempatId" TEXT NOT NULL,
    CONSTRAINT "Place_id_kampus_fkey" FOREIGN KEY ("id_kampus") REFERENCES "Kampus" ("id_kampus") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Place_tempatId_fkey" FOREIGN KEY ("tempatId") REFERENCES "Tempat" ("id_tempat") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL,
    "jam" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "tempatId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_tempatId_fkey" FOREIGN KEY ("tempatId") REFERENCES "Tempat" ("id_tempat") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "Favorit_userId_tempatId_key" ON "Favorit"("userId", "tempatId");

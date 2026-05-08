-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tempat" (
    "id_tempat" TEXT NOT NULL PRIMARY KEY,
    "nama_tempat" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "latitude" REAL NOT NULL DEFAULT -6.9175,
    "longitude" REAL NOT NULL DEFAULT 107.6191,
    "waktu_buka" TEXT NOT NULL,
    "waktu_tutup" TEXT NOT NULL,
    "jam_buka" TEXT,
    "kisaran_harga" TEXT NOT NULL,
    "id_kampus" TEXT NOT NULL,
    CONSTRAINT "Tempat_id_kampus_fkey" FOREIGN KEY ("id_kampus") REFERENCES "Kampus" ("id_kampus") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tempat" ("alamat", "id_kampus", "id_tempat", "jam_buka", "kisaran_harga", "nama_tempat", "waktu_buka", "waktu_tutup") SELECT "alamat", "id_kampus", "id_tempat", "jam_buka", "kisaran_harga", "nama_tempat", "waktu_buka", "waktu_tutup" FROM "Tempat";
DROP TABLE "Tempat";
ALTER TABLE "new_Tempat" RENAME TO "Tempat";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

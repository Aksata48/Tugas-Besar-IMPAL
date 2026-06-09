import prisma from "../src/lib/prisma";
import assert from "node:assert";

// Mock validation function mirroring our Next.js API POST endpoint logic
async function validateAndCreateBooking(data: {
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  nama: string;
  nomor: string;
  catatan?: string;
  tempatId: string;
  userId: string;
  mejaId: string;
}) {
  const {
    tanggal,
    jamMulai,
    jamSelesai,
    nama,
    nomor,
    catatan,
    tempatId,
    userId,
    mejaId,
  } = data;

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // 1. Durasi Max 2 Jam
  const menitMulai = toMinutes(jamMulai);
  const menitSelesai = toMinutes(jamSelesai);

  if (menitSelesai <= menitMulai) {
    throw new Error("Jam selesai harus lebih besar dari jam mulai.");
  }

  const durasiMenit = menitSelesai - menitMulai;
  if (durasiMenit > 120) {
    throw new Error(`Maksimal durasi booking adalah 2 jam (120 menit). Durasi Anda: ${durasiMenit} menit.`);
  }

  // 2. Jam Operasional Tempat
  const tempat = await prisma.tempat.findUnique({
    where: { id_tempat: tempatId },
  });

  if (!tempat) {
    throw new Error("Tempat tidak ditemukan.");
  }

  const menitBuka = toMinutes(tempat.waktu_buka);
  const menitTutup = toMinutes(tempat.waktu_tutup);

  if (menitMulai < menitBuka || menitSelesai > menitTutup) {
    throw new Error(`Jam booking di luar jam operasional. Tempat buka ${tempat.waktu_buka} - ${tempat.waktu_tutup}.`);
  }

  // 3. Anti-Overlap Check
  const tanggalDate = new Date(tanggal);
  const tanggalMulaiHari = new Date(tanggalDate);
  tanggalMulaiHari.setHours(0, 0, 0, 0);
  const tanggalAkhirHari = new Date(tanggalDate);
  tanggalAkhirHari.setHours(23, 59, 59, 999);

  const bookingBentrok = await prisma.booking.findFirst({
    where: {
      tanggal: {
        gte: tanggalMulaiHari,
        lte: tanggalAkhirHari,
      },
      mejaId,
      status: { not: "rejected" },
      jam_mulai: { lt: jamSelesai },
      jam_selesai: { gt: jamMulai },
    },
  });

  if (bookingBentrok) {
    throw new Error(`Meja sudah dipesan pada jam ${bookingBentrok.jam_mulai} - ${bookingBentrok.jam_selesai}. Pilih jam lain.`);
  }

  // Save to DB
  return await prisma.booking.create({
    data: {
      tanggal: tanggalDate,
      jam: `${jamMulai} - ${jamSelesai}`,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      nama,
      nomor,
      catatan: catatan || "-",
      tempatId,
      userId,
      mejaId,
      status: "pending",
    },
  });
}

async function runTests() {
  console.log("🚀 Starting Booking Overlap & Validation Tests...\n");

  // Setup test environment data
  const testKampusId = "KAMPUS-TEST";
  const testTempatId = "TEMPAT-TEST";
  const testMejaId = "MEJA-TEST";
  const testUserId = "USER-TEST";

  console.log("📦 Setting up test database records...");

  // Upsert Test Kampus
  await prisma.kampus.upsert({
    where: { id_kampus: testKampusId },
    update: {},
    create: {
      id_kampus: testKampusId,
      nama_kampus: "Kampus Test",
      alamat_kampus: "Jalan Test",
      latitude: -6.9175,
      longitude: 107.6191,
    },
  });

  // Upsert Test Tempat (Operating hours: 10:00 - 22:00)
  await prisma.tempat.upsert({
    where: { id_tempat: testTempatId },
    update: {
      waktu_buka: "10:00",
      waktu_tutup: "22:00",
    },
    create: {
      id_tempat: testTempatId,
      nama_tempat: "Test Kafe Overlap",
      alamat: "Test Street 123",
      waktu_buka: "10:00",
      waktu_tutup: "22:00",
      kisaran_harga: "murah",
      id_kampus: testKampusId,
    },
  });

  // Upsert Test Meja
  await prisma.meja.upsert({
    where: { id: testMejaId },
    update: {},
    create: {
      id: testMejaId,
      nomor_meja: "Meja Test 01",
      nama_lantai: "Lantai 1",
      kapasitas_kursi: 4,
      tempatId: testTempatId,
    },
  });

  // Upsert Test User
  await prisma.user.upsert({
    where: { id: testUserId },
    update: {},
    create: {
      id: testUserId,
      username: "testuser",
      email: "test@nongkiyuk.com",
      role: "USER",
    },
  });

  // Clear all bookings on this test table before running scenarios
  await prisma.booking.deleteMany({
    where: { mejaId: testMejaId },
  });

  console.log("🧹 Test database ready. Running scenarios...\n");

  const testTanggal = "2026-06-15";

  // ==========================================
  // SCENARIO 1: Valid Booking (Should Succeed)
  // ==========================================
  console.log("👉 Scenario 1: Booking a free table (12:00 - 14:00)...");
  const booking1 = await validateAndCreateBooking({
    tanggal: testTanggal,
    jamMulai: "12:00",
    jamSelesai: "14:00",
    nama: "Alice",
    nomor: "0812345",
    tempatId: testTempatId,
    userId: testUserId,
    mejaId: testMejaId,
  });
  assert.ok(booking1.id, "Booking 1 should have been saved successfully");
  console.log("✅ Success! Booking 1 created.");

  // ==========================================
  // SCENARIO 2: Overlapping Booking on Right Side (Should Fail)
  // ==========================================
  console.log("👉 Scenario 2: Booking with overlap on right side (13:00 - 15:00)...");
  await assert.rejects(
    async () => {
      await validateAndCreateBooking({
        tanggal: testTanggal,
        jamMulai: "13:00",
        jamSelesai: "15:00",
        nama: "Bob",
        nomor: "0812346",
        tempatId: testTempatId,
        userId: testUserId,
        mejaId: testMejaId,
      });
    },
    (err: any) => {
      assert.match(err.message, /Meja sudah dipesan/);
      return true;
    },
    "Should reject overlap on right side"
  );
  console.log("✅ Success! Rejected overlap on right side as expected.");

  // ==========================================
  // SCENARIO 3: Overlapping Booking on Left Side (Should Fail)
  // ==========================================
  console.log("👉 Scenario 3: Booking with overlap on left side (11:00 - 13:00)...");
  await assert.rejects(
    async () => {
      await validateAndCreateBooking({
        tanggal: testTanggal,
        jamMulai: "11:00",
        jamSelesai: "13:00",
        nama: "Charlie",
        nomor: "0812347",
        tempatId: testTempatId,
        userId: testUserId,
        mejaId: testMejaId,
      });
    },
    (err: any) => {
      assert.match(err.message, /Meja sudah dipesan/);
      return true;
    },
    "Should reject overlap on left side"
  );
  console.log("✅ Success! Rejected overlap on left side as expected.");

  // ==========================================
  // SCENARIO 4: Exceeds 2 Hour Duration Limit (Should Fail)
  // ==========================================
  console.log("👉 Scenario 4: Booking exceeding 2 hours limit (15:00 - 18:50)...");
  await assert.rejects(
    async () => {
      await validateAndCreateBooking({
        tanggal: testTanggal,
        jamMulai: "15:00",
        jamSelesai: "18:00",
        nama: "Daniel",
        nomor: "0812348",
        tempatId: testTempatId,
        userId: testUserId,
        mejaId: testMejaId,
      });
    },
    (err: any) => {
      assert.match(err.message, /Maksimal durasi booking adalah 2 jam/);
      return true;
    },
    "Should reject duration exceeding 2 hours"
  );
  console.log("✅ Success! Rejected duration exceeding 2 hours limit.");

  // ==========================================
  // SCENARIO 5: Outside Operating Hours (Should Fail)
  // ==========================================
  console.log("👉 Scenario 5: Booking outside operating hours (08:00 - 10:00)...");
  await assert.rejects(
    async () => {
      await validateAndCreateBooking({
        tanggal: testTanggal,
        jamMulai: "08:00",
        jamSelesai: "10:00",
        nama: "Ethan",
        nomor: "0812349",
        tempatId: testTempatId,
        userId: testUserId,
        mejaId: testMejaId,
      });
    },
    (err: any) => {
      assert.match(err.message, /Jam booking di luar jam operasional/);
      return true;
    },
    "Should reject booking outside operating hours"
  );
  console.log("✅ Success! Rejected booking outside operating hours.");

  console.log("\n🎉 All 5 scenarios executed successfully and passed all anti-overlap assertions!");
}

runTests().catch(err => {
  console.error("❌ Test Suite failed:", err);
  process.exit(1);
});

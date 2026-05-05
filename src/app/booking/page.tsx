"use client";

import { useState } from "react";
import Link from "next/link";

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [nama, setNama] = useState("");
  const [nomor, setNomor] = useState("");

  const [bookingSummary, setBookingSummary] = useState<any>(null);

  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(5);

  const times = Array.from({ length: 24 }, (_, i) => {
    return `${String(i).padStart(2, "0")}:00`;
  });

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const daysInMonth = new Date(
    selectedYear,
    selectedMonth,
    0
  ).getDate();

  const firstDay = new Date(
    selectedYear,
    selectedMonth - 1,
    1
  ).getDay();

  const handleBooking = async () => {
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggal: selectedDate,
          jam: selectedTime,
          nama,
          nomor,
          tempatId: "TMP-001",
        }),
      });

      const data = await response.json();

      if (data.success) {

        setBookingSummary({
          tanggal: selectedDate,
          jam: selectedTime,
          nama,
          nomor,
        });

        alert("Booking berhasil!");

        setSelectedDate("");
        setSelectedTime("");
        setNama("");
        setNomor("");

      } else {
        alert("Booking gagal");
      }
    } catch (error) {
      console.log(error);
      alert("Terjadi error");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">

      <h1 className="text-2xl font-bold mb-5">
        Booking Tempat
      </h1>

      {/* Kalender */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">

        {/* Header Kalender */}
        <div className="flex items-center justify-between mb-4 gap-2">

          {/* Bulan */}
          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(Number(e.target.value))
            }
            className="border rounded-lg px-2 py-1 text-sm"
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          {/* Tahun */}
          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(Number(e.target.value))
            }
            className="border rounded-lg px-2 py-1 text-sm"
          >
            {Array.from({ length: 20 }, (_, i) => 2026 + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>

        </div>

        {/* Nama Hari */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[11px] font-semibold text-gray-500">
          <div>Min</div>
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
        </div>

        {/* Kalender */}
        <div className="grid grid-cols-7 gap-1">

          {/* Kosong */}
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={index}></div>
          ))}

          {/* Tanggal */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
            (day) => {
              const fullDate = `${selectedYear}-${String(
                selectedMonth
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(fullDate)}
                  className={`h-9 rounded-lg text-xs border transition
                    ${
                      selectedDate === fullDate
                        ? "bg-black text-white"
                        : "hover:bg-gray-100"
                    }`}
                >
                  {day}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Jam */}
      <h2 className="font-semibold mt-6 mb-3">
        Pilih Jam
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {times.map((time) => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`py-2 rounded-lg border text-sm
              ${
                selectedTime === time
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
          >
            {time}
          </button>
        ))}
      </div>

      {/* Nama */}
      <div className="mt-5">
        <label className="block mb-2 text-sm font-semibold">
          Nama
        </label>

        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Masukkan nama"
          className="w-full border p-2 rounded-lg text-sm"
        />
      </div>

      {/* Nomor */}
      <div className="mt-4">
        <label className="block mb-2 text-sm font-semibold">
          Nomor HP
        </label>

        <input
          type="text"
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
          placeholder="Masukkan nomor HP"
          className="w-full border p-2 rounded-lg text-sm"
        />
      </div>

      {/* Tombol */}
      <button
        onClick={handleBooking}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
      >
        Booking Sekarang
      </button>

      {/* Ringkasan Booking */}
      {bookingSummary && (
        <div className="mt-6 border rounded-2xl p-4 bg-green-50 shadow-sm">

          <h2 className="text-lg font-bold text-green-700 mb-3">
            Ringkasan Booking
          </h2>

          <div className="space-y-2 text-sm">

            <div>
              <span className="font-semibold">
                Tanggal:
              </span>{" "}
              {bookingSummary.tanggal}
            </div>

            <div>
              <span className="font-semibold">
                Jam:
              </span>{" "}
              {bookingSummary.jam}
            </div>

            <div>
              <span className="font-semibold">
                Nama:
              </span>{" "}
              {bookingSummary.nama}
            </div>

            <div>
              <span className="font-semibold">
                Nomor HP:
              </span>{" "}
              {bookingSummary.nomor}
            </div>

          </div>
        </div>
      )}
        {/* LINK RIWAYAT BOOKING */}
      <Link
        href="/booking/list"
        className="block text-center mt-4 text-blue-600 font-semibold"
    >
        Lihat Riwayat Booking
    </Link>
    </div>
  );
}
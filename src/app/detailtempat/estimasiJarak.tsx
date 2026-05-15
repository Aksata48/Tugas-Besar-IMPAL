"use client";

import { Navigation } from "lucide-react";

function hitungJarak(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatWaktu(menit: number): string {
  if (menit < 60) return `${menit} menit`;
  return `${Math.floor(menit / 60)} jam ${menit % 60 > 0 ? `${menit % 60} menit` : ""}`.trim();
}

interface Props {
  kampusLat: number;
  kampusLng: number;
  tempatLat: number;
  tempatLng: number;
  namaKampus: string;
}

export default function EstimasiJarak({ kampusLat, kampusLng, tempatLat, tempatLng, namaKampus }: Props) {
  const jarak = hitungJarak(kampusLat, kampusLng, tempatLat, tempatLng);
  const jarakDisplay = jarak < 1 ? `${Math.round(jarak * 1000)} m` : `${jarak.toFixed(1)} km`;

  const kategori =
    jarak < 0.5 ? { label: "Sangat Dekat", color: "text-green-600 bg-green-50 border-green-200" } :
    jarak < 1.5 ? { label: "Dekat", color: "text-blue-600 bg-blue-50 border-blue-200" } :
    jarak < 3   ? { label: "Cukup Dekat", color: "text-yellow-600 bg-yellow-50 border-yellow-200" } :
                  { label: "Lumayan Jauh", color: "text-red-500 bg-red-50 border-red-200" };

  const modeTransportasi = [
    {
      icon: "🚶",
      label: "Jalan Kaki",
      menit: Math.round((jarak / 5) * 60),
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      textColor: "text-blue-700",
    },
    {
      icon: "🛵",
      label: "Naik Motor",
      menit: Math.round((jarak / 20) * 60),
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      textColor: "text-orange-700",
    },
    {
      icon: "🚗",
      label: "Naik Mobil",
      menit: Math.round((jarak / 30) * 60),
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      textColor: "text-green-700",
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Header strip berwarna */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Navigation size={16} className="shrink-0" />
          <p className="font-black text-sm">Estimasi Jarak</p>
        </div>
        <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${kategori.color}`}>
          {kategori.label}
        </span>
      </div>

      <div className="p-5">
        {/* Jarak utama */}
        <div className="flex items-end gap-2 mb-1">
          <p className="text-5xl font-extrabold text-gray-800 leading-none">{jarakDisplay}</p>
          <p className="text-sm text-gray-400 mb-1">dari kampus</p>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-5">
          📍 {namaKampus}
        </p>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-100 mb-5" />

        {/* 3 mode transportasi */}
        <div className="grid grid-cols-3 gap-3">
          {modeTransportasi.map((mode) => (
            <div
              key={mode.label}
              className={`${mode.bgColor} ${mode.borderColor} border rounded-xl p-3 text-center`}
            >
              <p className="text-2xl mb-1">{mode.icon}</p>
              <p className={`text-sm font-extrabold ${mode.textColor}`}>
                {formatWaktu(mode.menit)}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{mode.label}</p>
            </div>
          ))}
        </div>

        {/* Catatan kecil */}
        <p className="text-[10px] text-gray-300 text-center mt-4">
          *Estimasi berdasarkan jarak lurus, waktu aktual bisa berbeda
        </p>
      </div>
    </div>
  );
}
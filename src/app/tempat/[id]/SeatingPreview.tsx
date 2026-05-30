"use client";

import { useState } from "react";
import { Sliders, Settings } from "lucide-react";

interface MejaDB {
  id: string;
  nomor_meja: string;
  nama_lantai: string;
  tipe_lantai?: string | null;
  kapasitas_kursi: number;
  x?: number | null;
  y?: number | null;
}

const formatFloorTypeBadge = (tipe: string) => {
  if (!tipe) return "Indoor";
  switch (tipe) {
    case "OUTDOOR_BALKON": return "Outdoor (Balkon)";
    case "OUTDOOR_ROOFTOP": return "Outdoor (Rooftop)";
    case "OUTDOOR_TAMAN": return "Outdoor (Taman)";
    case "OUTDOOR_TERAS": return "Outdoor (Teras)";
    case "OUTDOOR": return "Outdoor";
    case "INDOOR":
    default: return "Indoor";
  }
};

const getFloorTheme = (tipe: string) => {
  switch (tipe) {
    case "OUTDOOR_BALKON":
      return {
        borderColor: "border-amber-200",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Outdoor (Balkon)",
        canvasBg: "bg-amber-50/10",
        tableStyle: "bg-white text-amber-700 border-amber-500",
        gridLineStyle: "linear-gradient(rgba(245, 158, 11, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR_ROOFTOP":
      return {
        borderColor: "border-orange-200",
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Outdoor (Rooftop)",
        canvasBg: "bg-orange-50/10",
        tableStyle: "bg-white text-orange-750 border-orange-500",
        gridLineStyle: "linear-gradient(rgba(249, 115, 22, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR_TAMAN":
      return {
        borderColor: "border-emerald-200",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Outdoor (Taman)",
        canvasBg: "bg-emerald-50/10",
        tableStyle: "bg-white text-emerald-750 border-emerald-550",
        gridLineStyle: "linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR_TERAS":
      return {
        borderColor: "border-teal-200",
        badge: "bg-teal-50 text-teal-700 border-teal-200",
        label: "Outdoor (Teras)",
        canvasBg: "bg-teal-50/10",
        tableStyle: "bg-white text-teal-750 border-teal-500",
        gridLineStyle: "linear-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.08) 1px, transparent 1px)"
      };
    case "OUTDOOR":
      return {
        borderColor: "border-orange-200",
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Outdoor",
        canvasBg: "bg-orange-50/10",
        tableStyle: "bg-white text-orange-700 border-orange-500",
        gridLineStyle: "linear-gradient(rgba(249, 115, 22, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.08) 1px, transparent 1px)"
      };
    case "INDOOR":
    default:
      return {
        borderColor: "border-blue-200",
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        label: "Indoor",
        canvasBg: "bg-slate-50",
        tableStyle: "bg-white text-blue-700 border-blue-600",
        gridLineStyle: "linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)"
      };
  }
};

export default function SeatingPreview({ mejas }: { mejas: MejaDB[] }) {
  const [selectedLantai, setSelectedLantai] = useState("");

  // Group meja berdasarkan nama_lantai dan tipe_lantai combined
  const lantaiMap: Record<string, MejaDB[]> = {};
  for (const meja of mejas) {
    const key = `${meja.nama_lantai} — ${formatFloorTypeBadge(meja.tipe_lantai || "INDOOR")}`;
    if (!lantaiMap[key]) lantaiMap[key] = [];
    lantaiMap[key].push(meja);
  }
  const daftarLantai = Object.keys(lantaiMap).sort();

  // Set default selected floor if empty
  if (!selectedLantai && daftarLantai.length > 0) {
    setSelectedLantai(daftarLantai[0]);
  }

  const daftarMejaLantaiIni = selectedLantai ? (lantaiMap[selectedLantai] || []) : [];

  if (mejas.length === 0) {
    return (
      <div className="text-gray-400 text-sm bg-white p-6 rounded-2xl border text-center font-semibold shadow-sm">
        ℹ️ Tata letak meja belum diatur oleh pemilik tempat.
      </div>
    );
  }

  const activeFloorTipe = daftarMejaLantaiIni.length > 0 ? (daftarMejaLantaiIni[0].tipe_lantai || "INDOOR") : "INDOOR";
  const theme = getFloorTheme(activeFloorTipe);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="text-blue-500" size={20} />
          <h4 className="font-extrabold text-gray-800 text-lg">Pratinjau Tata Letak Kursi</h4>
        </div>
        {/* Floor selector pills */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {daftarLantai.map(lt => (
            <button
              key={lt}
              type="button"
              onClick={() => setSelectedLantai(lt)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border outline-none
                ${selectedLantai === lt
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-150"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {lt}
            </button>
          ))}
        </div>
      </div>

      {selectedLantai && (
        <div className="space-y-3">
          {/* Visual Canvas Layout */}
          <div 
            className={`w-full h-80 rounded-3xl border relative overflow-hidden shadow-inner transition-colors duration-300 ${theme.borderColor} ${theme.canvasBg}`}
            style={{
              backgroundImage: theme.gridLineStyle,
              backgroundSize: "20px 20px"
            }}
          >
            {/* Legend / Floor Type Badge */}
            <div className={`absolute top-3 right-3 border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm pointer-events-none ${theme.badge}`}>
              {theme.label}
            </div>

            {/* Reference Pintu Masuk di Sebelah Bawah */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white border-t-2 border-x-2 border-gray-200 rounded-t-2xl px-6 py-2 shadow-md text-[9px] font-black text-slate-500 tracking-widest flex items-center gap-2 select-none z-10 cursor-default">
              <span className="text-xs">🚪</span>
              <span>PINTU MASUK UTAMA / ENTRANCE</span>
            </div>

            {/* Peta Meja */}
            {daftarMejaLantaiIni.map((meja, mIdx) => {
              let x = meja.x;
              let y = meja.y;
              
              // Fallback Auto-Grid jika koordinat 0
              if ((x === 0 && y === 0) || x === null || y === null || x === undefined || y === undefined) {
                const cols = 3;
                const row = Math.floor(mIdx / cols);
                const col = mIdx % cols;
                x = 18 + col * 32;
                y = 20 + row * 25;
              }

              return (
                <div
                  key={meja.id}
                  style={{ 
                    left: `${x}%`, 
                    top: `${y}%`, 
                    transform: "translate(-50%, -50%)" 
                  }}
                  className={`absolute w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow-md select-none ${theme.tableStyle} font-semibold transition-transform hover:scale-105 duration-200`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-none">
                    {meja.nomor_meja.replace("Meja ", "M")}
                  </span>
                  <span className="text-[9px] opacity-80 mt-0.5 leading-none">
                    👤{meja.kapasitas_kursi}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="flex justify-center gap-4 py-2 bg-gray-50 rounded-2xl border border-gray-150 text-xs font-bold text-gray-500 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-blue-500 bg-white" />
              <span>Tersedia untuk Booking</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function LeafletMap({ lat, lng, nama }: { lat: number; lng: number; nama: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Kalau sudah ada instance sebelumnya, hapus dulu
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Buat map baru
    const map = L.map(containerRef.current).setView([lat, lng], 15);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    L.marker([lat, lng], { icon: redIcon })
      .addTo(map)
      .bindPopup(`<b>${nama}</b>`)
      .openPopup();

    // Cleanup saat komponen unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, nama]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
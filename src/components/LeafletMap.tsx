"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function LeafletMap({
  lat,
  lng,
  nama,
  draggable = false,
  onDrag,
}: {
  lat: number;
  lng: number;
  nama: string;

  draggable?: boolean;

  onDrag?: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onDragRef = useRef(onDrag);

  // Keep onDrag updated in a ref to avoid resetting map event listeners when it changes
  useEffect(() => {
    onDragRef.current = onDrag;
  }, [onDrag]);

  // 1. Map Initialization (Runs once on mount)
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current).setView([lat, lng], 15);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Create marker
    const marker = L.marker([lat, lng], {
      icon: redIcon,
      draggable,
    }).addTo(map);
    markerRef.current = marker;

    marker.bindPopup(`<b>${nama}</b>`).openPopup();

    if (draggable) {
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        if (onDragRef.current) {
          onDragRef.current(pos.lat, pos.lng);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [draggable]); // Only reinitialize map if draggable prop itself changes

  // 2. Smoothly Update Map Center and Marker Position when coordinates or name update from parent
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (map && marker) {
      const currentCenter = map.getCenter();
      // Pan smoothly only if coordinates are significantly different (more than 0.0001 degrees)
      if (Math.abs(currentCenter.lat - lat) > 0.0001 || Math.abs(currentCenter.lng - lng) > 0.0001) {
        map.setView([lat, lng], 15, { animate: true, duration: 1.0 });
      }

      const currentMarkerPos = marker.getLatLng();
      if (Math.abs(currentMarkerPos.lat - lat) > 0.0001 || Math.abs(currentMarkerPos.lng - lng) > 0.0001) {
        marker.setLatLng([lat, lng]);
      }

      marker.setPopupContent(`<b>${nama}</b>`);
    }
  }, [lat, lng, nama]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%" }}
    />
  );
}
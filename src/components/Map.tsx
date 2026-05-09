"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">
      Memuat Peta...
    </div>
  ),
});

export default function TempatMap(props: { lat: number; lng: number; nama: string }) {
  return (
    <div className="h-full w-full relative z-0">
      <LeafletMap {...props} />
    </div>
  );
}
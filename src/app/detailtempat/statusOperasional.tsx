'use client';
import { useState, useEffect } from 'react';

interface StatusProps {
  buka: string; // dari waktu_buka (ex: "08:00")
  tutup: string; // dari waktu_tutup (ex: "23:00")
}

export default function StatusOperasional({ buka, tutup }: StatusProps) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const current = now.getHours() * 60 + now.getMinutes();

      const [hOpen, mOpen] = buka.split(':').map(Number);
      const [hClose, mClose] = tutup.split(':').map(Number);

      const openTime = hOpen * 60 + mOpen;
      const closeTime = hClose * 60 + mClose;

      if (closeTime < openTime) {
        // Logika jika tutup melewati tengah malam (ex: tutup jam 04:00 pagi)
        setIsOpen(current >= openTime || current <= closeTime);
      } else {
        setIsOpen(current >= openTime && current <= closeTime);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Update tiap menit
    return () => clearInterval(interval);
  }, [buka, tutup]);

  if (isOpen === null) return <span className="animate-pulse">Checking...</span>;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
      isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
      {isOpen ? 'Buka Sekarang' : 'Tutup'}
    </div>
  );
}
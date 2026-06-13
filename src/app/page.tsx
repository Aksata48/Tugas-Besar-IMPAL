export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

// Fungsi untuk mengambil data tempat dari Database
async function getTempatData() {
  const data = await prisma.tempat.findMany({
    include: {
      kategori: {
        include: { kategori: true }
      }
    }
  });
  return data;
}

export default async function HomePage() {
  const daftarTempat = await getTempatData();

  return <HomeClient tempatList={daftarTempat} />;
}
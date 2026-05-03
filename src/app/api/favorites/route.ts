import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const tempatId = searchParams.get("tempatId");

  if (!userId) {
    return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
  }

  try {
    // Skenario 1: Cek 1 tempat spesifik (Dipakai oleh tombol di halaman detail)
    if (tempatId) {
      const favorite = await prisma.favorit.findUnique({
        where: {
          userId_tempatId: {
            userId: userId,
            tempatId: tempatId,
          },
        },
      });
      return NextResponse.json({ isFavorite: !!favorite });
    }

    // Skenario 2: Ambil SEMUA daftar favorit user (Dipakai oleh halaman /favorites)
    const favoritesList = await prisma.favorit.findMany({
      where: { userId: userId },
      include: {
        tempat: {
          include: {
            kampus: true,
            kategori: { include: { kategori: true } },
            fasilitas: { include: { fasilitas: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' } // Urutkan dari yang paling baru disimpan
    });

    return NextResponse.json({ favorites: favoritesList });

  } catch (error) {
    console.error("GET Favorite Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data favorit" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, tempatId } = body;

    if (!userId || !tempatId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const existingFavorite = await prisma.favorit.findUnique({
      where: {
        userId_tempatId: {
          userId: userId,
          tempatId: tempatId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorit.delete({
        where: {
          userId_tempatId: {
            userId: userId,
            tempatId: tempatId,
          },
        },
      });
      return NextResponse.json({ message: "Dihapus dari favorit", isFavorite: false });
    } else {
      await prisma.favorit.create({
        data: {
          userId: userId,
          tempatId: tempatId,
        },
      });
      return NextResponse.json({ message: "Disimpan ke favorit", isFavorite: true });
    }
  } catch (error) {
    console.error("POST Favorite Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
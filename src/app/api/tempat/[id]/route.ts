import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

async function resolveFasilitasIds(fasilitasNamesOrIds: string[]) {
  const ids: string[] = [];
  
  for (const item of fasilitasNamesOrIds) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    
    // Check if it's an existing ID first (e.g. FAS-1)
    let fas = await prisma.fasilitas.findUnique({
      where: { id_fasilitas: trimmed }
    });
    
    // If not found by ID, try finding by name
    if (!fas) {
      fas = await prisma.fasilitas.findFirst({
        where: { nama_fasilitas: trimmed }
      });
    }
    
    // If still not found, create a new Fasilitas record
    if (!fas) {
      const generatedId = `FAS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      fas = await prisma.fasilitas.create({
        data: {
          id_fasilitas: generatedId,
          nama_fasilitas: trimmed
        }
      });
    }
    
    ids.push(fas.id_fasilitas);
  }
  
  return ids;
}

// ==========================================
// 1. GET: Mengambil Data Satu Tempat detail
// ==========================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const tempat = await prisma.tempat.findUnique({
      where: { id_tempat: id },
      include: {
        mejas: {
          orderBy: [
            { nama_lantai: "asc" },
            { nomor_meja: "asc" },
          ],
        },
        fasilitas: {
          include: { fasilitas: true }
        },
        kategori: {
          include: { kategori: true }
        }
      },
    });

    if (!tempat) {
      return NextResponse.json(
        { success: false, message: "Tempat tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tempat,
    });
  } catch (error) {
    console.error("ERROR GET DETAIL TEMPAT:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data tempat" },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. PUT: Memperbarui Data Tempat Secara Aman
// ==========================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("BODY PUT MASUK:", body);

    const {
      nama_tempat,
      alamat,
      jam_buka,
      kisaran_harga,
      id_kampus,
      latitude,
      longitude,
      gambar,
      menu_text,
      menu_gambar,
      lantaiData, // array lantai & meja
      kategori, // kategori pilihan (cth: "Cafe", "Warkop")
      fasilitas, // array nama/id fasilitas
    } = body;

    // Validasi wajib isi
    if (!nama_tempat || !alamat || !id_kampus) {
      return NextResponse.json(
        { success: false, message: "Nama, Alamat, dan Kampus wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi menu minimal satu
    const hasMenuText = menu_text && menu_text.trim().length > 0;
    const hasMenuGambar = menu_gambar && menu_gambar.trim().length > 0;
    if (!hasMenuText && !hasMenuGambar) {
      return NextResponse.json(
        {
          success: false,
          message: "Informasi menu wajib diisi. Masukkan minimal Deskripsi Menu atau Foto Menu.",
        },
        { status: 400 }
      );
    }

    // Parsing jam operasional
    let waktuBuka = "08:00";
    let waktuTutup = "22:00";
    const stringJam = jam_buka || "08:00 - 22:00";
    if (stringJam && stringJam.includes("-")) {
      const parts = stringJam.split("-");
      waktuBuka = parts[0]?.trim() || "08:00";
      waktuTutup = parts[1]?.trim() || "22:00";
    }

    // Bersihkan relasi kategori & fasilitas lama
    await prisma.tempatKategori.deleteMany({
      where: { id_tempat: id }
    });
    await prisma.tempatFasilitas.deleteMany({
      where: { id_tempat: id }
    });

    // Pemetaan kategori
    let idKategori = "";
    if (kategori) {
      const lowerKat = kategori.toLowerCase();
      if (lowerKat === "cafe" || lowerKat === "kafe") {
        idKategori = "KAT-1";
      } else if (lowerKat === "warkop") {
        idKategori = "KAT-2";
      } else if (lowerKat === "resto" || lowerKat === "restoran") {
        idKategori = "KAT-3";
      } else if (lowerKat === "coworking" || lowerKat === "workspace") {
        idKategori = "KAT-4";
      }
    }

    const resolvedFasIds = await resolveFasilitasIds(fasilitas || []);

    // Update Tempat umum
    const tempatUpdated = await prisma.tempat.update({
      where: { id_tempat: id },
      data: {
        nama_tempat,
        alamat,
        jam_buka: stringJam,
        waktu_buka: waktuBuka,
        waktu_tutup: waktuTutup,
        kisaran_harga,
        latitude: Number(latitude) || -6.9175,
        longitude: Number(longitude) || 107.6191,
        id_kampus,
        gambar: gambar || null,
        menu_text: menu_text || null,
        menu_gambar: menu_gambar || null,
        // Buat relasi baru
        ...(idKategori ? {
          kategori: {
            create: { id_kategori: idKategori }
          }
        } : {}),
        ...(resolvedFasIds.length > 0 ? {
          fasilitas: {
            create: resolvedFasIds.map(fid => ({ id_fasilitas: fid }))
          }
        } : {}),
      }
    });

    // --- SINKRONISASI MEJA (PINTAR & AMAN) ---
    if (Array.isArray(lantaiData)) {
      // 1. Ekstrak semua meja dari array lantaiData menjadi flat array
      const frontendMejas: Array<{
        id?: string;
        nomorMeja: string;
        kapasitas: number;
        x: number;
        y: number;
        tipeLantai: string;
        namaLantai: string;
      }> = [];

      for (const lantai of lantaiData) {
        if (!lantai.namaLantai) continue;
        const tipe = lantai.tipeLantai || "INDOOR";

        // Group lantai mejas
        if (Array.isArray(lantai.mejas)) {
          for (const m of lantai.mejas) {
            frontendMejas.push({
              id: m.id && !m.id.startsWith("m") && m.id.length > 5 ? m.id : undefined, // abaikan id temporary client cth "m1", "m2"
              nomorMeja: m.nomorMeja,
              kapasitas: Number(m.kapasitas) || 4,
              x: Number(m.x) || 0,
              y: Number(m.y) || 0,
              tipeLantai: m.tipeLantai || tipe,
              namaLantai: lantai.namaLantai,
            });
          }
        }
      }

      // Get existing meja dari DB untuk tempat ini
      const existingMejas = await prisma.meja.findMany({
        where: { tempatId: id }
      });

      const frontendIds = new Set(frontendMejas.map(m => m.id).filter(Boolean));

      // Hapus meja di DB yang tidak dikirim oleh frontend
      const toDelete = existingMejas.filter(em => !frontendIds.has(em.id));
      if (toDelete.length > 0) {
        await prisma.meja.deleteMany({
          where: { id: { in: toDelete.map(m => m.id) } }
        });
      }

      // Update / Create Meja dari frontend
      for (const fm of frontendMejas) {
        if (fm.id) {
          // Meja yang sudah ada -> Update
          await prisma.meja.update({
            where: { id: fm.id },
            data: {
              nomor_meja: fm.nomorMeja,
              nama_lantai: fm.namaLantai,
              tipe_lantai: fm.tipeLantai,
              kapasitas_kursi: fm.kapasitas,
              x: fm.x,
              y: fm.y,
            }
          });
        } else {
          // Meja baru -> Create
          await prisma.meja.create({
            data: {
              nomor_meja: fm.nomorMeja,
              nama_lantai: fm.namaLantai,
              tipe_lantai: fm.tipeLantai,
              kapasitas_kursi: fm.kapasitas,
              x: fm.x,
              y: fm.y,
              tempatId: id,
            }
          });
        }
      }
    }

    // Ambil tempat lengkap hasil pembaruan
    const tempatLengkap = await prisma.tempat.findUnique({
      where: { id_tempat: id },
      include: {
        mejas: {
          orderBy: [{ nama_lantai: "asc" }, { nomor_meja: "asc" }]
        },
        fasilitas: { include: { fasilitas: true } },
        kategori: { include: { kategori: true } }
      }
    });

    return NextResponse.json({
      success: true,
      tempat: tempatLengkap
    });
  } catch (error) {
    console.error("ERROR PUT DETAIL TEMPAT:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data tempat" },
      { status: 500 }
    );
  }
}

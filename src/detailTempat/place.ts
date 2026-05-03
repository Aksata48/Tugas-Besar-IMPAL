import prisma from '@/lib/prisma'; // Sesuaikan path-nya

export const getAllPlaces = async () => {
  return await prisma.place.findMany({
    include: {
      kampus: true, // Supaya bisa nampilin nama kampusnya juga
    },
  });
};
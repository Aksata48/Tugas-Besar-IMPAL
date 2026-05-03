import { defineConfig } from '@prisma/config';

export default defineConfig({
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    // Memberitahu Prisma CLI lokasi database Anda
    url: 'file:./dev.db',
  },
});
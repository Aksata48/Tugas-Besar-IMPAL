import { defineConfig } from '@prisma/config';

export default defineConfig({
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: 'file:./prisma/dev.db',
  },
});

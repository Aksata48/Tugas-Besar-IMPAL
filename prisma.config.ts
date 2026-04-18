import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Mesin akan otomatis mencari tulisan DATABASE_URL di file .env Anda
    url: env("DATABASE_URL"), 
  },
});
import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL: URL con pooling (Neon/Supabase pgbouncer) usada por la app en runtime.
// DIRECT_URL (opcional): conexión directa sin pooler, recomendada para `prisma db push` / migraciones.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});

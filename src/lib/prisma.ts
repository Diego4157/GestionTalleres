import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const isProd = process.env.NODE_ENV === "production";

// Pool pequeño en producción: en serverless cada instancia abre su propio pool y el
// pooler (pgbouncer de Neon/Supabase) multiplexa las conexiones.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: isProd ? 3 : 10,
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Los logs de queries solo en desarrollo (evita ruido y exposición de datos en producción).
    log: isProd ? ["error"] : ["query"],
  });

if (!isProd) globalForPrisma.prisma = prisma;

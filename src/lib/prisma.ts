import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

function createPrismaClient() {
  const adapter = new PrismaMssql({
    server: process.env.DB_SERVER ?? "pos-server-prasad.database.windows.net",
    port: Number(process.env.DB_PORT ?? 1433),
    database: process.env.DB_NAME ?? "pos-db",
    user: process.env.DB_USER ?? "posdbadmin",
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
    connectionTimeout: 30000, // 30 seconds (mssql expects ms)
    requestTimeout: 30000,
  });
  return new PrismaClient({ adapter, log: ["error", "warn"] });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Seed script — creates default admin and cashier users.
 * Run: npx tsx prisma/seed.ts
 *
 * Credentials (change passwords after first login):
 *   Admin:   admin@pos.local   / Admin@1234
 *   Cashier: cashier@pos.local / Cashier@1234
 */
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaMssql({
  server: process.env.DB_SERVER ?? "pos-server-prasad.database.windows.net",
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_NAME ?? "pos-db",
  user: process.env.DB_USER ?? "posdbadmin",
  password: process.env.DB_PASSWORD,
  options: { encrypt: true, trustServerCertificate: false },
  connectionTimeout: 30000,
  requestTimeout: 30000,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    { name: "Admin",   email: "admin@pos.local",   password: "Admin@1234",   role: "ADMIN" },
    { name: "Cashier", email: "cashier@pos.local", password: "Cashier@1234", role: "CASHIER" },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`⏭  Skipped (already exists): ${u.email}`);
      continue;
    }
    await prisma.user.create({
      data: { name: u.name, email: u.email, password: hash, role: u.role },
    });
    console.log(`✅ Created ${u.role}: ${u.email}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

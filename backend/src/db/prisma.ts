import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

/** Returns Prisma client when DATABASE_URL is set; otherwise null (legacy optional paths). */
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/** Required for auth, onboarding, and public reserve — fails fast if Postgres is unavailable. */
export function requirePrisma(): PrismaClient {
  const client = getPrisma();
  if (!client) {
    throw new Error(
      "DATABASE_URL is required. Start Postgres with `docker compose up -d` and set backend/.env",
    );
  }
  return client;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

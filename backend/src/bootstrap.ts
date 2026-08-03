import { syncBanksFromPrisma } from "./db/banksSync";
import { requirePrisma } from "./db/prisma";

let booted = false;

/** One-time DB connect + optional bank sync (safe for serverless cold starts). */
export async function bootstrapApi(): Promise<void> {
  if (booted) return;
  const prisma = requirePrisma();
  await prisma.$queryRaw`SELECT 1`;
  try {
    await syncBanksFromPrisma();
  } catch {
    /* non-fatal */
  }
  booted = true;
}

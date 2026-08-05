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
  try {
    const { ensureSimulationConfig } = await import("./services/simulationConfig");
    await ensureSimulationConfig();
  } catch {
    /* non-fatal until migration applied */
  }
  try {
    const { importLegacyJsonStores } = await import("./db/importLegacyJson");
    await importLegacyJsonStores();
  } catch {
    /* non-fatal until migration applied */
  }
  booted = true;
}

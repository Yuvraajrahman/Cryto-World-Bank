import { spawn } from "node:child_process";
import path from "node:path";
import type { Logger } from "pino";

let syncRunning = false;
let intervalTimer: ReturnType<typeof setInterval> | null = null;

function backendRoot(): string {
  return process.cwd();
}

function runNeonSync(logger: Logger): void {
  if (syncRunning) {
    logger.info("neon-sync: already running, skip");
    return;
  }

  const neonUrl =
    process.env.NEON_SYNC_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!neonUrl) {
    logger.warn("neon-sync: SYNC_NEON_ON_START enabled but NEON_SYNC_URL is not set");
    return;
  }

  syncRunning = true;
  const script = path.join(backendRoot(), "scripts", "sync-local-to-neon.sh");
  logger.info("neon-sync: pushing local Postgres → Neon (background)…");

  const child = spawn("bash", [script], {
    cwd: backendRoot(),
    env: { ...process.env, NEON_SYNC_URL: neonUrl },
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  child.stdout?.on("data", (buf) => {
    for (const line of String(buf).split("\n").filter(Boolean)) {
      logger.info({ neonSync: line });
    }
  });
  child.stderr?.on("data", (buf) => {
    for (const line of String(buf).split("\n").filter(Boolean)) {
      logger.warn({ neonSync: line });
    }
  });

  child.on("close", (code) => {
    syncRunning = false;
    if (code === 0) logger.info("neon-sync: completed successfully");
    else logger.warn({ exitCode: code }, "neon-sync: failed");
  });
}

/**
 * When Mac backend starts, optionally push local DB to Neon so cloud fallback stays current.
 * Enable: SYNC_NEON_ON_START=1 and NEON_SYNC_URL=<Neon direct/unpooled URL>
 * Optional: SYNC_NEON_INTERVAL_MS=1800000 (repeat every 30 min while Mac is on)
 */
export function startNeonSyncJob(logger: Logger): () => void {
  if (process.env.SYNC_NEON_ON_START !== "1") {
    return () => undefined;
  }

  runNeonSync(logger);

  const intervalMs = Number(process.env.SYNC_NEON_INTERVAL_MS || 0);
  if (Number.isFinite(intervalMs) && intervalMs >= 60_000) {
    intervalTimer = setInterval(() => runNeonSync(logger), intervalMs);
    intervalTimer.unref();
    logger.info({ intervalMs }, "neon-sync: periodic sync enabled");
  }

  return () => {
    if (intervalTimer) clearInterval(intervalTimer);
  };
}

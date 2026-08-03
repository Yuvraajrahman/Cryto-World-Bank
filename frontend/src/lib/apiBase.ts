/**
 * API base URL resolution with Mac-first / cloud-fallback.
 *
 * Env (production):
 *   VITE_API_PRIMARY_URL   — HTTPS tunnel to your Mac (e.g. ngrok / Cloudflare)
 *   VITE_API_FALLBACK_URL  — Cloud API when Mac is off (default: cryto-world-bank-api.vercel.app)
 *
 * Dev: empty string → Vite proxy to localhost:4000.
 */

const PRIMARY = normalizeBase(import.meta.env.VITE_API_PRIMARY_URL);
const FALLBACK =
  normalizeBase(import.meta.env.VITE_API_FALLBACK_URL) ||
  normalizeBase(import.meta.env.VITE_API_BASE_URL) ||
  "https://cryto-world-bank-api.vercel.app";

const CACHE_KEY = "cwb-api-base";
const CACHE_LABEL_KEY = "cwb-api-base-label";
const CACHE_AT_KEY = "cwb-api-base-at";
const CACHE_TTL_MS = 60_000;
const HEALTH_TIMEOUT_MS = 4_000;

export type ApiBackendKind = "dev" | "local" | "cloud";

function normalizeBase(v: unknown): string {
  if (typeof v !== "string" || !v.trim()) return "";
  return v.trim().replace(/\/$/, "");
}

function readCache(): { base: string; label: ApiBackendKind; at: number } | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const base = sessionStorage.getItem(CACHE_KEY);
    const label = sessionStorage.getItem(CACHE_LABEL_KEY) as ApiBackendKind | null;
    const at = Number(sessionStorage.getItem(CACHE_AT_KEY) || 0);
    if (!base || !label || !at) return null;
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return { base, label, at };
  } catch {
    return null;
  }
}

function writeCache(base: string, label: ApiBackendKind): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, base);
    sessionStorage.setItem(CACHE_LABEL_KEY, label);
    sessionStorage.setItem(CACHE_AT_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function clearApiBaseCache(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_LABEL_KEY);
    sessionStorage.removeItem(CACHE_AT_KEY);
  } catch {
    /* ignore */
  }
}

export function getApiBackendLabel(): ApiBackendKind {
  if (import.meta.env.DEV) return "dev";
  const cached = readCache();
  if (cached?.label) return cached.label;
  return PRIMARY ? "local" : "cloud";
}

/** Sync read — cached or best guess (use resolveApiBaseUrl before first API call). */
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) return "";
  const cached = readCache();
  if (cached) return cached.base;
  return PRIMARY || FALLBACK;
}

async function pingHealth(base: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HEALTH_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/health`, { signal: ctrl.signal, cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Pick Mac tunnel when healthy, else cloud (Neon) API. */
export async function resolveApiBaseUrl(force = false): Promise<string> {
  if (import.meta.env.DEV) return "";

  if (!force) {
    const cached = readCache();
    if (cached) return cached.base;
  }

  if (PRIMARY && (await pingHealth(PRIMARY))) {
    writeCache(PRIMARY, "local");
    return PRIMARY;
  }

  writeCache(FALLBACK, "cloud");
  return FALLBACK;
}

export function getConfiguredApiEndpoints(): { primary: string; fallback: string } {
  return { primary: PRIMARY, fallback: FALLBACK };
}

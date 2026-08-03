/**
 * API base URL resolution with Mac-first / cloud-fallback.
 *
 * Env (production):
 *   VITE_API_PRIMARY_URL=same-origin
 *     → browser calls /api and /health on cryto-world-bank.vercel.app
 *     → Vercel rewrites those to your Mac tunnel (no CORS / no ngrok interstitial)
 *   VITE_API_PRIMARY_URL=https://….ngrok-free.dev
 *     → direct tunnel (fragile on free ngrok — CORS interstitial)
 *   VITE_API_FALLBACK_URL
 *     → Cloud API when Mac/tunnel is down (default: cryto-world-bank-api.vercel.app)
 *
 * Dev: empty string → Vite proxy to localhost:4000.
 */

const SAME_ORIGIN_TOKEN = "same-origin";

const PRIMARY_RAW = normalizeBase(import.meta.env.VITE_API_PRIMARY_URL);
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
  const t = v.trim().replace(/\/$/, "");
  if (t === SAME_ORIGIN_TOKEN || t === "/") return SAME_ORIGIN_TOKEN;
  return t;
}

/** Value used in fetch(`${base}${path}`) — same-origin → "". */
function toFetchBase(stored: string): string {
  return stored === SAME_ORIGIN_TOKEN ? "" : stored;
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
  return PRIMARY_RAW ? "local" : "cloud";
}

/** Sync read — cached or best guess (use resolveApiBaseUrl before first API call). */
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) return "";
  const cached = readCache();
  if (cached) return toFetchBase(cached.base);
  if (PRIMARY_RAW === SAME_ORIGIN_TOKEN) return "";
  return PRIMARY_RAW || FALLBACK;
}

async function pingHealth(storedBase: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HEALTH_TIMEOUT_MS);
  try {
    const base = toFetchBase(storedBase);
    const res = await fetch(`${base}/health`, {
      signal: ctrl.signal,
      cache: "no-store",
      // Free ngrok interstitial: skip when (rarely) hitting the tunnel directly
      headers: { "ngrok-skip-browser-warning": "1" },
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Prefer Mac (same-origin Vercel→tunnel rewrite, or direct tunnel) when healthy;
 * else cloud (Neon) API.
 */
export async function resolveApiBaseUrl(force = false): Promise<string> {
  if (import.meta.env.DEV) return "";

  if (!force) {
    const cached = readCache();
    if (cached) return toFetchBase(cached.base);
  }

  if (PRIMARY_RAW && (await pingHealth(PRIMARY_RAW))) {
    writeCache(PRIMARY_RAW, "local");
    return toFetchBase(PRIMARY_RAW);
  }

  writeCache(FALLBACK, "cloud");
  return FALLBACK;
}

export function getConfiguredApiEndpoints(): { primary: string; fallback: string } {
  return { primary: PRIMARY_RAW, fallback: FALLBACK };
}

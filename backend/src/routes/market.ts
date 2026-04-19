import { Router } from "express";

export const marketRouter = Router();

// ---------- caching ---------------------------------------------------------

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value as T;
}

function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) throw new Error(`upstream_${r.status}`);
    return (await r.json()) as T;
  } finally {
    clearTimeout(to);
  }
}

// ---------- deterministic offline fallback ---------------------------------
//
// CoinGecko's free tier is aggressively rate-limited. When the upstream
// rejects us (429 / 5xx / network error) we still want the UI to render a
// coherent, reproducible chart so the demo doesn't visibly break. The
// series is seeded from the coin id so every caller receives identical
// numbers for the same coin + window.

const basePriceUsd: Record<string, number> = {
  bitcoin: 64_200,
  ethereum: 2_015,
  "matic-network": 0.54,
  "usd-coin": 1,
  tether: 1,
};

function seededSeries(coin: string, days: number, points: number) {
  const base = basePriceUsd[coin] ?? 100;
  const seed = [...coin].reduce((a, c) => a + c.charCodeAt(0), 0) + days;
  const out: Array<[number, number]> = [];
  const now = Date.now();
  const stepMs = Math.max(1, Math.floor((days * 86_400_000) / (points - 1)));
  for (let i = 0; i < points; i += 1) {
    const t = now - (points - 1 - i) * stepMs;
    const wave = Math.sin((i + seed) / 4) + Math.cos((i + seed) / 11) * 0.5;
    const drift = ((i - points / 2) / points) * 0.04;
    const price = base * (1 + wave * 0.015 + drift);
    out.push([t, Number(price.toFixed(coin === "usd-coin" || coin === "tether" ? 4 : 2))]);
  }
  return out;
}

// ---------- GET /api/market/prices -----------------------------------------

interface CoinGeckoPriceRow {
  usd: number;
  usd_24h_change?: number;
  usd_24h_vol?: number;
  usd_market_cap?: number;
}
type CoinGeckoPrices = Record<string, CoinGeckoPriceRow>;

marketRouter.get("/prices", async (req, res) => {
  const ids =
    typeof req.query.ids === "string" && req.query.ids
      ? req.query.ids
      : "bitcoin,ethereum,matic-network,usd-coin,tether";
  const key = `prices:${ids}`;

  const cached = cacheGet<CoinGeckoPrices>(key);
  if (cached) {
    res.json({ source: "cache", prices: cached });
    return;
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      ids,
    )}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    const data = await fetchJson<CoinGeckoPrices>(url);
    cacheSet(key, data, 60_000);
    res.json({ source: "live", prices: data });
  } catch {
    const fallback: CoinGeckoPrices = {};
    for (const id of ids.split(",")) {
      const base = basePriceUsd[id] ?? 1;
      fallback[id] = {
        usd: base,
        usd_24h_change: ((([...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 7) - 3) * 0.6),
        usd_24h_vol: base * 1_000_000,
        usd_market_cap: base * 1_000_000_000,
      };
    }
    cacheSet(key, fallback, 30_000);
    res.json({ source: "offline", prices: fallback });
  }
});

// ---------- GET /api/market/history?id=ethereum&days=30 --------------------

interface CoinGeckoMarketChart {
  prices: Array<[number, number]>;
  market_caps: Array<[number, number]>;
  total_volumes: Array<[number, number]>;
}

marketRouter.get("/history", async (req, res) => {
  const id = (typeof req.query.id === "string" && req.query.id) || "ethereum";
  const daysRaw = Number(req.query.days ?? 30);
  const days = [1, 7, 30, 90, 180, 365].includes(daysRaw) ? daysRaw : 30;
  const key = `history:${id}:${days}`;

  const cached = cacheGet<{ series: Array<[number, number]>; source: string }>(key);
  if (cached) {
    res.json({ id, days, ...cached, cached: true });
    return;
  }

  const interval = days <= 1 ? "hourly" : "daily";
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(
      id,
    )}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;
    const data = await fetchJson<CoinGeckoMarketChart>(url);
    const series = data.prices;
    const payload = { series, source: "live" as const };
    cacheSet(key, payload, 120_000);
    res.json({ id, days, ...payload, cached: false });
  } catch {
    const points = days <= 1 ? 24 : Math.min(120, days);
    const series = seededSeries(id, days, points);
    const payload = { series, source: "offline" as const };
    cacheSet(key, payload, 30_000);
    res.json({ id, days, ...payload, cached: false });
  }
});

// ---------- GET /api/market/summary ----------------------------------------

interface CoinGeckoGlobal {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
  };
}

marketRouter.get("/summary", async (_req, res) => {
  const key = "summary";
  const cached = cacheGet<Record<string, unknown>>(key);
  if (cached) {
    res.json({ source: "cache", ...cached });
    return;
  }
  try {
    const data = await fetchJson<CoinGeckoGlobal>("https://api.coingecko.com/api/v3/global");
    const payload = {
      activeCoins: data.data.active_cryptocurrencies,
      markets: data.data.markets,
      totalMarketCapUsd: data.data.total_market_cap.usd,
      totalVolume24hUsd: data.data.total_volume.usd,
      btcDominance: data.data.market_cap_percentage.btc,
      ethDominance: data.data.market_cap_percentage.eth,
      change24hPct: data.data.market_cap_change_percentage_24h_usd,
    };
    cacheSet(key, payload, 180_000);
    res.json({ source: "live", ...payload });
  } catch {
    const payload = {
      activeCoins: 10_000,
      markets: 900,
      totalMarketCapUsd: 2_500_000_000_000,
      totalVolume24hUsd: 95_000_000_000,
      btcDominance: 52,
      ethDominance: 17,
      change24hPct: 0.8,
    };
    cacheSet(key, payload, 60_000);
    res.json({ source: "offline", ...payload });
  }
});

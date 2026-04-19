import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Radio, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export type MarketCoinId =
  | "bitcoin"
  | "ethereum"
  | "matic-network"
  | "usd-coin"
  | "tether";

export const MARKET_COINS: Array<{ id: MarketCoinId; symbol: string; name: string }> = [
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
  { id: "tether", symbol: "USDT", name: "Tether" },
];

const WINDOWS: Array<{ days: 1 | 7 | 30 | 90 | 365; label: string }> = [
  { days: 1, label: "24H" },
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
  { days: 365, label: "1Y" },
];

interface HistoryResponse {
  id: string;
  days: number;
  series: Array<[number, number]>;
  source: "live" | "offline";
  cached: boolean;
}

interface PricesResponse {
  source: "live" | "cache" | "offline";
  prices: Record<string, { usd: number; usd_24h_change?: number }>;
}

interface Props {
  initialCoin?: MarketCoinId;
  initialDays?: (typeof WINDOWS)[number]["days"];
  referenceAmount?: { priceUsd: number; label: string };
  className?: string;
  compact?: boolean;
}

function formatPrice(n: number) {
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function formatTick(ts: number, days: number) {
  const d = new Date(ts);
  if (days <= 1) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days <= 90) return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", year: "2-digit" });
}

export function MarketDataChart({
  initialCoin = "ethereum",
  initialDays = 30,
  referenceAmount,
  className,
  compact = false,
}: Props) {
  const [coin, setCoin] = useState<MarketCoinId>(initialCoin);
  const [days, setDays] = useState<(typeof WINDOWS)[number]["days"]>(initialDays);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useMemo(
    () => async () => {
      setLoading(true);
      setError(null);
      try {
        const [h, p] = await Promise.all([
          api.get<HistoryResponse>(`/api/market/history?id=${coin}&days=${days}`),
          api.get<PricesResponse>(`/api/market/prices?ids=${coin}`),
        ]);
        setHistory(h);
        setPrices(p);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load market data");
      } finally {
        setLoading(false);
      }
    },
    [coin, days],
  );

  useEffect(() => {
    load();
    const t = setInterval(load, 5 * 60_000);
    return () => clearInterval(t);
  }, [load]);

  const series = useMemo(
    () =>
      (history?.series ?? []).map(([t, p]) => ({
        t,
        price: p,
      })),
    [history],
  );

  const current = prices?.prices[coin];
  const change = current?.usd_24h_change ?? 0;
  const positive = change >= 0;
  const source = history?.source ?? prices?.source ?? "offline";
  const live = source === "live" || source === "cache";

  const low = series.length ? Math.min(...series.map((s) => s.price)) : 0;
  const high = series.length ? Math.max(...series.map((s) => s.price)) : 0;

  return (
    <div className={cn("card p-6", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.22em] text-ink-200">
              {MARKET_COINS.find((c) => c.id === coin)?.symbol ?? coin.toUpperCase()} / USD
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider",
                live
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-300",
              )}
              title={live ? "Upstream feed" : "Offline fallback"}
            >
              <Radio className="h-3 w-3" />
              {source}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold text-ink-100">
              ${current ? formatPrice(current.usd) : "—"}
            </span>
            <span className={positive ? "badge-green" : "badge-red"}>
              {positive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
          {!compact && series.length ? (
            <div className="mt-1 text-xs text-ink-200">
              Low ${formatPrice(low)} · High ${formatPrice(high)}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-xl bg-ink-900/60 p-1">
            {MARKET_COINS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCoin(c.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-medium tracking-wide",
                  coin === c.id
                    ? "bg-gold-500/20 text-gold-300"
                    : "text-ink-200 hover:text-ink-100",
                )}
              >
                {c.symbol}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl bg-ink-900/60 p-1">
            {WINDOWS.map((w) => (
              <button
                key={w.days}
                type="button"
                onClick={() => setDays(w.days)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-medium tracking-wide",
                  days === w.days
                    ? "bg-gold-500/20 text-gold-300"
                    : "text-ink-200 hover:text-ink-100",
                )}
              >
                {w.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={load}
            disabled={loading}
            aria-label="Refresh market data"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
          {error}
        </div>
      ) : null}

      <div className={compact ? "h-48" : "h-72"}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <defs>
              <linearGradient id={`marketGrad-${coin}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="t"
              stroke="#8a8b93"
              fontSize={11}
              tickFormatter={(v: number) => formatTick(v, days)}
              minTickGap={40}
            />
            <YAxis
              stroke="#8a8b93"
              fontSize={11}
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => `$${formatPrice(v)}`}
              width={70}
            />
            <RTooltip
              contentStyle={{
                background: "#101013",
                border: "1px solid rgba(212,175,55,0.35)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelFormatter={(label: number) =>
                new Date(label).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              formatter={(value: number) => [`$${formatPrice(value)}`, "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#d4af37"
              strokeWidth={2}
              fill={`url(#marketGrad-${coin})`}
            />
            {referenceAmount ? (
              <ReferenceLine
                y={referenceAmount.priceUsd}
                stroke="#818cf8"
                strokeDasharray="4 4"
                label={{
                  value: referenceAmount.label,
                  fill: "#c7d2fe",
                  fontSize: 11,
                  position: "insideTopRight",
                }}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!compact ? (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-200">
          <Activity className="h-3.5 w-3.5 text-gold-400" />
          Auto-refreshes every 5 minutes · Cached upstream (CoinGecko) with offline fallback.
        </div>
      ) : null}
    </div>
  );
}

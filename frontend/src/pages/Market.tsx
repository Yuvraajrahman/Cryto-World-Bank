import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MarketDataChart, MARKET_COINS } from "@/components/market/MarketDataChart";
import { Globe2, LineChart as LineChartIcon, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

interface PricesResponse {
  source: "live" | "cache" | "offline";
  prices: Record<
    string,
    { usd: number; usd_24h_change?: number; usd_24h_vol?: number; usd_market_cap?: number }
  >;
}

interface SummaryResponse {
  source: "live" | "cache" | "offline";
  activeCoins: number;
  markets: number;
  totalMarketCapUsd: number;
  totalVolume24hUsd: number;
  btcDominance: number;
  ethDominance: number;
  change24hPct: number;
}

function formatCompact(n?: number) {
  if (n == null) return "—";
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function formatPrice(n?: number) {
  if (n == null) return "—";
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function Market() {
  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const ids = MARKET_COINS.map((c) => c.id).join(",");
      const [p, s] = await Promise.all([
        api.get<PricesResponse>(`/api/market/prices?ids=${ids}`),
        api.get<SummaryResponse>("/api/market/summary"),
      ]);
      setPrices(p);
      setSummary(s);
      setUpdatedAt(new Date());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 60_000);
    return () => clearInterval(i);
  }, []);

  const summaryPositive = (summary?.change24hPct ?? 0) >= 0;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Markets"
        title="Live Prices & Charts"
        description="Proxied through the platform API (CoinGecko, 60s cache) with a deterministic offline fallback so the demo stays readable even when upstream rate-limits."
        right={
          <>
            <span className="text-xs text-ink-200">
              {updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : "Loading…"}
            </span>
            <button className="btn-ghost" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </>
        }
      />

      {summary ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
              <Globe2 className="h-3.5 w-3.5" /> Global cap
            </div>
            <div className="mt-1 font-display text-xl font-semibold text-ink-100">
              {formatCompact(summary.totalMarketCapUsd)}
            </div>
            <div
              className={`mt-1 inline-flex items-center gap-1 text-xs ${
                summaryPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {summaryPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {summary.change24hPct.toFixed(2)}% 24h
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">24h volume</div>
            <div className="mt-1 font-display text-xl font-semibold text-ink-100">
              {formatCompact(summary.totalVolume24hUsd)}
            </div>
            <div className="mt-1 text-xs text-ink-200">{summary.markets.toLocaleString()} markets</div>
          </div>
          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">BTC dominance</div>
            <div className="mt-1 font-display text-xl font-semibold text-ink-100">
              {summary.btcDominance.toFixed(1)}%
            </div>
            <div className="mt-1 text-xs text-ink-200">
              ETH: {summary.ethDominance.toFixed(1)}%
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Active coins</div>
            <div className="mt-1 font-display text-xl font-semibold text-ink-100">
              {summary.activeCoins.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-ink-200">tracked across exchanges</div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {MARKET_COINS.map((meta) => {
          const row = prices?.prices[meta.id];
          const change = row?.usd_24h_change ?? 0;
          const positive = change >= 0;
          return (
            <div key={meta.id} className="card-hover card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.22em] text-ink-200">
                  {meta.symbol}
                </span>
                <span className={positive ? "badge-green" : "badge-red"}>
                  {positive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </span>
              </div>
              <div className="mt-1 font-display text-2xl font-semibold text-ink-100">
                ${formatPrice(row?.usd)}
              </div>
              <div className="text-xs text-ink-200">{meta.name}</div>
              <div className="mt-3 text-[11px] text-ink-200">
                Vol {formatCompact(row?.usd_24h_vol)} · Cap {formatCompact(row?.usd_market_cap)}
              </div>
            </div>
          );
        })}
      </div>

      <MarketDataChart initialCoin="ethereum" initialDays={30} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MarketDataChart initialCoin="bitcoin" initialDays={30} compact />
        <MarketDataChart initialCoin="matic-network" initialDays={30} compact />
      </div>

      <div className="card p-5 text-xs text-ink-200">
        <div className="flex items-center gap-2 text-gold-400">
          <LineChartIcon className="h-4 w-4" />
          <span className="uppercase tracking-[0.22em]">How this connects to your loans</span>
        </div>
        <p className="mt-2 max-w-3xl">
          Loans are denominated in ETH; USD conversions shown across the platform use the
          proxied CoinGecko feed above. When viewing an individual loan, the reserve asset's
          price is highlighted on the chart so you can see its value trajectory versus the
          principal you borrowed or lent.
        </p>
      </div>
    </div>
  );
}

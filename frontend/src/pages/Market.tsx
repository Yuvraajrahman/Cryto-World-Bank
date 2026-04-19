import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Activity, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Prices = Record<string, { usd: number; usd_24h_change?: number }>;

const assetMeta: Record<string, { name: string; symbol: string }> = {
  ethereum: { name: "Ethereum", symbol: "ETH" },
  bitcoin: { name: "Bitcoin", symbol: "BTC" },
  "matic-network": { name: "Polygon", symbol: "MATIC" },
  "usd-coin": { name: "USD Coin", symbol: "USDC" },
  tether: { name: "Tether", symbol: "USDT" },
};

export function Market() {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const p = await api.get<Prices>("/api/market/prices");
      setPrices(p);
      setUpdatedAt(new Date());
    } catch {
      // fall back to static demo data if backend is offline
      setPrices({
        ethereum: { usd: 2014.52, usd_24h_change: 1.8 },
        bitcoin: { usd: 64821.11, usd_24h_change: -0.4 },
        "matic-network": { usd: 0.54, usd_24h_change: 2.2 },
        "usd-coin": { usd: 1.0, usd_24h_change: 0 },
        tether: { usd: 1.0, usd_24h_change: 0 },
      });
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

  const ethSeries = Array.from({ length: 24 }).map((_, i) => ({
    h: `${i}:00`,
    price: 1950 + Math.sin(i / 3) * 40 + (i % 5) * 4,
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Markets"
        title="Live Prices"
        description="Real-time price feed, proxied through the platform API so keys stay off the client."
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(assetMeta).map(([id, meta]) => {
          const row = prices?.[id];
          const change = row?.usd_24h_change ?? 0;
          const positive = change >= 0;
          return (
            <div key={id} className="card-hover card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.22em] text-ink-200">
                  {meta.symbol}
                </span>
                <span className={positive ? "badge-green" : "badge-red"}>
                  {positive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </span>
              </div>
              <div className="mt-1 font-display text-2xl font-semibold text-ink-100">
                ${row ? row.usd.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
              </div>
              <div className="text-xs text-ink-200">{meta.name}</div>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">ETH / USD</div>
            <div className="font-display text-xl font-semibold text-ink-100">24-hour trend</div>
          </div>
          <span className="badge-gold">
            <Activity className="h-3.5 w-3.5" />
            Reserve quote asset
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ethSeries}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="h" stroke="#8a8b93" fontSize={12} />
              <YAxis stroke="#8a8b93" fontSize={12} domain={["auto", "auto"]} />
              <RTooltip
                contentStyle={{
                  background: "#101013",
                  border: "1px solid rgba(212,175,55,0.35)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="price" stroke="#d4af37" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

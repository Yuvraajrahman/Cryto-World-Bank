import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MarketDataChart, MARKET_COINS } from "@/components/market/MarketDataChart";
import { Globe2, LineChart as LineChartIcon, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
function formatCompact(n) {
    if (n == null)
        return "—";
    if (n >= 1000000000000)
        return `$${(n / 1000000000000).toFixed(2)}T`;
    if (n >= 1000000000)
        return `$${(n / 1000000000).toFixed(2)}B`;
    if (n >= 1000000)
        return `$${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000)
        return `$${(n / 1000).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
}
function formatPrice(n) {
    if (n == null)
        return "—";
    if (n >= 1000)
        return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (n >= 1)
        return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}
export function Market() {
    const [prices, setPrices] = useState(null);
    const [summary, setSummary] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loading, setLoading] = useState(false);
    async function load() {
        setLoading(true);
        try {
            const ids = MARKET_COINS.map((c) => c.id).join(",");
            const [p, s] = await Promise.all([
                api.get(`/api/market/prices?ids=${ids}`),
                api.get("/api/market/summary"),
            ]);
            setPrices(p);
            setSummary(s);
            setUpdatedAt(new Date());
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
        const i = setInterval(load, 60000);
        return () => clearInterval(i);
    }, []);
    const summaryPositive = (summary?.change24hPct ?? 0) >= 0;
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Markets", title: "Live Prices & Charts", description: "Proxied through the platform API (CoinGecko, 60s cache) with a deterministic offline fallback so the demo stays readable even when upstream rate-limits.", right: _jsxs(_Fragment, { children: [_jsx("span", { className: "text-xs text-ink-200", children: updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : "Loading…" }), _jsxs("button", { className: "btn-ghost", onClick: load, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] }) }), summary ? (_jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [_jsxs("div", { className: "card p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Globe2, { className: "h-3.5 w-3.5" }), " Global cap"] }), _jsx("div", { className: "mt-1 font-display text-xl font-semibold text-ink-100", children: formatCompact(summary.totalMarketCapUsd) }), _jsxs("div", { className: `mt-1 inline-flex items-center gap-1 text-xs ${summaryPositive ? "text-emerald-400" : "text-red-400"}`, children: [summaryPositive ? (_jsx(TrendingUp, { className: "h-3.5 w-3.5" })) : (_jsx(TrendingDown, { className: "h-3.5 w-3.5" })), summary.change24hPct.toFixed(2), "% 24h"] })] }), _jsxs("div", { className: "card p-4", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "24h volume" }), _jsx("div", { className: "mt-1 font-display text-xl font-semibold text-ink-100", children: formatCompact(summary.totalVolume24hUsd) }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: [summary.markets.toLocaleString(), " markets"] })] }), _jsxs("div", { className: "card p-4", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "BTC dominance" }), _jsxs("div", { className: "mt-1 font-display text-xl font-semibold text-ink-100", children: [summary.btcDominance.toFixed(1), "%"] }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: ["ETH: ", summary.ethDominance.toFixed(1), "%"] })] }), _jsxs("div", { className: "card p-4", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Active coins" }), _jsx("div", { className: "mt-1 font-display text-xl font-semibold text-ink-100", children: summary.activeCoins.toLocaleString() }), _jsx("div", { className: "mt-1 text-xs text-ink-200", children: "tracked across exchanges" })] })] })) : null, _jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5", children: MARKET_COINS.map((meta) => {
                    const row = prices?.prices[meta.id];
                    const change = row?.usd_24h_change ?? 0;
                    const positive = change >= 0;
                    return (_jsxs("div", { className: "card-hover card p-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: meta.symbol }), _jsxs("span", { className: positive ? "badge-green" : "badge-red", children: [positive ? "▲" : "▼", " ", Math.abs(change).toFixed(2), "%"] })] }), _jsxs("div", { className: "mt-1 font-display text-2xl font-semibold text-ink-100", children: ["$", formatPrice(row?.usd)] }), _jsx("div", { className: "text-xs text-ink-200", children: meta.name }), _jsxs("div", { className: "mt-3 text-[11px] text-ink-200", children: ["Vol ", formatCompact(row?.usd_24h_vol), " \u00B7 Cap ", formatCompact(row?.usd_market_cap)] })] }, meta.id));
                }) }), _jsx(MarketDataChart, { initialCoin: "ethereum", initialDays: 30 }), _jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2", children: [_jsx(MarketDataChart, { initialCoin: "bitcoin", initialDays: 30, compact: true }), _jsx(MarketDataChart, { initialCoin: "matic-network", initialDays: 30, compact: true })] }), _jsxs("div", { className: "card p-5 text-xs text-ink-200", children: [_jsxs("div", { className: "flex items-center gap-2 text-gold-400", children: [_jsx(LineChartIcon, { className: "h-4 w-4" }), _jsx("span", { className: "uppercase tracking-[0.22em]", children: "How this connects to your loans" })] }), _jsx("p", { className: "mt-2 max-w-3xl", children: "Loans are denominated in ETH; USD conversions shown across the platform use the proxied CoinGecko feed above. When viewing an individual loan, the reserve asset's price is highlighted on the chart so you can see its value trajectory versus the principal you borrowed or lent." })] })] }));
}

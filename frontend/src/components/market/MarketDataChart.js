import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, } from "recharts";
import { Activity, Radio, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
export const MARKET_COINS = [
    { id: "ethereum", symbol: "ETH", name: "Ethereum" },
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    { id: "matic-network", symbol: "MATIC", name: "Polygon" },
    { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
    { id: "tether", symbol: "USDT", name: "Tether" },
];
const WINDOWS = [
    { days: 1, label: "24H" },
    { days: 7, label: "7D" },
    { days: 30, label: "30D" },
    { days: 90, label: "90D" },
    { days: 365, label: "1Y" },
];
function formatPrice(n) {
    if (n >= 1000)
        return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (n >= 1)
        return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}
function formatTick(ts, days) {
    const d = new Date(ts);
    if (days <= 1)
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (days <= 90)
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    return d.toLocaleDateString([], { month: "short", year: "2-digit" });
}
export function MarketDataChart({ initialCoin = "ethereum", initialDays = 30, referenceAmount, className, compact = false, }) {
    const [coin, setCoin] = useState(initialCoin);
    const [days, setDays] = useState(initialDays);
    const [history, setHistory] = useState(null);
    const [prices, setPrices] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const load = useMemo(() => async () => {
        setLoading(true);
        setError(null);
        try {
            const [h, p] = await Promise.all([
                api.get(`/api/market/history?id=${coin}&days=${days}`),
                api.get(`/api/market/prices?ids=${coin}`),
            ]);
            setHistory(h);
            setPrices(p);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load market data");
        }
        finally {
            setLoading(false);
        }
    }, [coin, days]);
    useEffect(() => {
        load();
        const t = setInterval(load, 5 * 60000);
        return () => clearInterval(t);
    }, [load]);
    const series = useMemo(() => (history?.series ?? []).map(([t, p]) => ({
        t,
        price: p,
    })), [history]);
    const current = prices?.prices[coin];
    const change = current?.usd_24h_change ?? 0;
    const positive = change >= 0;
    const source = history?.source ?? prices?.source ?? "offline";
    const live = source === "live" || source === "cache";
    const low = series.length ? Math.min(...series.map((s) => s.price)) : 0;
    const high = series.length ? Math.max(...series.map((s) => s.price)) : 0;
    return (_jsxs("div", { className: cn("card p-6", className), children: [_jsxs("div", { className: "mb-4 flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: [MARKET_COINS.find((c) => c.id === coin)?.symbol ?? coin.toUpperCase(), " / USD"] }), _jsxs("span", { className: cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider", live
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-amber-500/10 text-amber-300"), title: live ? "Upstream feed" : "Offline fallback", children: [_jsx(Radio, { className: "h-3 w-3" }), source] })] }), _jsxs("div", { className: "mt-1 flex items-baseline gap-3", children: [_jsxs("span", { className: "font-display text-2xl font-semibold text-ink-100", children: ["$", current ? formatPrice(current.usd) : "—"] }), _jsxs("span", { className: positive ? "badge-green" : "badge-red", children: [positive ? "▲" : "▼", " ", Math.abs(change).toFixed(2), "%"] })] }), !compact && series.length ? (_jsxs("div", { className: "mt-1 text-xs text-ink-200", children: ["Low $", formatPrice(low), " \u00B7 High $", formatPrice(high)] })) : null] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("div", { className: "flex gap-1 rounded-xl bg-ink-900/60 p-1", children: MARKET_COINS.map((c) => (_jsx("button", { type: "button", onClick: () => setCoin(c.id), className: cn("rounded-lg px-2.5 py-1 text-[11px] font-medium tracking-wide", coin === c.id
                                        ? "bg-gold-500/20 text-gold-300"
                                        : "text-ink-200 hover:text-ink-100"), children: c.symbol }, c.id))) }), _jsx("div", { className: "flex gap-1 rounded-xl bg-ink-900/60 p-1", children: WINDOWS.map((w) => (_jsx("button", { type: "button", onClick: () => setDays(w.days), className: cn("rounded-lg px-2.5 py-1 text-[11px] font-medium tracking-wide", days === w.days
                                        ? "bg-gold-500/20 text-gold-300"
                                        : "text-ink-200 hover:text-ink-100"), children: w.label }, w.days))) }), _jsx("button", { type: "button", className: "btn-ghost", onClick: load, disabled: loading, "aria-label": "Refresh market data", children: _jsx(RefreshCw, { className: cn("h-4 w-4", loading && "animate-spin") }) })] })] }), error ? (_jsx("div", { className: "rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300", children: error })) : null, _jsx("div", { className: compact ? "h-48" : "h-72", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: series, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: `marketGrad-${coin}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#d4af37", stopOpacity: 0.35 }), _jsx("stop", { offset: "100%", stopColor: "#d4af37", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { stroke: "rgba(255,255,255,0.05)" }), _jsx(XAxis, { dataKey: "t", stroke: "#8a8b93", fontSize: 11, tickFormatter: (v) => formatTick(v, days), minTickGap: 40 }), _jsx(YAxis, { stroke: "#8a8b93", fontSize: 11, domain: ["auto", "auto"], tickFormatter: (v) => `$${formatPrice(v)}`, width: 70 }), _jsx(RTooltip, { contentStyle: {
                                    background: "#101013",
                                    border: "1px solid rgba(212,175,55,0.35)",
                                    borderRadius: 12,
                                    fontSize: 12,
                                }, labelFormatter: (label) => new Date(label).toLocaleString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }), formatter: (value) => [`$${formatPrice(value)}`, "Price"] }), _jsx(Area, { type: "monotone", dataKey: "price", stroke: "#d4af37", strokeWidth: 2, fill: `url(#marketGrad-${coin})` }), referenceAmount ? (_jsx(ReferenceLine, { y: referenceAmount.priceUsd, stroke: "#818cf8", strokeDasharray: "4 4", label: {
                                    value: referenceAmount.label,
                                    fill: "#c7d2fe",
                                    fontSize: 11,
                                    position: "insideTopRight",
                                } })) : null] }) }) }), !compact ? (_jsxs("div", { className: "mt-3 flex items-center gap-2 text-[11px] text-ink-200", children: [_jsx(Activity, { className: "h-3.5 w-3.5 text-gold-400" }), "Auto-refreshes every 5 minutes \u00B7 Cached upstream (CoinGecko) with offline fallback."] })) : null] }));
}

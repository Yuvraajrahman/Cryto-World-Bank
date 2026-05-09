import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Landmark, Building2, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
export function Simulation() {
    const [bundle, setBundle] = useState(null);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const r = await fetch("/data/world_simulation.json");
                if (!r.ok)
                    throw new Error(`HTTP ${r.status}`);
                const j = (await r.json());
                if (!cancelled) {
                    setBundle(j);
                    setSelectedId(j.countries[0]?.id ?? null);
                }
            }
            catch (e) {
                if (!cancelled)
                    setErr(e instanceof Error ? e.message : "Load failed");
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);
    const selected = useMemo(() => bundle?.countries.find((c) => c.id === selectedId) ?? null, [bundle, selectedId]);
    const filtered = useMemo(() => {
        if (!bundle)
            return [];
        const s = q.trim().toLowerCase();
        if (!s)
            return bundle.countries;
        return bundle.countries.filter((c) => c.name.toLowerCase().includes(s) ||
            c.id.toLowerCase().includes(s) ||
            c.iso3.toLowerCase().includes(s));
    }, [bundle, q]);
    if (loading) {
        return (_jsxs("div", { className: "flex min-h-[40vh] items-center justify-center gap-2 text-ink-200", children: [_jsx(Loader2, { className: "h-5 w-5 animate-spin" }), "Loading simulation graph\u2026"] }));
    }
    if (err || !bundle) {
        return (_jsxs("div", { className: "rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-sm text-red-200", children: ["Could not load ", _jsx("code", { className: "text-red-100", children: "/data/world_simulation.json" }), err ? ` — ${err}` : "", ". Run", " ", _jsx("code", { className: "text-red-100", children: "python3 scripts/build_world_simulation.py" }), " from the repo root."] }));
    }
    const wb = bundle.world_bank;
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Simulation", title: "Global hierarchy", description: "One world reserve, one national bank per country, at least ten local banks, and at least one branch in each modelled city." }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]", children: [_jsxs("div", { className: "space-y-4 rounded-2xl border border-ink-600/50 bg-ink-950/40 p-4", children: [_jsx("div", { className: "text-[10px] font-medium uppercase tracking-[0.24em] text-ink-200", children: "Country picker" }), _jsx("input", { type: "search", value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search name or ISO code\u2026", className: "w-full rounded-xl border border-ink-600/60 bg-ink-900/80 px-3 py-2 text-sm text-ink-50 outline-none ring-gold-600/30 placeholder:text-ink-400 focus:ring-2" }), _jsx("div", { className: "max-h-[min(70vh,520px)] space-y-1 overflow-y-auto pr-1", children: filtered.map((c) => (_jsxs("button", { type: "button", onClick: () => setSelectedId(c.id), className: c.id === selectedId
                                        ? "flex w-full items-center gap-2 rounded-xl border border-gold-700/50 bg-gold-900/20 px-3 py-2 text-left text-sm text-gold-100"
                                        : "flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-left text-sm text-ink-100 hover:border-ink-500/50 hover:bg-ink-800/50", children: [_jsx("span", { className: "font-mono text-[10px] text-ink-300", children: c.id }), _jsx("span", { className: "flex-1 truncate", children: c.name }), _jsx(ChevronRight, { className: "h-4 w-4 shrink-0 opacity-50" })] }, c.id))) }), _jsxs("p", { className: "text-xs leading-relaxed text-ink-300", children: [bundle.stats.markdown_countries, " jurisdictions \u00B7", " ", bundle.stats.local_banks_total.toLocaleString(), " local banks \u00B7", " ", bundle.stats.branches_total.toLocaleString(), " branches (modelled)"] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-2xl border border-gold-800/40 bg-gradient-to-br from-gold-950/30 to-ink-950/60 p-6", children: [_jsxs("div", { className: "flex flex-wrap items-start gap-4", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl border border-gold-700/40 bg-gold-900/20", children: _jsx(Landmark, { className: "h-6 w-6 text-gold-300" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "text-[10px] font-medium uppercase tracking-[0.24em] text-gold-300/90", children: "Universal tier" }), _jsx("h2", { className: "mt-1 text-lg font-semibold text-ink-50", children: wb.name }), _jsxs("p", { className: "mt-1 text-sm text-ink-200", children: [wb.headquarters, wb.connects_to ? ` · Linked to ${String(wb.connects_to).replace(/_/g, " ")}` : ""] })] })] }), selected ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "my-5 flex justify-center text-gold-500/80", children: _jsx("div", { className: "h-8 w-px bg-gradient-to-b from-gold-600/60 to-transparent" }) }), _jsxs("div", { className: "rounded-xl border border-ink-600/50 bg-ink-900/50 p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-ink-200", children: [_jsx(Building2, { className: "h-3.5 w-3.5" }), "National bank"] }), _jsx("div", { className: "mt-2 text-base font-medium text-ink-50", children: selected.national_bank.name }), _jsxs("div", { className: "mt-1 font-mono text-[11px] text-ink-400", children: [selected.national_bank.id, " \u00B7 Capital ", selected.capital, " \u00B7 ", selected.currency] }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2 text-[10px] text-ink-400", children: [selected.data_provenance.from_research_json ? (_jsx("span", { className: "rounded-md border border-emerald-800/50 bg-emerald-950/40 px-2 py-0.5 text-emerald-200/90", children: "Research JSON" })) : (_jsx("span", { className: "rounded-md border border-ink-600/50 bg-ink-950/60 px-2 py-0.5", children: "Generated names" })), selected.data_provenance.rest_countries ? (_jsx("span", { className: "rounded-md border border-sky-800/50 bg-sky-950/40 px-2 py-0.5 text-sky-200/90", children: "REST Countries" })) : null] })] }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { className: "text-[10px] font-medium uppercase tracking-[0.24em] text-ink-200", children: ["Local banks & branches (", selected.local_banks.length, ")"] }), _jsx("div", { className: "max-h-[min(50vh,420px)] space-y-2 overflow-y-auto pr-1", children: selected.local_banks.map((lb) => (_jsxs("div", { className: "rounded-xl border border-ink-600/40 bg-ink-950/40 p-3", children: [_jsxs("div", { className: "flex flex-wrap items-baseline gap-2", children: [_jsx("span", { className: "text-sm font-medium text-ink-100", children: lb.name }), lb.synthetic ? (_jsx("span", { className: "text-[9px] uppercase tracking-wider text-amber-300/80", children: "simulated" })) : null, _jsx("span", { className: "font-mono text-[10px] text-ink-500", children: lb.id })] }), _jsx("ul", { className: "mt-2 space-y-1 text-xs text-ink-300", children: lb.branches.map((b) => (_jsxs("li", { className: "flex gap-2", children: [_jsx(MapPin, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500/70" }), _jsxs("span", { children: [_jsx("span", { className: "text-ink-200", children: b.city }), _jsxs("span", { className: "text-ink-500", children: [" \u2014 ", b.label] })] })] }, b.branch_id))) })] }, lb.id))) })] })] })) : (_jsx("p", { className: "mt-4 text-sm text-ink-400", children: "Select a country to view its subtree." }))] }), bundle.build_notes ? (_jsx("p", { className: "text-xs leading-relaxed text-ink-400", children: bundle.build_notes })) : null] })] })] }));
}

import { useEffect, useMemo, useState } from "react";
import { Landmark, Building2, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface Branch {
  branch_id: string;
  city: string;
  label: string;
}

interface LocalBank {
  id: string;
  name: string;
  synthetic?: boolean;
  parent_national_bank_id: string;
  branches: Branch[];
}

interface NationalBank {
  id: string;
  name: string;
  parent_world_bank_id: string;
}

interface CountrySim {
  id: string;
  iso3: string;
  name: string;
  capital: string;
  currency: string;
  national_bank: NationalBank;
  major_cities: string[];
  local_banks: LocalBank[];
  data_provenance: { from_research_json: boolean; rest_countries: boolean };
}

interface SimulationBundle {
  world_bank: {
    id: string;
    name: string;
    role?: string;
    headquarters?: string;
    connects_to?: string;
  };
  countries: CountrySim[];
  stats: Record<string, number | string>;
  build_notes?: string;
}

export function Simulation() {
  const [bundle, setBundle] = useState<SimulationBundle | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/data/world_simulation.json");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as SimulationBundle;
        if (!cancelled) {
          setBundle(j);
          setSelectedId(j.countries[0]?.id ?? null);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => bundle?.countries.find((c) => c.id === selectedId) ?? null,
    [bundle, selectedId],
  );

  const filtered = useMemo(() => {
    if (!bundle) return [];
    const s = q.trim().toLowerCase();
    if (!s) return bundle.countries;
    return bundle.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.id.toLowerCase().includes(s) ||
        c.iso3.toLowerCase().includes(s),
    );
  }, [bundle, q]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-ink-200">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading simulation graph…
      </div>
    );
  }

  if (err || !bundle) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-sm text-red-200">
        Could not load <code className="text-red-100">/data/world_simulation.json</code>
        {err ? ` — ${err}` : ""}. Run{" "}
        <code className="text-red-100">python3 scripts/build_world_simulation.py</code> from the
        repo root.
      </div>
    );
  }

  const wb = bundle.world_bank;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Simulation"
        title="Global hierarchy"
        description="One world reserve, one national bank per country, at least ten local banks, and at least one branch in each modelled city."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-4 rounded-2xl border border-ink-600/50 bg-ink-950/40 p-4">
          <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-ink-200">
            Country picker
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or ISO code…"
            className="w-full rounded-xl border border-ink-600/60 bg-ink-900/80 px-3 py-2 text-sm text-ink-50 outline-none ring-gold-600/30 placeholder:text-ink-400 focus:ring-2"
          />
          <div className="max-h-[min(70vh,520px)] space-y-1 overflow-y-auto pr-1">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={
                  c.id === selectedId
                    ? "flex w-full items-center gap-2 rounded-xl border border-gold-700/50 bg-gold-900/20 px-3 py-2 text-left text-sm text-gold-100"
                    : "flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-left text-sm text-ink-100 hover:border-ink-500/50 hover:bg-ink-800/50"
                }
              >
                <span className="font-mono text-[10px] text-ink-300">{c.id}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
              </button>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-ink-300">
            {bundle.stats.markdown_countries as number} jurisdictions ·{" "}
            {(bundle.stats.local_banks_total as number).toLocaleString()} local banks ·{" "}
            {(bundle.stats.branches_total as number).toLocaleString()} branches (modelled)
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gold-800/40 bg-gradient-to-br from-gold-950/30 to-ink-950/60 p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-700/40 bg-gold-900/20">
                <Landmark className="h-6 w-6 text-gold-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold-300/90">
                  Universal tier
                </div>
                <h2 className="mt-1 text-lg font-semibold text-ink-50">{wb.name}</h2>
                <p className="mt-1 text-sm text-ink-200">
                  {wb.headquarters}
                  {wb.connects_to ? ` · Linked to ${String(wb.connects_to).replace(/_/g, " ")}` : ""}
                </p>
              </div>
            </div>
            {selected ? (
              <>
                <div className="my-5 flex justify-center text-gold-500/80">
                  <div className="h-8 w-px bg-gradient-to-b from-gold-600/60 to-transparent" />
                </div>
                <div className="rounded-xl border border-ink-600/50 bg-ink-900/50 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-ink-200">
                    <Building2 className="h-3.5 w-3.5" />
                    National bank
                  </div>
                  <div className="mt-2 text-base font-medium text-ink-50">
                    {selected.national_bank.name}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-ink-400">
                    {selected.national_bank.id} · Capital {selected.capital} · {selected.currency}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-ink-400">
                    {selected.data_provenance.from_research_json ? (
                      <span className="rounded-md border border-emerald-800/50 bg-emerald-950/40 px-2 py-0.5 text-emerald-200/90">
                        Research JSON
                      </span>
                    ) : (
                      <span className="rounded-md border border-ink-600/50 bg-ink-950/60 px-2 py-0.5">
                        Generated names
                      </span>
                    )}
                    {selected.data_provenance.rest_countries ? (
                      <span className="rounded-md border border-sky-800/50 bg-sky-950/40 px-2 py-0.5 text-sky-200/90">
                        REST Countries
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-ink-200">
                    Local banks & branches ({selected.local_banks.length})
                  </div>
                  <div className="max-h-[min(50vh,420px)] space-y-2 overflow-y-auto pr-1">
                    {selected.local_banks.map((lb) => (
                      <div
                        key={lb.id}
                        className="rounded-xl border border-ink-600/40 bg-ink-950/40 p-3"
                      >
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm font-medium text-ink-100">{lb.name}</span>
                          {lb.synthetic ? (
                            <span className="text-[9px] uppercase tracking-wider text-amber-300/80">
                              simulated
                            </span>
                          ) : null}
                          <span className="font-mono text-[10px] text-ink-500">{lb.id}</span>
                        </div>
                        <ul className="mt-2 space-y-1 text-xs text-ink-300">
                          {lb.branches.map((b) => (
                            <li key={b.branch_id} className="flex gap-2">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500/70" />
                              <span>
                                <span className="text-ink-200">{b.city}</span>
                                <span className="text-ink-500"> — {b.label}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-ink-400">Select a country to view its subtree.</p>
            )}
          </div>

          {bundle.build_notes ? (
            <p className="text-xs leading-relaxed text-ink-400">{bundle.build_notes}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicShell from "../components/layout/PublicShell";
import Glass from "../components/ui/Glass";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import StateMessage from "../components/ui/StateMessage";
import Icon from "../components/ui/Icon";
import { useReserveTransparency } from "../hooks/useReserveTransparency";
import { useScrollReveal } from "../hooks/useScrollReveal";

const RANGES = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
];

function formatSynced(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function RatioChart({ points }) {
  const w = 640;
  const h = 180;
  const pad = 16;
  const ratios = points.map((p) => p.ratio);
  const min = Math.min(...ratios) * 0.96;
  const max = Math.max(...ratios) * 1.02;
  const coords = points.map((p, i) => {
    const x = pad + (i / Math.max(points.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((p.ratio - min) / (max - min || 1)) * (h - pad * 2);
    return { x, y, ...p };
  });
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x},${h - pad} L${coords[0].x},${h - pad} Z`;

  return (
    <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Reserve ratio trend">
      <defs>
        <linearGradient id="ratioFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ratioFill)" />
      <path d={line} fill="none" stroke="var(--signal-bright)" strokeWidth="2.5" strokeLinecap="round" />
      {coords.map((c) => (
        <circle key={c.t} cx={c.x} cy={c.y} r="3.5" fill="var(--gold-bright)" />
      ))}
    </svg>
  );
}

/**
 * Route: `/reserve` — plan A.3 Reserve Transparency Dashboard (Public)
 */
export default function ReservePublicPage() {
  const { status, data, stale, source, reload } = useReserveTransparency();
  const [range, setRange] = useState("30d");
  const [path, setPath] = useState([{ id: "world", name: "World" }]);
  const head = useScrollReveal();

  const node = useMemo(() => {
    if (!data) return null;
    let cur = data.world;
    for (let i = 1; i < path.length; i++) {
      const next = (cur.children || []).find((c) => c.id === path[i].id);
      if (!next) break;
      cur = next;
    }
    return cur;
  }, [data, path]);

  const children = node?.children || [];
  const history = data?.history?.[range] || [];

  function drillTo(child) {
    setPath((p) => [...p, { id: child.id, name: child.name }]);
  }

  function jumpTo(index) {
    setPath((p) => p.slice(0, index + 1));
  }

  function exportSnapshot() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wbr-reserve-${data.syncedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PublicShell>
      <header className="page-hero">
        <p className="eyebrow center">Proof of reserve</p>
        <h1>
          Nothing about the reserve is <em>hidden</em>.
        </h1>
        <p className="section-lede center">
          Public solvency view — aggregate capital, ratios, and Chainlink attestation. No wallet
          required.
        </p>
        {data ? (
          <div className="sync-bar">
            <span className={`sync-meta${stale ? " warn" : ""}`}>
              Last synced {formatSynced(data.syncedAt)}
              {stale ? " · may be stale" : ""}
              {source === "cache" ? " · offline cache" : " · live API"}
            </span>
            <Button variant="ghost" size="sm" showArrow={false} type="button" onClick={() => void reload()}>
              Refresh
            </Button>
            <Button variant="ghost" size="sm" showArrow={false} type="button" onClick={exportSnapshot}>
              Export snapshot
            </Button>
          </div>
        ) : null}
      </header>

      <section className="section" style={{ paddingTop: 24 }}>
        {status === "loading" && (
          <div className="stats-row snap-row" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <Glass key={i} className="stat-skeleton" />
            ))}
          </div>
        )}

        {status === "error" && (
          <StateMessage
            variant="error"
            title="Reserve data unavailable"
            description="Try again shortly. The rest of the site still works."
          />
        )}

        {status === "success" && data && (
          <>
            <div ref={head.ref} className={`stats-row ${head.className}`} style={head.style}>
              <StatCard label="Total reserve" value={data.summary.totalReserve.display} />
              <StatCard
                label={`Reserve ratio (min ${data.summary.reserveRatio.minimumDisplay})`}
                value={data.summary.reserveRatio.display}
                delay={60}
              />
              <StatCard label="Insurance fund" value={data.summary.insuranceFund.display} delay={120} />
            </div>

            <div className="stats-row" style={{ marginTop: 16 }}>
              <StatCard label="Loans outstanding" value={data.summary.loansOutstanding.display} />
              <StatCard label="Total repaid" value={data.summary.totalRepaid.display} delay={60} />
              <StatCard label="Default rate" value={data.summary.defaultRate.display} delay={120} />
            </div>

            <div className="badges" id="proof" style={{ marginTop: 28 }}>
              <Badge icon="check">
                {data.proofOfReserve.provider} · {data.proofOfReserve.status}
              </Badge>
              <Badge icon="node">{data.network.name}</Badge>
              {data.audits.map((a) => (
                <Badge key={a.name}>{a.name} Audited</Badge>
              ))}
            </div>
          </>
        )}
      </section>

      {status === "success" && data && (
        <section className="section" style={{ paddingTop: 40 }} id="drilldown">
          <div className="section-head">
            <p className="eyebrow center">Tier drill-down</p>
            <h2 className="section-title center">
              World → National → <em>Local</em>
            </h2>
          </div>

          <nav className="breadcrumb" aria-label="Tier breadcrumb">
            {path.map((crumb, i) => (
              <span key={crumb.id} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                {i > 0 ? <span className="sep">/</span> : null}
                {i === path.length - 1 ? (
                  <span className="current">{crumb.name}</span>
                ) : (
                  <button type="button" onClick={() => jumpTo(i)}>
                    {crumb.name}
                  </button>
                )}
              </span>
            ))}
          </nav>

          <Glass className="chart-card" style={{ marginTop: 0, marginBottom: 16 }}>
            <div className="tier-row-main">
              <span className="tier-row-name">{node?.name}</span>
              <span className="tier-row-meta">
                Capital {node?.capital?.display} · Ratio {node?.reserveRatio?.display}
              </span>
            </div>
          </Glass>

          {children.length > 0 ? (
            <div className="tier-list">
              {children.map((child) => (
                <Glass
                  key={child.id}
                  as="button"
                  type="button"
                  interactive
                  className="tier-row"
                  onClick={() => (child.children ? drillTo(child) : drillTo(child))}
                >
                  <div className="tier-row-main">
                    <span className="tier-row-name">{child.name}</span>
                    <span className="tier-row-meta">{child.children ? "National" : "Local branch"}</span>
                  </div>
                  <div className="tier-row-stats">
                    <span>
                      Capital <strong>{child.capital.display}</strong>
                    </span>
                    <span>
                      Ratio <strong>{child.reserveRatio.display}</strong>
                    </span>
                    {typeof child.loans === "number" ? (
                      <span>
                        Loans <strong>{child.loans}</strong>
                      </span>
                    ) : (
                      <Icon name="chevronRight" size={16} />
                    )}
                  </div>
                </Glass>
              ))}
            </div>
          ) : (
            <StateMessage
              title="End of drill-down"
              description="This local branch has no further public breakdown."
            />
          )}
        </section>
      )}

      {status === "success" && data && (
        <section className="section" style={{ paddingTop: 40 }} id="history">
          <div className="section-head">
            <p className="eyebrow center">History</p>
            <h2 className="section-title center">
              Reserve ratio over <em>time</em>
            </h2>
          </div>
          <div className="range-pills" role="tablist" aria-label="Time range">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={range === r.id}
                className={`range-pill${range === r.id ? " active" : ""}`}
                onClick={() => setRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Glass className="chart-card">
            <RatioChart points={history} />
          </Glass>
        </section>
      )}

      {status === "success" && data && (
        <section className="section" id="contracts">
          <div className="section-head">
            <p className="eyebrow center">Contracts</p>
            <h2 className="section-title center">
              Verified addresses on <em>{data.network.name}</em>
            </h2>
          </div>
          <div className="tier-list" style={{ maxWidth: 640, margin: "40px auto 0" }}>
            {data.contracts.map((c) => (
              <Glass key={c.name} className="tier-row" style={{ cursor: "default" }}>
                <div className="tier-row-main">
                  <span className="tier-row-name">{c.name}</span>
                  <span className="tier-row-meta">{c.address}</span>
                </div>
                <a href={c.explorer} className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
                  Explorer <Icon name="external" size={14} />
                </a>
              </Glass>
            ))}
          </div>
          <div className="hero-cta" style={{ margin: "40px auto 0", justifyContent: "center" }}>
            <Button as={Link} to="/login" variant="primary">
              Connect Wallet
            </Button>
            <Button as={Link} to="/about" variant="ghost" showArrow={false}>
              Learn how it works
            </Button>
          </div>
        </section>
      )}
    </PublicShell>
  );
}

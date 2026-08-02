import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StateMessage from "../../components/ui/StateMessage";
import { api } from "@/lib/api";

/**
 * Route: `/app/passport` — Credit Passport (SBT), plan G.26
 * Design: single hero-style glass identity card (like `.final-cta-card`).
 */
export default function PassportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const p = await api.get("/api/passport/me");
        if (!cancelled) {
          setData(p);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="client-page">
        <StateMessage variant="empty" title="Loading passport…" description="Reading SBT / projection." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Passport unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  const score = data.score ?? 320;
  const scaleMax = data.scaleMax ?? 1000;
  const tier = data.tier || "Bronze";
  const isNew = (data.repayment?.onTime ?? 0) === 0 && (data.repayment?.active ?? 0) === 0;
  const series = data.series || [];
  const maxSeries = Math.max(scaleMax, ...series.map((s) => s.score), 1);

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Identity</p>
        <h1 className="client-title">Credit Passport</h1>
        <p className="client-lede">
          Soulbound credit identity that gates uncollateralized borrowing and rate modifiers.
        </p>
      </header>

      <Glass className="client-panel passport-hero final-cta-card" level={3}>
        <Badge icon="passport">{tier}</Badge>
        <h2 className="client-panel-title passport-score">
          {score}
          <span className="muted"> / {scaleMax}</span>
        </h2>
        <p className="client-lede">
          {isNew
            ? "New passport — you’re at Bronze. Repay on time to climb tiers and unlock larger credit loans."
            : data.available
              ? `Live passport (${data.source}). Tier ${tier} · credit path ${data.qualifiesForCredit ? "open" : "needs Silver+"}`
              : `Demo score until the on-chain SBT syncs. Tier ${tier}.`}
        </p>
        <div className="quick-actions">
          <Button as={Link} to="/app/loans/apply/credit">
            Apply with credit
          </Button>
          <Button as={Link} to="/app/loans/history" variant="ghost" showArrow={false}>
            Loan history
          </Button>
        </div>
      </Glass>

      <section className="client-section">
        <h2 className="client-section-title">Tier table</h2>
        <ul className="tier-stack">
          {(data.tiers || []).map((row) => (
            <li
              key={row.tier}
              className={`tier-row glass${row.tier.toLowerCase() === String(tier).toLowerCase() ? " current" : ""}`}
            >
              <div>
                <strong>{row.tier}</strong>
                <span>
                  Score {row.min}–{row.max}
                </span>
              </div>
              <div className="tier-meta">
                <span>Max {row.maxLoan}</span>
                <code>{row.modifier}</code>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="client-section">
        <h2 className="client-section-title">Score history</h2>
        <Glass className="client-panel">
          <div className="score-chart" role="img" aria-label="Score over events">
            {series.map((p, i) => (
              <div key={i} className="score-bar-col">
                <div
                  className="score-bar"
                  style={{ height: `${Math.max(8, (p.score / maxSeries) * 100)}%` }}
                  title={`${p.label}: ${p.score}`}
                />
                <span>{p.score}</span>
              </div>
            ))}
          </div>
        </Glass>
        <ul className="activity-list" style={{ marginTop: 12 }}>
          {(data.events || []).map((h, i) => (
            <li key={i} className="activity-row glass">
              <div>
                <strong>{h.label}</strong>
                <span>{h.at}</span>
              </div>
              <code>
                {h.delta > 0 ? "+" : ""}
                {h.delta}
              </code>
            </li>
          ))}
        </ul>
      </section>

      <div className="client-grid-2">
        <Glass className="client-panel">
          <p className="eyebrow">Repayment summary</p>
          <ul className="terms-list">
            <li>
              <span>On-time (repaid)</span>
              <strong>{data.repayment?.onTime ?? 0}</strong>
            </li>
            <li>
              <span>Late signals</span>
              <strong>{data.repayment?.late ?? 0}</strong>
            </li>
            <li>
              <span>Defaults</span>
              <strong>{data.repayment?.defaults ?? 0}</strong>
            </li>
            <li>
              <span>Active loans</span>
              <strong>{data.repayment?.active ?? 0}</strong>
            </li>
          </ul>
        </Glass>
        <Glass className="client-panel">
          <p className="eyebrow">How scoring works</p>
          <p className="client-lede" style={{ margin: "0 0 8px" }}>
            Raises score:
          </p>
          <ul className="plain-list">
            {(data.explainer?.raises || []).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="client-lede" style={{ margin: "12px 0 8px" }}>
            Lowers score:
          </p>
          <ul className="plain-list">
            {(data.explainer?.lowers || []).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Glass>
      </div>

      {(data.groupHistory || []).length > 0 ? (
        <section className="client-section">
          <h2 className="client-section-title">Group credit history</h2>
          <ul className="activity-list">
            {data.groupHistory.map((g, i) => (
              <li key={i} className="activity-row glass">
                <div>
                  <strong>{g.groupName}</strong>
                  <span>{g.role}</span>
                </div>
                <Badge>{g.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import StateMessage from "../../../components/ui/StateMessage";
import { api } from "@/lib/api";

function formatEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${Number(n).toFixed(3)} ETH`;
}

function riskTone(band) {
  if (band === "low") return "ops-risk-low";
  if (band === "high") return "ops-risk-high";
  return "ops-risk-mid";
}

/**
 * Route: `/bank/local/approvals` — plan I.30
 */
export default function ApprovalsQueuePage() {
  const [sort, setSort] = useState("oldest");
  const [type, setType] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const q = new URLSearchParams({ sort, type });
      const d = await api.get(`/api/local-bank/approvals?${q}`);
      setData(d);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [sort, type]);

  const loans = data?.loans || [];
  const ready = loans.filter((l) => l.riskReady || l.amount < 1);
  const awaiting = loans.filter((l) => !l.riskReady && l.amount >= 1);

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Approvals</p>
        <h1 className="client-title">Loan approval queue</h1>
        <p className="client-lede">
          Prioritized applications awaiting a human decision. Items still waiting on ML scoring stay
          visually separate.
        </p>
      </header>

      <div className="ops-toolbar">
        <label className="ops-filter">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="oldest">Oldest first</option>
            <option value="risk">Highest risk</option>
            <option value="amount">Largest amount</option>
          </select>
        </label>
        <label className="ops-filter">
          <span>Filter</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All pending</option>
            <option value="ready">Ready to decide</option>
            <option value="awaiting_ml">Awaiting ML</option>
            <option value="collateral">Collateral</option>
            <option value="credit">Credit</option>
          </select>
        </label>
      </div>

      {loading && !data ? (
        <StateMessage title="Loading queue…" description="Pulling pending applications." />
      ) : null}

      {error && !data ? (
        <StateMessage
          title="Queue unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      ) : null}

      {!loading && loans.length === 0 && !error ? (
        <StateMessage
          variant="empty"
          title="Queue clear"
          description="No pending loan applications for this branch."
        />
      ) : null}

      {ready.length > 0 ? (
        <section className="client-section">
          <div className="client-section-head">
            <h2 className="client-section-title">Ready to review</h2>
            <Badge icon="check">{ready.length}</Badge>
          </div>
          <ul className="ops-stack">
            {ready.map((loan) => (
              <li key={loan.id}>
                <Link to={`/bank/local/approvals/${loan.id}`} className="ops-row glass">
                  <div>
                    <strong>{loan.borrower?.displayName || "Applicant"}</strong>
                    <span>
                      {String(loan.loanType || "loan")} · {loan.hoursInQueue ?? 0}h in queue
                    </span>
                  </div>
                  <div className="ops-row-meta">
                    <span className={`ops-risk-pill ${riskTone(loan.riskBand)}`}>
                      {(loan.compositeRisk * 100).toFixed(0)} · {loan.riskBand}
                    </span>
                    <code>{formatEth(loan.amount)}</code>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {awaiting.length > 0 ? (
        <section className="client-section">
          <div className="client-section-head">
            <h2 className="client-section-title">Awaiting ML score</h2>
            <Badge icon="clock">{awaiting.length}</Badge>
          </div>
          <ul className="ops-stack">
            {awaiting.map((loan) => (
              <li key={loan.id}>
                <Link to={`/bank/local/approvals/${loan.id}`} className="ops-row glass ops-row-muted">
                  <div>
                    <strong>{loan.borrower?.displayName || "Applicant"}</strong>
                    <span>Commit–reveal / scoring in progress</span>
                  </div>
                  <div className="ops-row-meta">
                    <Badge icon="clock">Pending score</Badge>
                    <code>{formatEth(loan.amount)}</code>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

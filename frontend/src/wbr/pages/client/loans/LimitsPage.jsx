import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import StateMessage from "../../../components/ui/StateMessage";
import { useBorrowingLimits } from "../../../hooks/useLoans";
import { formatEth } from "../../../lib/loanSchedule";

function LimitBar({ label, used, limit, remaining }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <Glass className="client-panel">
      <p className="eyebrow">{label}</p>
      <h2 className="client-panel-title">
        {formatEth(used)} <span className="muted">/ {formatEth(limit)}</span>
      </h2>
      <p className="client-lede">{pct}% used · {formatEth(remaining)} remaining</p>
      <div className="limit-bar" aria-hidden>
        <div className="limit-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </Glass>
  );
}

/**
 * Route: `/app/loans/limits` — plan D.18
 */
export default function LimitsPage() {
  const { limits, loading, error, refresh } = useBorrowingLimits();

  if (loading && !limits) {
    return (
      <div className="client-page">
        <StateMessage variant="empty" title="Loading limits…" description="Computing rolling caps." />
      </div>
    );
  }

  if (error || !limits) {
    return (
      <div className="client-page">
        <StateMessage
          title="Limits unavailable"
          description={error?.message || "Borrower session required."}
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      </div>
    );
  }

  const maxed =
    limits.sixMonth.remaining <= 1e-9 || limits.oneYear.remaining <= 1e-9;
  const contrib6 = limits.contributingLoans?.sixMonth || [];
  const nextFree =
    contrib6
      .map((l) => new Date(l.approvedAt).getTime() + 182 * 86400000)
      .sort((a, b) => a - b)[0] || null;

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Borrowing limits</p>
        <h1 className="client-title">How much you can still borrow</h1>
        <p className="client-lede">
          Caps are enforced off-chain for the demo API and mirrored on-chain when contracts are
          live. Rolling windows free capacity as older loans age out of the lookback.
        </p>
      </header>

      <div className="client-grid-2">
        <LimitBar
          label="Six-month rolling"
          used={limits.sixMonth.borrowed}
          limit={limits.sixMonth.limit}
          remaining={limits.sixMonth.remaining}
        />
        <LimitBar
          label="One-year rolling"
          used={limits.oneYear.borrowed}
          limit={limits.oneYear.limit}
          remaining={limits.oneYear.remaining}
        />
      </div>

      <Glass className="client-panel">
        <p className="eyebrow">Active loan slots</p>
        <h2 className="client-panel-title">
          {limits.activeLoanCount} <span className="muted">/ {limits.maxActiveLoans}</span>
        </h2>
        <p className="client-lede">
          Base cap {formatEth(limits.baseCap)}
          {limits.exceptionApplied
            ? " · consecutive paid-loan multiplier applied"
            : " · repay 3 loans on time to unlock a second active slot"}
          . Credit Passport tier also affects uncollateralized max — see{" "}
          <Link to="/app/passport" className="text-link">
            your passport
          </Link>
          .
        </p>
      </Glass>

      {maxed ? (
        <div className="notice warn">
          You are at the limit.
          {nextFree
            ? ` Six-month capacity begins freeing around ${new Date(nextFree).toLocaleDateString()}.`
            : " Repay or wait for the rolling window to advance."}
        </div>
      ) : (
        <div className="quick-actions">
          <Button as={Link} to="/app/loans/apply">
            Apply for a loan
          </Button>
          <Button as={Link} to="/app/passport" variant="ghost" showArrow={false}>
            Credit Passport
          </Button>
        </div>
      )}

      <section className="client-section">
        <h2 className="client-section-title">Loans counting toward 6-month window</h2>
        {contrib6.length === 0 ? (
          <Glass className="client-panel">
            <p className="client-lede" style={{ margin: 0 }}>
              No approved loans in the current six-month window.
            </p>
          </Glass>
        ) : (
          <ul className="activity-list">
            {contrib6.map((l) => (
              <li key={l.id}>
                <Link to={`/app/loans/${l.id}`} className="activity-row glass">
                  <div>
                    <strong>
                      {formatEth(l.amount)} · {l.loanType || "—"}
                    </strong>
                    <span>
                      Approved {new Date(l.approvedAt).toLocaleDateString()} · {l.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

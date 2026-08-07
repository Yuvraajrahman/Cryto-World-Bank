import { Link, useParams } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import StateMessage from "../../../components/ui/StateMessage";
import ExplorerLink from "../../../components/ui/ExplorerLink";
import { useLoan } from "../../../hooks/useLoans";
import {
  formatEth,
  LIFECYCLE_STEPS,
  loanLifecycleLabel,
} from "../../../lib/loanSchedule";

/**
 * Route: `/app/loans/:loanId` — plan D.15
 */
export default function LoanDetailPage({ loanId: loanIdProp } = {}) {
  const params = useParams();
  const loanId = loanIdProp || params.loanId;
  const { data, loan, loading, error, refresh } = useLoan(loanId);

  if (loading && !loan) {
    return (
      <div className="client-page">
        <StateMessage variant="empty" title="Loading loan…" description={loanId} />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="client-page">
        <StateMessage
          title="Loan not found"
          description={error?.message || "Check the link and try again."}
          action={{ label: "History", onClick: () => (window.location.href = "/app/loans/history") }}
        />
      </div>
    );
  }

  const nextUnpaid = (loan.installments || []).find((i) => !i.paid);
  const stepIdx = Math.max(
    0,
    LIFECYCLE_STEPS.indexOf(loan.status === "REJECTED" || loan.status === "DEFAULTED" ? "PENDING" : loan.status),
  );
  const health =
    loan.loanType === "collateral" && loan.collateralEth
      ? loan.collateralEth / Math.max(loan.amount, 1e-9)
      : null;

  const txs = data?.transactions || [];

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Loan detail</p>
        <h1 className="client-title">{formatEth(loan.amount)}</h1>
        <p className="client-lede">
          {loan.purpose} · {loan.loanType || "credit"} · {loanLifecycleLabel(loan.status)}
        </p>
        <div className="client-hero-badges">
          <Badge>{loan.status}</Badge>
          {loan.loanType ? <Badge icon="loan">{loan.loanType}</Badge> : null}
        </div>
        <div className="quick-actions">
          {nextUnpaid && (loan.status === "ACTIVE" || loan.status === "APPROVED") ? (
            <Button as={Link} to={`/app/loans/${loan.id}/pay`}>
              Pay installment
            </Button>
          ) : null}
          <Button as={Link} to="/app/loans/history" variant="ghost" showArrow={false}>
            History
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => void refresh()}>
            Refresh
          </Button>
        </div>
      </header>

      <Glass className="client-panel">
        <p className="eyebrow">Lifecycle</p>
        <ol className="loan-lifecycle">
          {LIFECYCLE_STEPS.map((s, i) => (
            <li
              key={s}
              className={
                loan.status === "REJECTED" && s === "PENDING"
                  ? "error"
                  : i < stepIdx
                    ? "done"
                    : i === stepIdx
                      ? "active"
                      : ""
              }
            >
              {loanLifecycleLabel(s)}
            </li>
          ))}
        </ol>
        {loan.status === "PENDING" ? (
          <p className="client-lede">
            Pending score / approver review. Commit-reveal risk scoring may take a short wait before
            a Local Bank Approver decides.
          </p>
        ) : null}
        {loan.status === "REJECTED" ? (
          <div className="notice warn">Rejected: {loan.rejectionReason || "No reason given"}</div>
        ) : null}
        {loan.status === "DEFAULTED" ? (
          <div className="notice warn">
            Defaulted — Credit Passport tier may downgrade; collateral (if any) may be liquidated.
          </div>
        ) : null}
      </Glass>

      <div className="client-grid-2">
        <Glass className="client-panel">
          <p className="eyebrow">Terms</p>
          <ul className="terms-list">
            <li>
              <span>Principal</span>
              <strong>{formatEth(loan.amount)}</strong>
            </li>
            <li>
              <span>APR</span>
              <strong>{(loan.aprBps / 100).toFixed(2)}%</strong>
            </li>
            <li>
              <span>Term</span>
              <strong>{loan.termMonths} months</strong>
            </li>
            {loan.collateralEth != null ? (
              <li>
                <span>Collateral</span>
                <strong>{formatEth(loan.collateralEth)}</strong>
              </li>
            ) : null}
            {loan.ltvBps != null ? (
              <li>
                <span>LTV</span>
                <strong>{(loan.ltvBps / 100).toFixed(0)}%</strong>
              </li>
            ) : null}
            {loan.riskScore != null ? (
              <li>
                <span>Risk score</span>
                <strong>{loan.riskScore.toFixed(2)}</strong>
              </li>
            ) : null}
            {loan.txHash ? (
              <li>
                <span>Tx</span>
                <ExplorerLink hash={loan.txHash} label="View on explorer" />
              </li>
            ) : null}
          </ul>
        </Glass>

        {health != null ? (
          <Glass className="client-panel">
            <p className="eyebrow">Health factor</p>
            <h2 className="client-panel-title">{health.toFixed(2)}</h2>
            <p className="client-lede">
              Collateral / principal. Liquidation threshold marked at 1.1 (illustrative).
            </p>
            <div className="ltv-meter">
              <div
                className="ltv-meter-fill danger-mark"
                style={{ width: `${Math.min(100, (health / 2) * 100)}%` }}
              />
            </div>
          </Glass>
        ) : (
          <Glass className="client-panel">
            <p className="eyebrow">Bank</p>
            <h2 className="client-panel-title">{data?.bank?.name || "—"}</h2>
            <p className="client-lede">Lender for this facility.</p>
          </Glass>
        )}
      </div>

      <Glass className="client-panel">
        <p className="eyebrow">Installments</p>
        {(loan.installments || []).length === 0 ? (
          <p className="client-lede">No installment schedule (single repayment or pending).</p>
        ) : (
          <div className="schedule-table-wrap">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.installments.map((i) => (
                  <tr key={i.index} className={i.paid ? "paid" : ""}>
                    <td>{i.index}</td>
                    <td>{new Date(i.dueDate).toLocaleDateString()}</td>
                    <td>{formatEth(i.amount)}</td>
                    <td>{i.paid ? "Paid" : "Due"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Glass>

      <section className="client-section">
        <h2 className="client-section-title">Transactions</h2>
        <ul className="activity-list">
          {txs.length === 0 ? (
            <li className="activity-row glass">
              <span className="client-lede">No linked transactions yet.</span>
            </li>
          ) : (
            txs.map((tx) => (
              <li key={tx.id} className="activity-row glass">
                <div>
                  <strong>{tx.type?.replaceAll("_", " ")}</strong>
                  <span>
                    {new Date(tx.at).toLocaleString()}
                    {tx.txHash ? (
                      <>
                        {" · "}
                        <ExplorerLink hash={tx.txHash} />
                      </>
                    ) : null}
                  </span>
                </div>
                <code>{formatEth(tx.amount)}</code>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

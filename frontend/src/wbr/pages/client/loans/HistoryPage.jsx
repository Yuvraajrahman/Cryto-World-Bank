import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import StatCard from "../../../components/ui/StatCard";
import StateMessage from "../../../components/ui/StateMessage";
import ExplorerLink from "../../../components/ui/ExplorerLink";
import Input from "../../../components/ui/Input";
import { useLoans } from "../../../hooks/useLoans";
import { formatEth, loanLifecycleLabel } from "../../../lib/loanSchedule";
import { api } from "@/lib/api";
import { useEffect } from "react";

/**
 * Route: `/app/loans/history` — plan D.16
 */
export default function HistoryPage() {
  const { loans, loading, error, refresh } = useLoans();
  const [tab, setTab] = useState("loans");
  const [status, setStatus] = useState("all");
  const [loanType, setLoanType] = useState("all");
  const [q, setQ] = useState("");
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    void api
      .get("/api/profile")
      .then((p) => setTxs(p.transactions || []))
      .catch(() => setTxs([]));
  }, [loans]);

  const filtered = useMemo(() => {
    return loans.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (loanType !== "all" && (l.loanType || "credit") !== loanType) return false;
      if (q && !l.id.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [loans, status, loanType, q]);

  const stats = useMemo(() => {
    const borrowed = loans.reduce((a, l) => a + (l.amount || 0), 0);
    const repaid = loans
      .filter((l) => l.status === "REPAID")
      .reduce((a, l) => a + (l.amount || 0), 0);
    const paidInst = loans.flatMap((l) => l.installments || []).filter((i) => i.paid).length;
    const allInst = loans.flatMap((l) => l.installments || []).length;
    const onTime = allInst > 0 ? paidInst / allInst : 1;
    return { borrowed, repaid, onTime };
  }, [loans]);

  function exportCsv() {
    const header = "id,type,status,amount,createdAt\n";
    const rows = filtered
      .map(
        (l) =>
          `${l.id},${l.loanType || ""},${l.status},${l.amount},${l.createdAt}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wbr-loans.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading && !loans.length) {
    return (
      <div className="client-page">
        <StateMessage variant="empty" title="Loading loans…" description="Fetching your history." />
      </div>
    );
  }

  if (error && !loans.length) {
    return (
      <div className="client-page">
        <StateMessage
          title="Couldn’t load loans"
          description={error.message}
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Lending</p>
        <h1 className="client-title">Loan history</h1>
        <p className="client-lede">All applications, active balances, and related transactions.</p>
        <div className="quick-actions">
          <Button as={Link} to="/app/loans/apply">
            Apply for loan
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={exportCsv}>
            Export CSV
          </Button>
          <Button as={Link} to="/app/loans/limits" variant="ghost" showArrow={false}>
            Limits
          </Button>
        </div>
      </header>

      <div className="client-snap-row">
        <StatCard label="Total borrowed" value={formatEth(stats.borrowed)} />
        <StatCard label="Total repaid" value={formatEth(stats.repaid)} />
        <StatCard label="On-time rate" value={`${(stats.onTime * 100).toFixed(0)}%`} />
        <StatCard label="Loans" value={String(loans.length)} />
      </div>

      <div className="notif-filters" role="tablist">
        {[
          { key: "loans", label: "Loans" },
          { key: "txs", label: "Transactions" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            className={`notif-chip${tab === t.key ? " active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "loans" ? (
        <>
          <div className="history-filters">
            <Input
              label="Search ID"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="loan_…"
            />
            <Input
              label="Status"
              as="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All</option>
              {["PENDING", "ACTIVE", "REPAID", "REJECTED", "DEFAULTED"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Input>
            <Input
              label="Type"
              as="select"
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="collateral">Collateral</option>
              <option value="credit">Credit</option>
            </Input>
          </div>

          {filtered.length === 0 ? (
            <StateMessage
              variant="empty"
              title="No loans yet"
              description="Apply for a collateral or credit loan to get started."
              action={{ label: "Apply", onClick: () => (window.location.href = "/app/loans/apply") }}
            />
          ) : (
            <ul className="activity-list">
              {filtered.map((l) => (
                <li key={l.id}>
                  <Link to={`/app/loans/${l.id}`} className="activity-row glass loan-row">
                    <div>
                      <strong>
                        {formatEth(l.amount)} · {l.loanType || "credit"}
                      </strong>
                      <span>
                        {loanLifecycleLabel(l.status)} · {new Date(l.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge>{l.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <ul className="activity-list">
          {txs.length === 0 ? (
            <Glass className="client-panel">
              <p className="client-lede" style={{ margin: 0 }}>
                No transactions yet.
              </p>
            </Glass>
          ) : (
            txs.map((tx) => (
              <li key={tx.id} className="activity-row glass">
                <div>
                  <strong>{tx.type?.replaceAll("_", " ")}</strong>
                  <span>
                    {new Date(tx.at).toLocaleString()}
                    {tx.loanId ? (
                      <>
                        {" "}
                        · <Link to={`/app/loans/${tx.loanId}`}>loan</Link>
                      </>
                    ) : null}
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
      )}
    </div>
  );
}

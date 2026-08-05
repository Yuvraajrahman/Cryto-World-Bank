/**
 * Combined account statement (checking / vault / FD / FX / convert).
 * Route: `/app/account/statement`
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import StatCard from "../../../components/ui/StatCard";
import StateMessage from "../../../components/ui/StateMessage";
import Badge from "../../../components/ui/Badge";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

function fmtEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${Number(n).toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH`;
}

export default function StatementPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const s = await api.get("/api/deposits/statement");
      setData(s);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading && !data) {
    return (
      <div className="client-page">
        <StateMessage title="Loading statement…" description="Combining deposit ledgers." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Could not load statement"
          description={error.message || "Try again."}
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      </div>
    );
  }

  const bal = data.balances || {};

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Statements</p>
        <h1 className="client-title">Account statement</h1>
        <p className="client-lede">
          {data.account?.displayName || "Client"} · {data.account?.loginId || "—"} · generated{" "}
          {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "—"}
        </p>
        <div className="client-hero-badges">
          <Badge icon="wallet">Deposits ledger</Badge>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => void refresh()}>
            Refresh
          </Button>
        </div>
      </header>

      <div className="client-snap-row">
        <StatCard label="Checking" value={formatUsdc(bal.checkingUsdc)} />
        <StatCard label="Savings vault" value={formatUsdc(bal.vaultUsdc)} />
        <StatCard label="ETH" value={fmtEth(bal.eth)} />
        <StatCard label="Fiat USD" value={`$${(bal.fiatUsd ?? 0).toFixed(2)}`} />
      </div>

      <div className="quick-actions" style={{ marginBottom: 20 }}>
        <Button as={Link} to="/app/account/convert" variant="ghost" showArrow={false}>
          USD → USDC
        </Button>
        <Button as={Link} to="/app/account/exchange" variant="ghost" showArrow={false}>
          Exchange
        </Button>
        <Button as={Link} to="/app/account/checking" variant="ghost" showArrow={false}>
          Checking
        </Button>
        <Button as={Link} to="/app/savings" variant="ghost" showArrow={false}>
          Savings
        </Button>
      </div>

      <section className="client-section">
        <h2 className="client-section-title">Entries</h2>
        {(data.entries || []).length === 0 ? (
          <Glass className="client-panel">
            <p className="client-lede" style={{ margin: 0 }}>
              No ledger entries yet. Conversions, transfers, vault moves, and FX will appear here.
            </p>
          </Glass>
        ) : (
          <ul className="activity-list">
            {data.entries.map((e) => (
              <li key={e.id} className="activity-row glass">
                <div>
                  <strong>{String(e.kind || "").replaceAll("_", " ")}</strong>
                  <span>
                    {new Date(e.at).toLocaleString()}
                    {e.note ? ` · ${e.note}` : ""}
                    {e.counterparty ? ` · ${e.counterparty}` : ""}
                  </span>
                </div>
                <code>{formatUsdc(e.amount)}</code>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

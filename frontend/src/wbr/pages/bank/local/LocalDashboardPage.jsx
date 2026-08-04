import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import StatCard from "../../../components/ui/StatCard";
import Icon from "../../../components/ui/Icon";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import ActiveLoansPanel from "../../shared/ActiveLoansPanel";
import { formatUsdc } from "@/lib/formatMoney";

function pct(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${(Number(n) * 100).toFixed(1)}%`;
}

/**
 * Route: `/bank/local/dashboard` — plan I.29
 */
export default function LocalDashboardPage() {
  const user = useSession((s) => s.user);
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capSheet, setCapSheet] = useState(false);
  const [capAmount, setCapAmount] = useState("10");
  const [capReason, setCapReason] = useState("");
  const [capBusy, setCapBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/local-bank/dashboard");
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
  }, []);

  if (loading && !data) {
    return (
      <div className="client-page">
        <StateMessage title="Loading branch…" description="Capital, loan book, and queues." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Dashboard unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      </div>
    );
  }

  const q = data.queues || {};
  const capital = data.capital || {};
  const book = data.loanBook || {};
  const allCaughtUp =
    !(q.approvalsPending || q.kycPending || q.incomePending || q.amlOpen);

  const queues = [
    {
      to: "/bank/local/approvals",
      label: "Loan approvals",
      count: q.approvalsPending ?? 0,
      icon: "loan",
    },
    {
      to: "/bank/local/kyc-review",
      label: "KYC / income",
      count: (q.kycPending ?? 0) + (q.incomePending ?? 0),
      icon: "passport",
    },
    {
      to: "/bank/local/aml-alerts",
      label: "AML alerts",
      count: q.amlOpen ?? 0,
      icon: "alert",
    },
  ];

  const isAdmin =
    user?.role === "LOCAL_BANK_ADMIN" ||
    user?.role === "NATIONAL_BANK_ADMIN" ||
    user?.role === "OWNER";
  const isLbAdmin = user?.role === "LOCAL_BANK_ADMIN";

  async function requestCapital() {
    if (Number(capAmount) <= 0 || capReason.trim().length < 5) return;
    setCapBusy(true);
    try {
      await api.post("/api/local-bank/capital-request", {
        amount: Number(capAmount),
        reason: capReason.trim(),
      });
      toast.show("Capital request sent to National Bank", { variant: "success" });
      setCapSheet(false);
      setCapReason("");
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setCapBusy(false);
    }
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Local Bank</p>
        <h1 className="client-title">
          {data.bank?.name || "Branch"} operations
        </h1>
        <p className="client-lede">
          Capital position, loan book, and work queues for this branch.
        </p>
        <div className="client-hero-badges">
          <Badge>{user?.role?.replaceAll("_", " ")}</Badge>
          {data.bank?.id ? <Badge icon="node">{data.bank.id}</Badge> : null}
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button as={Link} to="/bank/local/request-loan">
            Request loan from National
          </Button>
          <Button as={Link} to="/bank/local/approvals" variant="ghost" showArrow={false}>
            Approvals queue
          </Button>
        </div>
      </header>

      {capital.nearMinimum ? (
        <div className="notice warn">
          Reserve ratio {pct(capital.reserveRatio)} is near the {pct(capital.minReserveRatio)}{" "}
          minimum. New lending capacity is constrained.{" "}
          <Link to="/reserve" className="text-link">
            View reserve transparency
          </Link>
        </div>
      ) : null}

      <div className="client-snap-row">
        <StatCard label="Allocated" value={formatUsdc(capital.allocatedEth)} />
        <StatCard label="Reserve" value={formatUsdc(capital.reserveEth)} />
        <StatCard label="Available" value={formatUsdc(capital.availableEth)} />
        <StatCard label="Reserve ratio" value={pct(capital.reserveRatio)} />
      </div>

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">Work queues</h2>
          {allCaughtUp ? <Badge icon="check">All caught up</Badge> : null}
        </div>
        {allCaughtUp ? (
          <StateMessage
            variant="empty"
            title="All caught up"
            description="No pending approvals, KYC reviews, or open AML alerts."
          />
        ) : (
          <div className="ops-queue-grid">
            {queues.map((item) => (
              <Link key={item.to} to={item.to} className="ops-queue-card glass">
                <Icon name={item.icon} size={22} />
                <strong>{item.label}</strong>
                <span className="ops-queue-count">{item.count}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Glass className="client-panel" level={2}>
        <h2 className="client-panel-title">Loan book snapshot</h2>
        <div className="client-grid-2" style={{ marginTop: 8 }}>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Active loans</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{book.activeCount ?? 0}</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Active value</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{formatUsdc(book.activeValueEth)}</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Delinquency</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{pct(book.delinquencyRate)}</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Active clients</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{data.clients?.activeCount ?? 0}</p>
          </div>
        </div>
        {(book.upcomingMaturities || []).length > 0 ? (
          <ul className="ops-stack" style={{ marginTop: 14 }}>
            {book.upcomingMaturities.map((m) => (
              <li key={m.id} className="ops-row glass">
                <div>
                  <strong>{m.id}</strong>
                  <span>Due {m.deadline ? new Date(m.deadline).toLocaleDateString() : "—"}</span>
                </div>
                <code>{formatUsdc(m.amount)}</code>
              </li>
            ))}
          </ul>
        ) : null}
      </Glass>

      {data.bank?.id ? (
        <ActiveLoansPanel
          bankId={data.bank.id}
          title="Pending & active loans"
          decisionBasePath="/bank/local/approvals"
        />
      ) : null}

      <div className="quick-actions">
        <Button as={Link} to="/bank/local/approvals">
          Open approvals
        </Button>
        {isLbAdmin ? (
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setCapSheet(true)}>
            Request capital
          </Button>
        ) : null}
        {isAdmin ? (
          <Button as={Link} to="/bank/local/users" variant="ghost" showArrow={false}>
            Manage staff
          </Button>
        ) : null}
        {isAdmin ? (
          <Button as={Link} to="/bank/local/lending-settings" variant="ghost" showArrow={false}>
            Lending settings
          </Button>
        ) : null}
        <Button as={Link} to="/reserve" variant="ghost" showArrow={false}>
          Reserve detail
        </Button>
      </div>

      <Sheet open={capSheet} onClose={() => !capBusy && setCapSheet(false)} title="Request capital from National">
        <Input
          label="Amount (USDC)"
          type="number"
          value={capAmount}
          onChange={(e) => setCapAmount(e.target.value)}
        />
        <Input
          label="Reason"
          as="textarea"
          rows={3}
          value={capReason}
          onChange={(e) => setCapReason(e.target.value)}
        />
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void requestCapital()}
            disabled={capBusy || Number(capAmount) <= 0 || capReason.trim().length < 5}
          >
            Submit request
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            onClick={() => setCapSheet(false)}
            disabled={capBusy}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

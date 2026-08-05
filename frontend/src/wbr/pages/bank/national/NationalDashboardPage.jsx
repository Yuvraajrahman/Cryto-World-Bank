import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import StatCard from "../../../components/ui/StatCard";
import Icon from "../../../components/ui/Icon";
import StateMessage from "../../../components/ui/StateMessage";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { formatUsdc } from "@/lib/formatMoney";
import ActiveLoansPanel from "../../shared/ActiveLoansPanel";

function pct(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${(Number(n) * 100).toFixed(1)}%`;
}

/**
 * Route: `/bank/national/dashboard` — plan J.35
 */
export default function NationalDashboardPage() {
  const user = useSession((s) => s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/national-bank/dashboard");
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
        <StateMessage title="Loading jurisdiction…" description="Capital, Local Banks, and queues." />
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
  const j = data.jurisdiction || {};
  const warnings = data.warnings || {};
  const allCaughtUp = !(
    q.capitalRequestsOpen ||
    q.sarOpen ||
    q.localFromNationalPending ||
    q.clientLoansPending ||
    q.approvalsPending
  );

  const queues = [
    {
      to: "/bank/national/approvals",
      label: "Loan approvals",
      count: q.approvalsPending ?? (q.clientLoansPending || 0) + (q.localFromNationalPending || 0),
      icon: "loan",
    },
    {
      to: "/bank/national/capital-allocation",
      label: "Capital requests",
      count: q.capitalRequestsOpen ?? 0,
      icon: "wallet",
    },
    {
      to: "/bank/national/sar-review",
      label: "SAR review",
      count: q.sarOpen ?? 0,
      icon: "alert",
    },
    {
      to: "/bank/national/local-banks",
      label: "Local banks",
      count: j.localBankCount ?? 0,
      icon: "node",
    },
  ];

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">National Bank</p>
        <h1 className="client-title">{data.bank?.name || "Jurisdiction"} operations</h1>
        <p className="client-lede">
          Approve client and Local Bank loans, allocate capital from World Bank, and manage the
          jurisdiction roster.
        </p>
        <div className="client-hero-badges">
          <Badge>{user?.role?.replaceAll("_", " ")}</Badge>
          {data.bank?.jurisdiction ? <Badge icon="node">{data.bank.jurisdiction}</Badge> : null}
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button as={Link} to="/bank/national/approvals">
            Loan approvals
          </Button>
          <Button as={Link} to="/bank/national/request-loan" variant="ghost" showArrow={false}>
            Request loan from World
          </Button>
          <Button as={Link} to="/bank/national/capital-allocation" variant="ghost" showArrow={false}>
            Capital allocation
          </Button>
          <Button as={Link} to="/bank/national/facilities" variant="ghost" showArrow={false}>
            Interbank & upward
          </Button>
        </div>
      </header>

      {warnings.nationalNearMinimum || warnings.childNearMinimum ? (
        <div className="notice warn">
          {warnings.nationalNearMinimum
            ? `National reserve ratio ${pct(capital.reserveRatio)} is near the ${pct(capital.minReserveRatio)} minimum. `
            : null}
          {warnings.childNearMinimum
            ? "One or more Local Banks are near their minimum reserve ratio. "
            : null}
          <Link to="/reserve" className="text-link">
            Reserve transparency
          </Link>
        </div>
      ) : null}

      <div className="client-snap-row">
        <StatCard label="Allocated down" value={formatUsdc(data.bank?.totalAllocated)} />
        <StatCard label="Reserve" value={formatUsdc(capital.reserveEth)} />
        <StatCard label="Available to allocate" value={formatUsdc(capital.availableToAllocateEth)} />
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
            description="No open loan approvals, capital requests, or SARs for this jurisdiction."
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
        <h2 className="client-panel-title">Jurisdiction lending</h2>
        <div className="client-grid-2" style={{ marginTop: 8 }}>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Active loans</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{j.activeLoanCount ?? 0}</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Active value</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{formatUsdc(j.activeLoanValueEth)}</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Default rate</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{pct(j.defaultRate)}</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Local banks</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{j.localBankCount ?? 0}</p>
          </div>
        </div>
      </Glass>

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">Local Bank roster</h2>
          <Link to="/bank/national/local-banks" className="text-link">
            Manage
          </Link>
        </div>
        <ul className="ops-stack">
          {(data.localBanks || []).map((lb) => (
            <li key={lb.id} className="ops-row glass">
              <div>
                <strong>{lb.name}</strong>
                <span>
                  {lb.city || lb.jurisdiction} · ratio {pct(lb.capital?.reserveRatio)} ·{" "}
                  {lb.status || "ACTIVE"}
                </span>
              </div>
              <div className="ops-row-meta">
                <code>{formatUsdc(lb.loanBook?.activeValueEth)} book</code>
                <code>{formatUsdc(lb.reserve)} reserve</code>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {data.bank?.id ? (
        <ActiveLoansPanel
          bankId={data.bank.id}
          title="Pending & active loans (this National)"
          decisionBasePath="/bank/national/approvals"
        />
      ) : null}

      <div className="quick-actions">
        <Button as={Link} to="/bank/national/capital-allocation">
          Allocate capital
        </Button>
        <Button as={Link} to="/bank/national/settings" variant="ghost" showArrow={false}>
          Rate & reserve settings
        </Button>
        <Button as={Link} to="/reserve" variant="ghost" showArrow={false}>
          Reserve detail
        </Button>
      </div>
    </div>
  );
}

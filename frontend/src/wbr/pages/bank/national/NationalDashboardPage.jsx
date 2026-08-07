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
 * Route: `/bank/national`
 * Shared ops skeleton: header → KPI → queues → liquidity/capital → loan book → roster → links
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
      to: "/bank/national?tab=approvals",
      label: "Loan approvals",
      count: q.approvalsPending ?? (q.clientLoansPending || 0) + (q.localFromNationalPending || 0),
      icon: "loan",
      tone: "approvals",
    },
    {
      to: "/bank/national?tab=capital",
      label: "Capital requests",
      count: q.capitalRequestsOpen ?? 0,
      icon: "wallet",
      tone: "capital",
    },
    {
      to: "/bank/national?tab=sar",
      label: "SAR review",
      count: q.sarOpen ?? 0,
      icon: "alert",
      tone: "compliance",
    },
    {
      to: "/bank/national?tab=locals",
      label: "Local banks",
      count: j.localBankCount ?? 0,
      icon: "node",
      tone: "liquidity",
    },
  ];

  return (
    <div className="client-page">
      {/* 1. Header */}
      <header className="client-hero">
        <p className="eyebrow">National Bank</p>
        <h1 className="client-title">{data.bank?.name || "Jurisdiction"} operations</h1>
        <p className="client-lede">
          Approve client and Local Bank loans, allocate capital, and manage liquidity for this
          jurisdiction.
        </p>
        <div className="client-hero-badges">
          <Badge tone="tier">{user?.role?.replaceAll("_", " ")}</Badge>
          {data.bank?.jurisdiction ? <Badge icon="node" tone="info">{data.bank.jurisdiction}</Badge> : null}
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button as={Link} to="/bank/national?tab=approvals">
            Loan approvals
          </Button>
          <Button as={Link} to="/bank/national?tab=request" variant="ghost" showArrow={false}>
            Request from World
          </Button>
          <Button as={Link} to="/bank/national?tab=capital" variant="ghost" showArrow={false}>
            Allocate to Locals
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

      {/* 2. KPI strip */}
      <div className="client-snap-row ops-kpi">
        <StatCard label="Allocated down" value={formatUsdc(data.bank?.totalAllocated)} />
        <StatCard label="Reserve" value={formatUsdc(capital.reserveEth)} />
        <StatCard label="Available to allocate" value={formatUsdc(capital.availableToAllocateEth)} />
        <StatCard label="Reserve ratio" value={pct(capital.reserveRatio)} />
      </div>

      <div className="ops-workspace">
        {/* 3. Work queues */}
        <section className="client-section ops-section tone-approvals">
          <div className="client-section-head">
            <h2 className="client-section-title">Work queues</h2>
            {allCaughtUp ? <Badge icon="check" tone="success">All caught up</Badge> : null}
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
                <Link
                  key={item.to}
                  to={item.to}
                  className={`ops-queue-card glass tone-${item.tone || "approvals"}`}
                >
                  <Icon name={item.icon} size={22} />
                  <strong>{item.label}</strong>
                  <span className="ops-queue-count">{item.count}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 4. Capital / liquidity */}
        <section className="client-section ops-section tone-liquidity">
          <div className="client-section-head">
            <h2 className="client-section-title">Liquidity & capital</h2>
          </div>
          <Glass className="client-panel" level={2}>
            <p className="client-lede" style={{ margin: "0 0 10px" }}>
              Interbank lending pool, upward deposits to World, treasury FX, and capital push to
              Locals.
            </p>
            <div className="quick-actions">
              <Button as={Link} to="/bank/national?tab=facilities" showArrow={false}>
                Facilities
              </Button>
              <Button as={Link} to="/bank/national?tab=treasury" variant="ghost" showArrow={false}>
                Treasury FX
              </Button>
              <Button as={Link} to="/bank/national?tab=capital" variant="ghost" showArrow={false}>
                Capital desk
              </Button>
              <Button as={Link} to="/bank/national?tab=request" variant="ghost" showArrow={false}>
                Request from World
              </Button>
            </div>
          </Glass>
        </section>
      </div>

      {/* 5. Loan book */}
      <Glass className="client-panel" level={2}>
        <h2 className="client-panel-title">Jurisdiction loan book</h2>
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

      {data.bank?.id ? (
        <ActiveLoansPanel
          bankId={data.bank.id}
          title="Pending & active loans (this National)"
          decisionBasePath="/bank/national?tab=approvals"
        />
      ) : null}

      {/* Child roster */}
      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">Local Bank roster</h2>
          <Link to="/bank/national?tab=locals" className="text-link">
            Manage
          </Link>
        </div>
        <ul className="ops-stack ops-list">
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

      {/* 6. Secondary links */}
      <div className="quick-actions">
        <Button as={Link} to="/bank/national?tab=sar" variant="ghost" showArrow={false}>
          SAR review
        </Button>
        <Button as={Link} to="/bank/national?tab=settings" variant="ghost" showArrow={false}>
          Jurisdiction rates
        </Button>
        <Button as={Link} to="/reserve" variant="ghost" showArrow={false}>
          Reserve detail
        </Button>
      </div>
    </div>
  );
}

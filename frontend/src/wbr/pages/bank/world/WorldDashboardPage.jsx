import { useEffect, useMemo, useState } from "react";
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
import { formatUsdc } from "@/lib/formatMoney";
import ActiveLoansPanel from "../../shared/ActiveLoansPanel";

function pct(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${(Number(n) * 100).toFixed(1)}%`;
}

/** `/bank/world` — plan K.39 */
export default function WorldDashboardPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [sars, setSars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("ratio");
  const [allocSheet, setAllocSheet] = useState(false);
  const [allocTo, setAllocTo] = useState("");
  const [allocAmt, setAllocAmt] = useState("10");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [d, sar] = await Promise.all([
        api.get("/api/world-bank/dashboard"),
        api.get("/api/world-bank/sar?status=ESCALATED_WORLD").catch(() => ({ alerts: [] })),
      ]);
      setData(d);
      setSars(sar.alerts || []);
      if (!allocTo && d.nationalBanks?.[0]) setAllocTo(d.nationalBanks[0].id);
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

  const nationals = useMemo(() => {
    const list = [...(data?.nationalBanks || [])];
    if (sort === "size") list.sort((a, b) => (b.totalAllocated || 0) - (a.totalAllocated || 0));
    else list.sort((a, b) => (a.capital?.reserveRatio || 0) - (b.capital?.reserveRatio || 0));
    return list;
  }, [data, sort]);

  const available = data?.capital?.availableToAllocateEth ?? 0;
  const amountNum = Number(allocAmt);
  const validAlloc =
    Number.isFinite(amountNum) && amountNum > 0 && amountNum <= available + 1e-9 && allocTo;

  async function allocate() {
    if (!validAlloc) return;
    setBusy(true);
    try {
      await api.post("/api/world-bank/capital/allocate", {
        toBankId: allocTo,
        amount: amountNum,
      });
      toast.show("Capital allocated to National Bank", { variant: "success" });
      setAllocSheet(false);
      await load();
    } catch (err) {
      toast.show(err.message || "Allocation failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="client-page">
        <StateMessage title="Loading global ops…" description="Reserve, nationals, and governance queues." />
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
  const s = data.system || {};
  const capital = data.capital || {};

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">World Bank</p>
        <h1 className="client-title">{data.bank?.name || "Global reserve"}</h1>
        <p className="client-lede">
          Top-of-hierarchy custody, National Bank roster, and system-wide health.
        </p>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => setAllocSheet(true)}>
            Allocate to National
          </Button>
          <Button as={Link} to="/bank/world?tab=nationals" variant="ghost" showArrow={false}>
            Nationals registry
          </Button>
          <Button as={Link} to="/bank/world?tab=facilities" variant="ghost" showArrow={false}>
            Upward inbox
          </Button>
        </div>
      </header>

      {data.warnings?.cascadeNearMinimum ? (
        <div className="notice warn">
          One or more tiers are near the minimum reserve ratio. Review allocation before new
          disbursements.{" "}
          <Link to="/reserve" className="text-link">
            Reserve transparency
          </Link>
        </div>
      ) : null}

      <div className="client-snap-row">
        <StatCard label="TVL" value={formatUsdc(s.tvlEth)} />
        <StatCard label="Reserve" value={formatUsdc(capital.reserveEth)} />
        <StatCard label="Available to allocate" value={formatUsdc(capital.availableToAllocateEth)} />
        <StatCard label="Reserve ratio" value={pct(capital.reserveRatio)} />
      </div>

      <section className="client-section">
        <h2 className="client-section-title">Pending work</h2>
        <div className="ops-queue-grid">
          <Link to="/bank/world?tab=multisig" className="ops-queue-card glass tone-capital">
            <Icon name="wallet" size={22} />
            <strong>Multisig</strong>
            <span className="ops-queue-count">{q.multisigPending ?? 0}</span>
          </Link>
          <Link to="/bank/world?tab=governance" className="ops-queue-card glass tone-approvals">
            <Icon name="settings" size={22} />
            <strong>Governance</strong>
            <span className="ops-queue-count">{q.governancePending ?? 0}</span>
          </Link>
          <Link to="/bank/world?tab=nationals" className="ops-queue-card glass tone-liquidity">
            <Icon name="node" size={22} />
            <strong>National Banks</strong>
            <span className="ops-queue-count">{s.nationalCount ?? 0}</span>
          </Link>
          <Link to="/bank/world?tab=facilities" className="ops-queue-card glass tone-liquidity">
            <Icon name="node" size={22} />
            <strong>Upward inbox</strong>
            <span className="ops-queue-count">{q.upwardPending ?? "—"}</span>
          </Link>
          <div className="ops-queue-card glass tone-compliance">
            <Icon name="alert" size={22} />
            <strong>World SARs</strong>
            <span className="ops-queue-count">{q.sarWorld ?? sars.length}</span>
          </div>
        </div>
      </section>

      <Glass className="client-panel" level={2}>
        <h2 className="client-panel-title">Liquidity & capital</h2>
        <p className="client-lede" style={{ margin: "0 0 10px" }}>
          Allocate to Nationals, review upward deposits, and run institutional treasury FX.
        </p>
        <div className="quick-actions">
          <Button type="button" onClick={() => setAllocSheet(true)} showArrow={false}>
            Allocate capital
          </Button>
          <Button as={Link} to="/bank/world?tab=facilities" variant="ghost" showArrow={false}>
            Facilities
          </Button>
          <Button as={Link} to="/bank/world?tab=treasury" variant="ghost" showArrow={false}>
            Treasury FX
          </Button>
        </div>
      </Glass>

      <Glass className="client-panel" level={2}>
        <h2 className="client-panel-title">System lending</h2>
        <div className="client-grid-2" style={{ marginTop: 8 }}>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Active loans</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{s.activeLoanCount ?? 0}</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Active value</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{formatUsdc(s.activeLoanValueEth)}</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Default rate</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{pct(s.defaultRate)}</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Local banks</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{s.localCount ?? 0}</p>
          </div>
        </div>
      </Glass>

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">National Bank roster</h2>
          <label className="ops-filter">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="ratio">Reserve ratio</option>
              <option value="size">Allocated size</option>
            </select>
          </label>
        </div>
        <ul className="ops-stack">
          {nationals.map((nb) => (
            <li key={nb.id}>
              <Link to="/bank/world?tab=nationals" className="ops-row glass">
                <div>
                  <strong>{nb.name}</strong>
                  <span>
                    {nb.jurisdiction} · {nb.localBankCount} locals · {nb.status || "ACTIVE"}
                  </span>
                </div>
                <div className="ops-row-meta">
                  <code>{pct(nb.capital?.reserveRatio)}</code>
                  <code>{formatUsdc(nb.totalAllocated)} alloc</code>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">World SAR escalations</h2>
          <Badge icon="alert">{sars.length}</Badge>
        </div>
        {sars.length === 0 ? (
          <StateMessage
            variant="empty"
            title="No World SARs"
            description="Escalations from National SAR review appear here."
          />
        ) : (
          <ul className="ops-stack">
            {sars.map((a) => (
              <li key={a.id} className="ops-row glass">
                <div>
                  <strong>{a.clientName}</strong>
                  <span>
                    {a.localBank?.name || a.bankId} · {a.sarRef || a.id}
                  </span>
                </div>
                <Badge icon="alert">{a.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.bank?.id ? (
        <ActiveLoansPanel bankId={data.bank.id} title="Pending & active loans (World Bank as lender)" />
      ) : null}

      <div className="quick-actions">
        <Button type="button" onClick={() => setAllocSheet(true)}>
          Allocate capital
        </Button>
        <Button as={Link} to="/bank/world?tab=nationals">
          Manage nationals
        </Button>
        <Button as={Link} to="/bank/world?tab=multisig" variant="ghost" showArrow={false}>
          Multisig console
        </Button>
        <Button as={Link} to="/bank/world?tab=governance" variant="ghost" showArrow={false}>
          Governance
        </Button>
      </div>

      <Sheet open={allocSheet} onClose={() => !busy && setAllocSheet(false)} title="Allocate to National Bank">
        <p className="client-lede">
          Available after {pct(capital.minReserveRatio)} floor: {formatUsdc(available)}
        </p>
        <div className="settings-fields" style={{ marginTop: 8 }}>
          <Input
            label="National Bank"
            as="select"
            value={allocTo}
            onChange={(e) => setAllocTo(e.target.value)}
          >
            {(data.nationalBanks || []).map((nb) => (
              <option key={nb.id} value={nb.id} disabled={(nb.status || "ACTIVE") === "PAUSED"}>
                {nb.name}
                {(nb.status || "ACTIVE") === "PAUSED" ? " (paused)" : ""}
              </option>
            ))}
          </Input>
          <Input
            label="Amount (USDC)"
            type="number"
            value={allocAmt}
            onChange={(e) => setAllocAmt(e.target.value)}
            error={
              allocAmt && !validAlloc
                ? `Must be ≤ ${available.toFixed(4)} USDC`
                : undefined
            }
          />
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void allocate()} disabled={busy || !validAlloc}>
            Confirm allocate
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            onClick={() => setAllocSheet(false)}
            disabled={busy}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

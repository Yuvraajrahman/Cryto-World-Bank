/**
 * Reserve & surplus generation — national banks by country.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import Input from "../../components/ui/Input";
import StateMessage from "../../components/ui/StateMessage";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";

function formatUsdc(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ReservesSurplusTab() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const r = await api.get("/api/dev-admin/reserves-surplus");
    setData(r);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        await load();
      } catch (err) {
        toast.show(err?.message || "Failed to load reserves", { variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [load, toast]);

  async function syncThenReload() {
    setBusy(true);
    try {
      await api.post("/api/dev-admin/banks/sync", {});
      await load();
      toast.show("Synced banks from Postgres", { variant: "success" });
    } catch (err) {
      toast.show(err?.message || "Sync failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  const rows = useMemo(() => {
    const list = data?.nationals || [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (r) =>
        r.name?.toLowerCase().includes(needle) ||
        r.jurisdiction?.toLowerCase().includes(needle) ||
        r.countryCode?.toLowerCase().includes(needle) ||
        r.id?.toLowerCase().includes(needle),
    );
  }, [data, q]);

  if (loading && !data) {
    return (
      <StateMessage title="Loading reserves…" description="National banks and surplus from Postgres." />
    );
  }

  const totals = data?.totals || {};

  return (
    <div className="ops-stack" style={{ gap: 20 }}>
      <div className="client-section-head">
        <div>
          <h2 className="client-panel-title">Reserve &amp; surplus generation</h2>
          <p className="client-lede" style={{ margin: 0 }}>
            Each country’s national bank: on-hand reserve, idle surplus above the{" "}
            {((data?.minReserveRatio ?? 0.15) * 100).toFixed(0)}% floor, and upward deposits parked
            from local banks.
          </p>
        </div>
        <div className="quick-actions">
          <Button type="button" variant="ghost" showArrow={false} disabled={busy} onClick={() => void syncThenReload()}>
            Sync from Postgres
          </Button>
          <Button type="button" disabled={busy} onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="client-grid-4">
        <StatCard label="World reserve" value={`${formatUsdc(data?.worldReserveUsdc)} USDC`} />
        <StatCard label="National reserves" value={`${formatUsdc(totals.reserveUsdc)} USDC`} />
        <StatCard label="Idle surplus" value={`${formatUsdc(totals.idleSurplusUsdc)} USDC`} />
        <StatCard label="Surplus generated" value={`${formatUsdc(totals.surplusGeneratedUsdc)} USDC`} />
      </div>

      <Glass className="client-panel" level={2}>
        <div className="client-section-head" style={{ marginBottom: 12 }}>
          <Badge icon="activity">{rows.length} countries / nationals</Badge>
          <Input
            label=""
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter country, bank, code…"
          />
        </div>

        <div className="data-table-wrap reserve-surplus-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Country / bank</th>
                <th>Reserve</th>
                <th>Allocated</th>
                <th>Idle surplus</th>
                <th>Upward received</th>
                <th>Surplus generated</th>
                <th>Locals</th>
                <th>Local reserve</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.jurisdiction || r.name}</strong>
                    <div className="muted-cell">
                      {r.countryCode || "—"} · {r.name}
                    </div>
                  </td>
                  <td>{formatUsdc(r.reserveUsdc)}</td>
                  <td>{formatUsdc(r.allocatedUsdc)}</td>
                  <td className={r.idleSurplusUsdc > 0 ? "surplus-pos" : ""}>
                    {formatUsdc(r.idleSurplusUsdc)}
                  </td>
                  <td>{formatUsdc(r.upwardReceivedUsdc)}</td>
                  <td className="surplus-pos">{formatUsdc(r.surplusGeneratedUsdc)}</td>
                  <td>{r.localCount}</td>
                  <td>{formatUsdc(r.localReserveUsdc)}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>No national banks match.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="client-lede" style={{ marginTop: 12, marginBottom: 0 }}>
          Surplus generated = idle surplus (reserve above minimum floor) + upward deposits received
          from child local banks. Amounts in USDC.
        </p>
      </Glass>
    </div>
  );
}

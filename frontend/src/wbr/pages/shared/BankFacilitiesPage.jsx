/**
 * Interbank lending (IBLP) + upward deposit facility for World / National / Local.
 * Routes: /bank/{local|national|world}/facilities
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import StateMessage from "../../components/ui/StateMessage";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

export default function BankFacilitiesPage({
  title = "Liquidity facilities",
  lede = "Same-tier interbank loans and surplus parked with the parent tier.",
}) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [lenderId, setLenderId] = useState("");
  const [ibAmount, setIbAmount] = useState("25");
  const [tenor, setTenor] = useState("7");
  const [ibNote, setIbNote] = useState("");

  const [upAmount, setUpAmount] = useState("50");
  const [upNote, setUpNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get("/api/facilities/overview");
      setData(d);
      setError(null);
      setLenderId((prev) => prev || d.peers?.[0]?.id || "");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const me = data?.me;
  const canBorrow = me?.tier === "NATIONAL" || me?.tier === "LOCAL";
  const canUpward = Boolean(data?.parent);

  const pendingAsLender = useMemo(
    () =>
      (data?.interbank || []).filter(
        (l) => l.status === "REQUESTED" && l.lenderBankId === me?.id,
      ),
    [data, me],
  );

  async function requestIb(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.post("/api/facilities/interbank/request", {
        lenderBankId: lenderId,
        amountUsdc: Number(ibAmount),
        tenorDays: Number(tenor),
        note: ibNote.trim() || undefined,
      });
      toast.show("Interbank loan requested", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err?.message || err?.error || "Request failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function fundIb(id) {
    if (busy) return;
    setBusy(true);
    try {
      await api.post(`/api/facilities/interbank/${id}/fund`, {});
      toast.show("Interbank loan funded", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err?.message || err?.error || "Fund failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function rejectIb(id) {
    if (busy) return;
    setBusy(true);
    try {
      await api.post(`/api/facilities/interbank/${id}/reject`, {});
      toast.show("Request rejected", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err?.message || err?.error || "Reject failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function repayIb(id) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await api.post(`/api/facilities/interbank/${id}/repay`, {});
      toast.show(
        `Repaid ${formatUsdc(r.totalRepaidUsdc)} (incl. ${formatUsdc(r.interestUsdc)} interest)`,
        { variant: "success" },
      );
      await load();
    } catch (err) {
      toast.show(err?.message || err?.error || "Repay failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function upwardDeposit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.post("/api/facilities/upward/deposit", {
        amountUsdc: Number(upAmount),
        note: upNote.trim() || undefined,
      });
      toast.show("Upward deposit recorded", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err?.message || err?.error || "Deposit failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="client-page">
        <StateMessage title="Loading facilities…" description="Interbank and upward books." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Could not load facilities"
          description={error.message || error.error || "Try again."}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Cross-tier liquidity</p>
        <h1 className="client-title">{title}</h1>
        <p className="client-lede">{lede}</p>
        <div className="client-hero-badges">
          <Badge icon="wallet">{me?.name || "—"}</Badge>
          <Badge>{me?.tier}</Badge>
          <Badge>
            Min reserve {((data?.minReserveRatio ?? 0.15) * 100).toFixed(0)}%
          </Badge>
        </div>
      </header>

      <div className="client-snap-row">
        <StatCard label="Reserve" value={formatUsdc(me?.reserveUsdc)} />
        <StatCard label="Available (above floor)" value={formatUsdc(me?.availableUsdc)} />
        <StatCard
          label="Parent"
          value={data?.parent ? data.parent.name : "Apex (none)"}
        />
        <StatCard label="Same-tier peers" value={String(data?.peers?.length ?? 0)} />
      </div>

      <div className="client-grid-2">
        {canBorrow ? (
          <Glass className="client-panel">
            <p className="eyebrow">Interbank lending pool</p>
            <h2 className="client-panel-title">Request peer liquidity</h2>
            <p className="client-lede" style={{ marginBottom: 16 }}>
              Borrow from a same-tier bank. The lender funds from surplus above the reserve floor.
            </p>
            <form className="stack-form" onSubmit={requestIb}>
              <label className="field">
                <span>Lender peer</span>
                <select
                  className="input"
                  value={lenderId}
                  onChange={(e) => setLenderId(e.target.value)}
                  required
                >
                  {(data?.peers || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · avail {formatUsdc(p.availableUsdc)}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Amount (USDC)"
                type="number"
                min="1"
                step="1"
                value={ibAmount}
                onChange={(e) => setIbAmount(e.target.value)}
                required
              />
              <label className="field">
                <span>Tenor</span>
                <select
                  className="input"
                  value={tenor}
                  onChange={(e) => setTenor(e.target.value)}
                >
                  {(data?.tenors || []).map((t) => (
                    <option key={t.days} value={t.days}>
                      {t.days}d · {(t.aprBps / 100).toFixed(2)}% APR
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Note (optional)"
                value={ibNote}
                onChange={(e) => setIbNote(e.target.value)}
              />
              <Button type="submit" disabled={busy || !(data?.peers || []).length}>
                Request loan
              </Button>
            </form>
          </Glass>
        ) : (
          <Glass className="client-panel">
            <p className="eyebrow">Interbank lending pool</p>
            <h2 className="client-panel-title">World is the reserve</h2>
            <p className="client-lede" style={{ margin: 0 }}>
              Same-tier IBLP is for National↔National and Local↔Local. World receives upward
              deposits and allocates capital downward.
            </p>
          </Glass>
        )}

        {canUpward ? (
          <Glass className="client-panel">
            <p className="eyebrow">Upward deposit facility</p>
            <h2 className="client-panel-title">Park surplus with {data.parent.name}</h2>
            <p className="client-lede" style={{ marginBottom: 16 }}>
              Move idle reserve upward while staying above the minimum reserve ratio.
            </p>
            <form className="stack-form" onSubmit={upwardDeposit}>
              <Input
                label="Amount (USDC)"
                type="number"
                min="1"
                step="1"
                value={upAmount}
                onChange={(e) => setUpAmount(e.target.value)}
                required
              />
              <Input
                label="Note (optional)"
                value={upNote}
                onChange={(e) => setUpNote(e.target.value)}
              />
              <Button type="submit" disabled={busy}>
                Deposit upward
              </Button>
            </form>
          </Glass>
        ) : (
          <Glass className="client-panel">
            <p className="eyebrow">Upward deposit facility</p>
            <h2 className="client-panel-title">Inbound from nationals</h2>
            <p className="client-lede" style={{ margin: 0 }}>
              National banks can park surplus here. Recent inbound deposits appear below.
            </p>
          </Glass>
        )}
      </div>

      {pendingAsLender.length ? (
        <section className="client-section">
          <h2 className="client-section-title">Incoming interbank requests</h2>
          <ul className="activity-list">
            {pendingAsLender.map((l) => (
              <li key={l.id} className="activity-row glass">
                <div>
                  <strong>{l.borrower?.name || l.borrowerBankId}</strong>
                  <span>
                    {formatUsdc(l.amountUsdc)} · {l.tenorDays}d · {(l.aprBps / 100).toFixed(2)}% APR
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    type="button"
                    showArrow={false}
                    disabled={busy}
                    onClick={() => void fundIb(l.id)}
                  >
                    Fund
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    showArrow={false}
                    disabled={busy}
                    onClick={() => void rejectIb(l.id)}
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">Interbank book</h2>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => void load()}>
            Refresh
          </Button>
        </div>
        {(data?.interbank || []).length === 0 ? (
          <Glass className="client-panel">
            <p className="client-lede" style={{ margin: 0 }}>
              No interbank loans yet for this bank.
            </p>
          </Glass>
        ) : (
          <ul className="activity-list">
            {(data?.interbank || []).map((l) => {
              const iAmBorrower = l.borrowerBankId === me?.id;
              return (
                <li key={l.id} className="activity-row glass">
                  <div>
                    <strong>
                      {l.borrower?.name} ← {l.lender?.name}
                    </strong>
                    <span>
                      {formatUsdc(l.amountUsdc)} · {l.status} · {l.tenorDays}d
                      {l.dueAt ? ` · due ${new Date(l.dueAt).toLocaleDateString()}` : ""}
                    </span>
                  </div>
                  {l.status === "ACTIVE" && iAmBorrower ? (
                    <Button
                      type="button"
                      showArrow={false}
                      disabled={busy}
                      onClick={() => void repayIb(l.id)}
                    >
                      Repay
                    </Button>
                  ) : (
                    <Badge>{l.status}</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="client-section">
        <h2 className="client-section-title">Upward deposits</h2>
        {(data?.upward || []).length === 0 ? (
          <Glass className="client-panel">
            <p className="client-lede" style={{ margin: 0 }}>
              No upward deposits recorded yet.
            </p>
          </Glass>
        ) : (
          <ul className="activity-list">
            {(data?.upward || []).map((d) => (
              <li key={d.id} className="activity-row glass">
                <div>
                  <strong>
                    {d.from?.name} → {d.to?.name}
                  </strong>
                  <span>{new Date(d.createdAt).toLocaleString()}</span>
                </div>
                <code>{formatUsdc(d.amountUsdc)}</code>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

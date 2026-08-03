import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

function pct(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${(Number(n) * 100).toFixed(1)}%`;
}

/**
 * Route: `/bank/national/capital-allocation` — plan J.37
 */
export default function CapitalAllocationPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toBankId, setToBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [sheet, setSheet] = useState(null);
  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(false);
  const [denyNote, setDenyNote] = useState("");

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/national-bank/capital");
      setData(d);
      setError(null);
      if (!toBankId && d.localBanks?.[0]) setToBankId(d.localBanks[0].id);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const available = data?.capital?.availableToAllocateEth ?? 0;
  const amountNum = Number(amount);
  const validAmount = Number.isFinite(amountNum) && amountNum > 0 && amountNum <= available + 1e-9;

  const selected = useMemo(
    () => (data?.localBanks || []).find((b) => b.id === toBankId),
    [data, toBankId],
  );

  async function allocate() {
    if (!validAmount || !toBankId) return;
    setBusy(true);
    try {
      await api.post("/api/national-bank/capital/allocate", {
        toBankId,
        amount: amountNum,
      });
      toast.show("Capital allocated", { variant: "success" });
      setAmount("");
      await load();
    } catch (err) {
      toast.show(err.message || "Allocation failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function resolveRequest(decision) {
    if (!request) return;
    setBusy(true);
    try {
      await api.post(`/api/national-bank/capital/requests/${request.id}/resolve`, {
        decision,
        amount: decision === "APPROVED" ? request.amount : undefined,
        note: decision === "DENIED" ? denyNote : undefined,
      });
      toast.show(decision === "APPROVED" ? "Request fulfilled" : "Request denied", {
        variant: "success",
      });
      setSheet(null);
      setRequest(null);
      setDenyNote("");
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="client-page">
        <StateMessage title="Loading capital…" description="Available reserve and Local utilization." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Capital view unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      </div>
    );
  }

  const openRequests = (data.requests || []).filter((r) => r.status === "OPEN");

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Capital</p>
        <h1 className="client-title">Allocation controls</h1>
        <p className="client-lede">
          Push capital to Local Banks while holding the jurisdiction minimum reserve ratio (
          {pct(data.params?.minReserveRatio)}).
        </p>
      </header>

      <Glass className="client-panel" level={3}>
        <Badge icon="wallet">Available to allocate</Badge>
        <h2 className="client-panel-title">{formatUsdc(available)}</h2>
        <p className="client-lede">
          Reserve {formatUsdc(data.capital?.reserveEth)} · ratio {pct(data.capital?.reserveRatio)}
        </p>
      </Glass>

      <Glass className="client-panel" level={2}>
        <h2 className="client-panel-title" style={{ fontSize: "1.2rem" }}>
          Allocate now
        </h2>
        <div className="settings-fields" style={{ marginTop: 8 }}>
          <Input
            label="Local Bank"
            as="select"
            value={toBankId}
            onChange={(e) => setToBankId(e.target.value)}
          >
            {(data.localBanks || []).map((lb) => (
              <option key={lb.id} value={lb.id} disabled={(lb.status || "ACTIVE") === "PAUSED"}>
                {lb.name}
                {(lb.status || "ACTIVE") === "PAUSED" ? " (paused)" : ""}
              </option>
            ))}
          </Input>
          <Input
            label="Amount (USDC)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint={
              selected
                ? `Utilization ${pct(selected.utilization)} · reserve ${formatUsdc(selected.reserve)}`
                : undefined
            }
            error={
              amount && !validAmount
                ? `Must be ≤ ${available.toFixed(4)} USDC (reserve-ratio guard)`
                : undefined
            }
          />
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void allocate()} disabled={busy || !validAmount}>
            {busy ? "Submitting…" : "Submit allocation"}
          </Button>
          <Button as={Link} to="/bank/national/local-banks" variant="ghost" showArrow={false}>
            Manage Local Banks
          </Button>
        </div>
      </Glass>

      <section className="client-section">
        <h2 className="client-section-title">Per-branch utilization</h2>
        <ul className="ops-stack">
          {(data.localBanks || []).map((lb) => (
            <li key={lb.id} className="ops-row glass">
              <div>
                <strong>{lb.name}</strong>
                <span>
                  Lent {formatUsdc(lb.totalLent)} · reserve {formatUsdc(lb.reserve)} ·{" "}
                  {lb.status || "ACTIVE"}
                </span>
              </div>
              <code>{pct(lb.utilization)}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">Pending requests</h2>
          <Badge icon="clock">{openRequests.length}</Badge>
        </div>
        {openRequests.length === 0 ? (
          <StateMessage
            variant="empty"
            title="No open requests"
            description="Local Banks can request top-ups from their ops desk."
          />
        ) : (
          <ul className="ops-stack">
            {openRequests.map((r) => (
              <li key={r.id} className="ops-row glass">
                <div>
                  <strong>{r.fromBankName}</strong>
                  <span>{r.reason}</span>
                </div>
                <div className="ops-row-meta">
                  <code>{formatUsdc(r.amount)}</code>
                  <Button
                    type="button"
                    size="sm"
                    showArrow={false}
                    onClick={() => {
                      setRequest(r);
                      setSheet("approve");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    showArrow={false}
                    onClick={() => {
                      setRequest(r);
                      setSheet("deny");
                    }}
                  >
                    Deny
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Sheet open={sheet === "approve"} onClose={() => !busy && setSheet(null)} title="Fulfill request">
        <p className="client-lede">
          Allocate {formatUsdc(request?.amount)} to {request?.fromBankName}? Checked against the{" "}
          {pct(data.params?.minReserveRatio)} reserve floor.
        </p>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void resolveRequest("APPROVED")} disabled={busy}>
            Confirm allocate
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === "deny"} onClose={() => !busy && setSheet(null)} title="Deny request">
        <Input
          label="Reason"
          as="textarea"
          rows={3}
          value={denyNote}
          onChange={(e) => setDenyNote(e.target.value)}
        />
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void resolveRequest("DENIED")}
            disabled={busy || denyNote.trim().length < 3}
          >
            Confirm deny
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

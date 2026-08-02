import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import Sheet from "../../../components/ui/Sheet";
import StatusStepper from "../../../components/ui/StatusStepper";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";

function formatEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${Number(n).toFixed(4)} ETH`;
}

function daysLeft(maturesAt) {
  const ms = new Date(maturesAt).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

/**
 * Route: `/app/deposits/fixed` — plan F.24 Fixed Deposit
 */
export default function FixedDepositPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [checking, setChecking] = useState(null);
  const [amount, setAmount] = useState("1");
  const [termDays, setTermDays] = useState(90);
  const [busy, setBusy] = useState(false);
  const [txState, setTxState] = useState("idle");
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState("");
  const [sheet, setSheet] = useState(null); // { type: 'open' } | { type: 'early'|'mature', fd }

  const refresh = useCallback(async () => {
    try {
      const [r, s] = await Promise.all([
        api.get("/api/deposits/fixed"),
        api.get("/api/deposits/summary"),
      ]);
      setData(r);
      setChecking(s.checkingEth);
      setError(null);
      if (r.terms?.[0] && !r.terms.some((t) => t.termDays === termDays)) {
        setTermDays(r.terms[0].termDays);
      }
    } catch (err) {
      setError(err);
    }
  }, [termDays]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const amt = Number(amount);
  const selectedTerm = (data?.terms || []).find((t) => t.termDays === termDays);
  const penaltyBps = data?.earlyPenaltyBps ?? 200;

  function openNewSheet(e) {
    e.preventDefault();
    setFieldError("");
    if (!Number.isFinite(amt) || amt <= 0) {
      setFieldError("Enter a positive amount.");
      return;
    }
    if (checking != null && amt > checking + 1e-9) {
      setFieldError(`Insufficient checking (${formatEth(checking)}).`);
      return;
    }
    setTxState("idle");
    setSheet({ type: "open" });
  }

  async function confirmOpen() {
    if (busy) return;
    setBusy(true);
    setTxState("signing");
    try {
      await new Promise((r) => setTimeout(r, 300));
      setTxState("pending");
      await api.post("/api/deposits/fixed/open", {
        amount: amt,
        termDays: Number(termDays),
      });
      setTxState("success");
      toast.show("Fixed deposit opened", { variant: "success" });
      setSheet(null);
      await refresh();
    } catch (err) {
      setTxState("error");
      toast.show(err?.message || "Open failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function confirmWithdraw() {
    if (!sheet || (sheet.type !== "early" && sheet.type !== "mature") || busy) return;
    setBusy(true);
    setTxState("signing");
    try {
      await new Promise((r) => setTimeout(r, 300));
      setTxState("pending");
      const early = sheet.type === "early";
      const r = await api.post(`/api/deposits/fixed/${sheet.fd.id}/withdraw`, { early });
      setTxState("success");
      toast.show(
        early ? `Early withdrawal · payout ${formatEth(r.payout)}` : "Matured payout received",
        { variant: "success" },
      );
      setSheet(null);
      await refresh();
    } catch (err) {
      setTxState("error");
      toast.show(err?.message || "Withdraw failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Fixed deposits unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Deposits</p>
        <h1 className="client-title">Fixed deposit</h1>
        <p className="client-lede">
          Lock funds for a fixed term at a fixed rate. Early withdrawal applies a{" "}
          {(penaltyBps / 100).toFixed(0)}% penalty on principal.
        </p>
        <div className="quick-actions">
          <Button as={Link} to="/app/savings" variant="ghost" showArrow={false}>
            Savings vault
          </Button>
          <Button as={Link} to="/app/account/checking" variant="ghost" showArrow={false}>
            Checking
          </Button>
        </div>
      </header>

      <p className="client-lede">Checking available: {formatEth(checking)}</p>

      <div className="client-grid-2">
        {(data?.terms || []).map((t) => (
          <button
            key={t.termDays}
            type="button"
            className={`term-card glass${termDays === t.termDays ? " active" : ""}`}
            onClick={() => setTermDays(t.termDays)}
            aria-pressed={termDays === t.termDays}
          >
            <strong>{t.termDays} days</strong>
            <span>{(t.aprBps / 100).toFixed(2)}% APR</span>
          </button>
        ))}
      </div>

      <Glass className="client-panel">
        <form className="stack-form" onSubmit={openNewSheet}>
          <Input
            label="Amount (ETH from checking)"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setFieldError("");
            }}
            error={fieldError || undefined}
            hint={
              selectedTerm
                ? `${selectedTerm.termDays}-day term @ ${(selectedTerm.aprBps / 100).toFixed(2)}% APR`
                : undefined
            }
          />
          <Button type="submit" disabled={busy} block>
            Review {termDays}-day deposit
          </Button>
        </form>
      </Glass>

      <section className="client-section">
        <h2 className="client-section-title">Your fixed deposits</h2>
        <ul className="activity-list">
          {(data?.deposits || []).length === 0 ? (
            <li className="activity-row glass">
              <span className="client-lede">No fixed deposits yet.</span>
            </li>
          ) : (
            (data?.deposits || []).map((fd) => {
              const left = daysLeft(fd.maturesAt);
              const matured =
                fd.status === "MATURED" ||
                (fd.status === "ACTIVE" && new Date(fd.maturesAt) <= new Date());
              return (
                <li key={fd.id} className="activity-row glass">
                  <div>
                    <strong>
                      {formatEth(fd.principal)} · {fd.termDays}d
                    </strong>
                    <span>
                      Matures {new Date(fd.maturesAt).toLocaleDateString()}
                      {fd.status === "ACTIVE" && !matured
                        ? ` · ${left} day${left === 1 ? "" : "s"} left`
                        : ""}
                      {" · payout ~"}
                      {formatEth(fd.projectedPayout)}
                    </span>
                  </div>
                  <div className="quick-actions">
                    <Badge>{fd.status}</Badge>
                    {matured && fd.status !== "WITHDRAWN" && fd.status !== "EARLY_WITHDRAWN" ? (
                      <Button
                        type="button"
                        size="sm"
                        showArrow={false}
                        onClick={() => {
                          setTxState("idle");
                          setSheet({ type: "mature", fd });
                        }}
                      >
                        Withdraw
                      </Button>
                    ) : fd.status === "ACTIVE" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        showArrow={false}
                        onClick={() => {
                          setTxState("idle");
                          setSheet({ type: "early", fd });
                        }}
                      >
                        Early withdraw
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <Sheet
        open={sheet?.type === "open"}
        onClose={() => (!busy ? setSheet(null) : null)}
        title="Confirm fixed deposit"
      >
        <p className="client-lede">
          Lock {formatEth(amt)} for {termDays} days
          {selectedTerm ? ` at ${(selectedTerm.aprBps / 100).toFixed(2)}% APR` : ""}. Funds leave
          checking until maturity (or early withdrawal with penalty).
        </p>
        <StatusStepper state={txState} />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void confirmOpen()}>
            {busy ? "Opening…" : "Confirm"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            disabled={busy}
            onClick={() => setSheet(null)}
          >
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={sheet?.type === "early" || sheet?.type === "mature"}
        onClose={() => (!busy ? setSheet(null) : null)}
        title={sheet?.type === "early" ? "Early withdrawal" : "Withdraw matured deposit"}
      >
        {sheet?.type === "early" ? (
          <div className="notice warn" role="alert">
            Early withdrawal deducts a {(penaltyBps / 100).toFixed(0)}% penalty on principal. You
            forfeit accrued term interest. Estimated payout ≈{" "}
            {formatEth(
              Math.max(0, (sheet.fd?.principal ?? 0) * (1 - penaltyBps / 10_000)),
            )}
            .
          </div>
        ) : (
          <p className="client-lede">
            Receive principal plus term interest (~{formatEth(sheet?.fd?.projectedPayout)}) into
            checking.
          </p>
        )}
        <StatusStepper state={txState} />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void confirmWithdraw()}>
            {busy ? "Working…" : sheet?.type === "early" ? "Accept penalty & withdraw" : "Withdraw"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            disabled={busy}
            onClick={() => setSheet(null)}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

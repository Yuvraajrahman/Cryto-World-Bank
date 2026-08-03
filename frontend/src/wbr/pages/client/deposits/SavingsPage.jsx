import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StatusStepper from "../../../components/ui/StatusStepper";
import StateMessage from "../../../components/ui/StateMessage";
import StatCard from "../../../components/ui/StatCard";
import ExplorerLink from "../../../components/ui/ExplorerLink";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

/**
 * Route: `/app/savings` — plan F.23 Savings Vault
 */
export default function SavingsPage() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [amount, setAmount] = useState("0.5");
  const [busy, setBusy] = useState(false);
  const [txState, setTxState] = useState("idle");
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null); // 'deposit' | 'withdraw' | null
  const [fieldError, setFieldError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [s, l] = await Promise.all([
        api.get("/api/deposits/summary"),
        api.get("/api/deposits/ledger?kind=vault"),
      ]);
      setSummary(s);
      setLedger(l.entries || []);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const amt = Number(amount);
  const split = summary?.yieldSplit;

  const canOpenDeposit = useMemo(() => {
    if (!Number.isFinite(amt) || amt <= 0) return false;
    if (summary && amt > summary.checkingEth + 1e-9) return false;
    return true;
  }, [amt, summary]);

  const canOpenWithdraw = useMemo(() => {
    if (!Number.isFinite(amt) || amt <= 0) return false;
    if (summary && amt > (summary.vaultEth ?? 0) + 1e-9) return false;
    return true;
  }, [amt, summary]);

  function openConfirm(action) {
    setFieldError("");
    if (!Number.isFinite(amt) || amt <= 0) {
      setFieldError("Enter a positive amount.");
      return;
    }
    if (action === "deposit" && summary && amt > summary.checkingEth + 1e-9) {
      setFieldError(`Insufficient checking balance (${formatUsdc(summary.checkingEth)}).`);
      return;
    }
    if (action === "withdraw") {
      if (summary && !summary.reserveRatioOk) {
        setFieldError(
          summary.withdrawalBlockedReason ||
            "Withdrawals are paused while the system reserve ratio is below the minimum.",
        );
        return;
      }
      if (summary && amt > (summary.vaultEth ?? 0) + 1e-9) {
        setFieldError(`Insufficient vault balance (${formatUsdc(summary.vaultEth)}).`);
        return;
      }
    }
    setTxState("idle");
    setConfirm(action);
  }

  async function runConfirmed() {
    if (!confirm || busy) return;
    setBusy(true);
    setTxState("signing");
    try {
      await new Promise((r) => setTimeout(r, 350));
      setTxState("pending");
      const path =
        confirm === "deposit" ? "/api/deposits/vault/deposit" : "/api/deposits/vault/withdraw";
      const r = await api.post(path, { amount: amt });
      setTxState("success");
      toast.show(confirm === "deposit" ? "Deposited to vault" : "Withdrawn to checking", {
        variant: "success",
      });
      setSummary((s) => ({
        ...s,
        vaultEth: r.vaultEth,
        checkingEth: r.checkingEth,
      }));
      setConfirm(null);
      await refresh();
    } catch (err) {
      setTxState("error");
      toast.show(
        err?.code === "withdrawal_blocked"
          ? err.message || "Withdrawals blocked by reserve ratio"
          : err?.message || "Failed",
        { variant: "error" },
      );
    } finally {
      setBusy(false);
    }
  }

  if (error && !summary) {
    return (
      <div className="client-page">
        <StateMessage
          title="Savings unavailable"
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
        <h1 className="client-title">Savings vault</h1>
        <p className="client-lede">
          Variable-yield ERC-4626-style vault. Deposit and withdraw USDC
          balances (demo ledger until the live vault is wired).
        </p>
        <div className="quick-actions">
          <Button as={Link} to="/app/deposits/fixed" variant="ghost" showArrow={false}>
            Fixed deposits
          </Button>
          <Button as={Link} to="/app/account/checking" variant="ghost" showArrow={false}>
            Checking
          </Button>
        </div>
      </header>

      {!summary?.reserveRatioOk ? (
        <div className="notice warn" role="status">
          {summary?.withdrawalBlockedReason ||
            "Vault withdrawals are temporarily restricted by the system reserve ratio."}
        </div>
      ) : null}

      <div className="stats-row snap-row">
        <StatCard label="Vault total" value={formatUsdc(summary?.vaultTotalEth ?? summary?.vaultEth)} />
        <StatCard label="Principal" value={formatUsdc(summary?.vaultPrincipalEth ?? summary?.vaultEth)} />
        <StatCard label="Accrued yield" value={formatUsdc(summary?.vaultAccruedEth ?? 0)} />
        <StatCard
          label="Variable APY"
          value={summary ? `${(summary.vaultApyBps / 100).toFixed(2)}%` : "—"}
        />
      </div>

      <Glass className="client-panel">
        <p className="eyebrow">How APY is split</p>
        <p className="client-lede" style={{ marginTop: 0 }}>
          Variable yield is allocated across depositors, the Insurance Fund, and protocol revenue.
        </p>
        <div className="yield-split" aria-hidden="true">
          <span
            className="yield-seg depositor"
            style={{ flex: split?.depositorBps ?? 7000 }}
            title="Depositors"
          />
          <span
            className="yield-seg insurance"
            style={{ flex: split?.insuranceBps ?? 2000 }}
            title="Insurance"
          />
          <span
            className="yield-seg protocol"
            style={{ flex: split?.protocolBps ?? 1000 }}
            title="Protocol"
          />
        </div>
        <ul className="terms-list">
          <li>
            <span>Depositors</span>
            <strong>{((split?.depositorBps ?? 7000) / 100).toFixed(0)}%</strong>
          </li>
          <li>
            <span>Insurance Fund</span>
            <strong>{((split?.insuranceBps ?? 2000) / 100).toFixed(0)}%</strong>
          </li>
          <li>
            <span>Protocol revenue</span>
            <strong>{((split?.protocolBps ?? 1000) / 100).toFixed(0)}%</strong>
          </li>
        </ul>
      </Glass>

      <Glass className="client-panel">
        <p className="eyebrow">Move funds</p>
        <p className="client-lede" style={{ marginTop: 0 }}>
          Checking available: {formatUsdc(summary?.checkingEth)}
        </p>
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            openConfirm("deposit");
          }}
        >
          <Input
            label="Amount (USDC)"
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
              summary?.reserveRatioOk
                ? "Withdrawals settle to checking when the reserve ratio allows."
                : "Deposit still works; withdrawals are gated by reserve ratio."
            }
          />
          <div className="quick-actions">
            <Button type="submit" disabled={busy || !canOpenDeposit}>
              Deposit
            </Button>
            <Button
              type="button"
              variant="ghost"
              showArrow={false}
              disabled={busy || !canOpenWithdraw}
              onClick={() => openConfirm("withdraw")}
            >
              Withdraw
            </Button>
          </div>
        </form>
      </Glass>

      <section className="client-section">
        <h2 className="client-section-title">History</h2>
        <ul className="activity-list">
          {ledger.length === 0 ? (
            <li className="activity-row glass">
              <span className="client-lede">No vault activity yet.</span>
            </li>
          ) : (
            ledger.map((e) => (
              <li key={e.id} className="activity-row glass">
                <div>
                  <strong>{e.kind.replaceAll("_", " ")}</strong>
                  <span>
                    {new Date(e.at).toLocaleString()}
                    {e.txHash ? (
                      <>
                        {" · "}
                        <ExplorerLink hash={e.txHash} />
                      </>
                    ) : null}
                  </span>
                </div>
                <code>{formatUsdc(e.amount)}</code>
              </li>
            ))
          )}
        </ul>
      </section>

      <Sheet
        open={Boolean(confirm)}
        onClose={() => (!busy ? setConfirm(null) : null)}
        title={confirm === "withdraw" ? "Confirm withdrawal" : "Confirm deposit"}
      >
        <p className="client-lede">
          {confirm === "deposit"
            ? `Move ${formatUsdc(amt)} from checking into the savings vault.`
            : `Move ${formatUsdc(amt)} from the vault back to checking.`}
        </p>
        <StatusStepper state={txState} />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void runConfirmed()}>
            {busy ? "Working…" : "Confirm"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            disabled={busy}
            onClick={() => setConfirm(null)}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
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
import { useSession } from "@/lib/store";

function formatEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${Number(n).toFixed(4)} ETH`;
}

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * Route: `/app/account/checking` — plan F.25 Current / Checking Account
 */
export default function CheckingPage() {
  const toast = useToast();
  const user = useSession((s) => s.user);
  const { address } = useAccount();
  const receiveAddr = (user?.wallet || address || "").toLowerCase();
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("0.1");
  const [busy, setBusy] = useState(false);
  const [txState, setTxState] = useState("idle");
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [s, l] = await Promise.all([
        api.get("/api/deposits/summary"),
        api.get("/api/deposits/ledger?kind=checking"),
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

  function openConfirm(e) {
    e.preventDefault();
    setFieldError("");
    const to = toAddress.trim();
    if (!ADDR_RE.test(to)) {
      setFieldError("Enter a valid 0x recipient address (40 hex chars).");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setFieldError("Enter a positive amount.");
      return;
    }
    if (summary && amt > summary.checkingEth + 1e-9) {
      setFieldError(`Insufficient balance (${formatEth(summary.checkingEth)}).`);
      return;
    }
    setTxState("idle");
    setConfirmOpen(true);
  }

  async function onSendConfirmed() {
    if (busy) return;
    setBusy(true);
    setTxState("signing");
    try {
      await new Promise((r) => setTimeout(r, 350));
      setTxState("pending");
      const r = await api.post("/api/deposits/checking/send", {
        toAddress: toAddress.trim(),
        amount: amt,
      });
      setTxState("success");
      toast.show("Transfer sent", { variant: "success" });
      setSummary((s) => ({ ...s, checkingEth: r.checkingEth }));
      setConfirmOpen(false);
      setToAddress("");
      await refresh();
    } catch (err) {
      setTxState("error");
      toast.show(err?.message || "Send failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (error && !summary) {
    return (
      <div className="client-page">
        <StateMessage
          title="Checking unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Account</p>
        <h1 className="client-title">Checking</h1>
        <p className="client-lede">
          Everyday transactional balance — no lock-up, no yield. Fund the vault and fixed deposits
          from here.
        </p>
        <div className="quick-actions">
          <Button as={Link} to="/app/savings" variant="ghost" showArrow={false}>
            Savings vault
          </Button>
          <Button as={Link} to="/app/deposits/fixed" variant="ghost" showArrow={false}>
            Fixed deposits
          </Button>
        </div>
      </header>

      <div className="stats-row snap-row">
        <StatCard label="Balance" value={formatEth(summary?.checkingEth)} />
        <StatCard label="In vault" value={formatEth(summary?.vaultEth)} />
        <StatCard label="Fixed deposits" value={formatEth(summary?.fixedEth)} />
      </div>

      <div className="client-grid-2">
        <Glass className="client-panel">
          <p className="eyebrow">Send</p>
          <form className="stack-form" onSubmit={openConfirm}>
            <Input
              label="Recipient address"
              value={toAddress}
              onChange={(e) => {
                setToAddress(e.target.value);
                setFieldError("");
              }}
              placeholder="0x…"
              required
              error={fieldError || undefined}
            />
            <Input
              label="Amount (ETH)"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setFieldError("");
              }}
              required
            />
            <Button type="submit" disabled={busy} block>
              Review transfer
            </Button>
          </form>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Receive</p>
          <p className="client-lede" style={{ marginTop: 0 }}>
            Share your address or QR. Demo ledger credits still settle via bank flows — this is your
            receive identity.
          </p>
          <code className="mono" style={{ wordBreak: "break-all", display: "block" }}>
            {receiveAddr || "—"}
          </code>
          {receiveAddr ? (
            <div className="receive-qr">
              <img
                alt="Receive QR"
                width={160}
                height={160}
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(receiveAddr)}`}
              />
            </div>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            disabled={!receiveAddr}
            onClick={() => {
              void navigator.clipboard?.writeText(receiveAddr);
              toast.show("Address copied", { variant: "success" });
            }}
          >
            Copy address
          </Button>
        </Glass>
      </div>

      <section className="client-section">
        <h2 className="client-section-title">History</h2>
        <ul className="activity-list">
          {ledger.length === 0 ? (
            <li className="activity-row glass">
              <span className="client-lede">No transfers yet.</span>
            </li>
          ) : (
            ledger.map((e) => (
              <li key={e.id} className="activity-row glass">
                <div>
                  <strong>{e.kind.replaceAll("_", " ")}</strong>
                  <span>
                    {new Date(e.at).toLocaleString()}
                    {e.counterparty ? ` · ${e.counterparty.slice(0, 8)}…` : ""}
                    {e.txHash ? (
                      <>
                        {" · "}
                        <ExplorerLink hash={e.txHash} />
                      </>
                    ) : null}
                  </span>
                </div>
                <code>{formatEth(e.amount)}</code>
              </li>
            ))
          )}
        </ul>
      </section>

      <Sheet
        open={confirmOpen}
        onClose={() => (!busy ? setConfirmOpen(false) : null)}
        title="Confirm transfer"
      >
        <p className="client-lede">
          Send {formatEth(amt)} to{" "}
          <code className="mono">{toAddress.trim().slice(0, 10)}…{toAddress.trim().slice(-6)}</code>
        </p>
        <StatusStepper state={txState} />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void onSendConfirmed()}>
            {busy ? "Sending…" : "Confirm send"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            disabled={busy}
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

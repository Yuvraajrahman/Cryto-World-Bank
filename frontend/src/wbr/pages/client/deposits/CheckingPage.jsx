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
import Badge from "../../../components/ui/Badge";
import ExplorerLink from "../../../components/ui/ExplorerLink";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";
import { useSession } from "@/lib/store";

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * Route: `/app/account/checking` — client→client USDC + receive
 */
export default function CheckingPage() {
  const toast = useToast();
  const user = useSession((s) => s.user);
  const { address } = useAccount();
  const receiveAddr = (user?.wallet || address || "").toLowerCase();
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [mode, setMode] = useState("loginId"); // loginId | address
  const [toLoginId, setToLoginId] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [resolved, setResolved] = useState(null);
  const [amount, setAmount] = useState("1");
  const [memo, setMemo] = useState("");
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

  useEffect(() => {
    const q = mode === "loginId" ? toLoginId.trim() : toAddress.trim();
    if (!q || (mode === "address" && !ADDR_RE.test(q)) || (mode === "loginId" && q.length < 3)) {
      setResolved(null);
      return;
    }
    const t = setTimeout(() => {
      void api
        .get(`/api/deposits/checking/resolve?q=${encodeURIComponent(q)}`)
        .then((r) => {
          setResolved(r);
          setFieldError("");
        })
        .catch(() => {
          setResolved(null);
        });
    }, 280);
    return () => clearTimeout(t);
  }, [mode, toLoginId, toAddress]);

  const amt = Number(amount);

  function openConfirm(e) {
    e.preventDefault();
    setFieldError("");
    if (!resolved) {
      setFieldError("Resolve a valid client by login ID or wallet first.");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setFieldError("Enter a positive amount.");
      return;
    }
    if (summary && amt > summary.checkingEth + 1e-9) {
      setFieldError(`Insufficient balance (${formatUsdc(summary.checkingEth)}).`);
      return;
    }
    setTxState("idle");
    setConfirmOpen(true);
  }

  async function onSendConfirmed() {
    if (busy || !resolved) return;
    setBusy(true);
    setTxState("signing");
    try {
      await new Promise((r) => setTimeout(r, 280));
      setTxState("pending");
      const body =
        mode === "loginId"
          ? { toLoginId: toLoginId.trim(), amount: amt, memo: memo.trim() || undefined }
          : { toAddress: toAddress.trim(), amount: amt, memo: memo.trim() || undefined };
      const r = await api.post("/api/deposits/checking/send", body);
      setTxState("success");
      toast.show(`Sent ${formatUsdc(amt)} to ${r.recipient?.displayName || "client"}`, {
        variant: "success",
      });
      setSummary((s) => ({ ...s, checkingEth: r.checkingUsdc ?? r.checkingEth }));
      setConfirmOpen(false);
      setToLoginId("");
      setToAddress("");
      setResolved(null);
      setMemo("");
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
        <h1 className="client-title">Checking · peer USDC</h1>
        <p className="client-lede">
          Send USDC to another client by login ID or wallet. Instant ledger credit — no lock-up.
        </p>
        <div className="client-hero-badges">
          <Badge>Client → client</Badge>
          {user?.loginId ? <Badge>Your ID · {user.loginId}</Badge> : null}
        </div>
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
        <StatCard label="Balance" value={formatUsdc(summary?.checkingEth)} />
        <StatCard label="In vault" value={formatUsdc(summary?.vaultEth)} />
        <StatCard label="Fixed deposits" value={formatUsdc(summary?.fixedEth)} />
      </div>

      <div className="client-grid-2">
        <Glass className="client-panel">
          <p className="eyebrow">Send to client</p>
          <form className="stack-form" onSubmit={openConfirm}>
            <Input
              label="Lookup by"
              as="select"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setFieldError("");
                setResolved(null);
              }}
            >
              <option value="loginId">Login ID</option>
              <option value="address">Wallet address</option>
            </Input>
            {mode === "loginId" ? (
              <Input
                label="Recipient login ID"
                value={toLoginId}
                onChange={(e) => {
                  setToLoginId(e.target.value);
                  setFieldError("");
                }}
                placeholder="e.g. client_bangladesh_dhaka_00001"
                required
              />
            ) : (
              <Input
                label="Recipient address"
                value={toAddress}
                onChange={(e) => {
                  setToAddress(e.target.value);
                  setFieldError("");
                }}
                placeholder="0x…"
                required
              />
            )}
            {resolved ? (
              <p className="client-lede" style={{ margin: 0 }}>
                → <strong>{resolved.displayName}</strong>
                {resolved.loginId ? ` · ${resolved.loginId}` : ""} ·{" "}
                <code className="mono">{resolved.wallet.slice(0, 10)}…</code>
              </p>
            ) : (
              <p className="client-lede" style={{ margin: 0, fontSize: 13 }}>
                Recipient must be a registered client.
              </p>
            )}
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
              required
              error={fieldError || undefined}
            />
            <Input
              label="Memo (optional)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Rent / gift / …"
            />
            <Button type="submit" disabled={busy || !resolved} block>
              Review transfer
            </Button>
          </form>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Receive</p>
          <p className="client-lede" style={{ marginTop: 0 }}>
            Share your login ID or wallet so peers can send you USDC.
          </p>
          {user?.loginId ? (
            <>
              <p className="eyebrow">Login ID</p>
              <code className="mono" style={{ wordBreak: "break-all", display: "block" }}>
                {user.loginId}
              </code>
              <Button
                type="button"
                variant="ghost"
                showArrow={false}
                onClick={() => {
                  void navigator.clipboard?.writeText(user.loginId);
                  toast.show("Login ID copied", { variant: "success" });
                }}
              >
                Copy login ID
              </Button>
            </>
          ) : null}
          <p className="eyebrow" style={{ marginTop: 12 }}>
            Wallet
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
                    {e.note ? ` · ${e.note}` : ""}
                    {e.counterparty ? ` · ${e.counterparty.slice(0, 8)}…` : ""}
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
        open={confirmOpen}
        onClose={() => (!busy ? setConfirmOpen(false) : null)}
        title="Confirm peer transfer"
      >
        <p className="client-lede">
          Send {formatUsdc(amt)} to <strong>{resolved?.displayName}</strong>
          {resolved?.loginId ? ` (${resolved.loginId})` : ""}.
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

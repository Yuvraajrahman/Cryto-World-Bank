/**
 * Fiat USD → MockUSDC on-ramp (paper dual-currency / MockUSDC).
 * Route: `/app/account/convert`
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import StatCard from "../../../components/ui/StatCard";
import StateMessage from "../../../components/ui/StateMessage";
import Badge from "../../../components/ui/Badge";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

export default function ConvertPage() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [amount, setAmount] = useState("50");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const s = await api.get("/api/deposits/summary");
      setSummary(s);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const amt = Number(amount);
  const rate = summary?.fx?.usdUsdcRate ?? 1;

  async function onConvert(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const r = await api.post("/api/deposits/convert/usd-to-usdc", { amountUsd: amt });
      toast.show(`Credited ${formatUsdc(r.usdcCredited)} to checking`, { variant: "success" });
      setSummary((s) => ({
        ...s,
        fiatUsd: r.fiatUsd,
        checkingUsdc: r.checkingUsdc,
        checkingEth: r.checkingUsdc,
      }));
    } catch (err) {
      toast.show(err?.message || err?.error || "Convert failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onTopup() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await api.post("/api/deposits/convert/fiat-topup", { amountUsd: 200 });
      toast.show("Demo USD topped up (+$200)", { variant: "success" });
      setSummary((s) => ({ ...s, fiatUsd: r.fiatUsd }));
    } catch (err) {
      toast.show(err?.message || err?.error || "Top-up failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (error && !summary) {
    return (
      <div className="client-page">
        <StateMessage
          title="Could not load balances"
          description={error.message || "Try again."}
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">On-ramp</p>
        <h1 className="client-title">USD → USDC</h1>
        <p className="client-lede">
          Convert simulated fiat dollars into MockUSDC credited to your checking account (1:{rate}{" "}
          demo peg).
        </p>
        <div className="client-hero-badges">
          <Badge icon="wallet">Dual currency</Badge>
          <Link to="/app/account/exchange" className="text-link">
            Exchange USDC ↔ ETH →
          </Link>
        </div>
      </header>

      <div className="client-snap-row">
        <StatCard label="Fiat USD" value={`$${(summary?.fiatUsd ?? 0).toFixed(2)}`} />
        <StatCard label="Checking USDC" value={formatUsdc(summary?.checkingUsdc ?? summary?.checkingEth)} />
        <StatCard label="Rate" value={`1 USD = ${rate} USDC`} />
      </div>

      <div className="client-grid-2">
        <Glass className="client-panel">
          <p className="eyebrow">Convert</p>
          <h2 className="client-panel-title">Buy MockUSDC</h2>
          <form className="stack-form" onSubmit={onConvert}>
            <Input
              label="Amount (USD)"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="client-lede" style={{ margin: "0 0 12px" }}>
              You receive ≈ {formatUsdc(Number.isFinite(amt) ? amt * rate : 0)}
            </p>
            <Button
              type="submit"
              disabled={busy || !Number.isFinite(amt) || amt <= 0 || amt > (summary?.fiatUsd ?? 0) + 1e-9}
            >
              Convert to USDC
            </Button>
          </form>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Demo funding</p>
          <h2 className="client-panel-title">Top up fiat</h2>
          <p className="client-lede" style={{ marginBottom: 16 }}>
            Simulated ACH credit for demos. Starts at $500 on first visit.
          </p>
          <Button type="button" variant="ghost" showArrow={false} disabled={busy} onClick={() => void onTopup()}>
            Add $200 USD
          </Button>
          <div style={{ marginTop: 20 }}>
            <Link to="/app/account/checking" className="text-link">
              Open checking →
            </Link>
            <br />
            <Link to="/app/account/statement" className="text-link">
              Account statement →
            </Link>
          </div>
        </Glass>
      </div>
    </div>
  );
}

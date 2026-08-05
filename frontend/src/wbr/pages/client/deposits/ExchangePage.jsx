/**
 * Retail FXModule stub — USDC ↔ ETH.
 * Route: `/app/account/exchange`
 */
import { useCallback, useEffect, useMemo, useState } from "react";
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

function fmtEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${Number(n).toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH`;
}

export default function ExchangePage() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [side, setSide] = useState("USDC_TO_ETH");
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

  const rate = summary?.fx?.usdcPerEth ?? 3200;
  const spreadBps = summary?.fx?.spreadBps ?? 30;
  const mult = 1 - spreadBps / 10_000;
  const amt = Number(amount);

  const preview = useMemo(() => {
    if (!Number.isFinite(amt) || amt <= 0) return null;
    if (side === "USDC_TO_ETH") return { out: (amt / rate) * mult, unit: "ETH" };
    return { out: amt * rate * mult, unit: "USDC" };
  }, [amt, side, rate, mult]);

  async function onSwap(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const r = await api.post("/api/deposits/fx/swap", { side, amount: amt });
      toast.show(
        side === "USDC_TO_ETH"
          ? `Received ${fmtEth(r.ethReceived)}`
          : `Received ${formatUsdc(r.usdcReceived)}`,
        { variant: "success" },
      );
      setSummary((s) => ({
        ...s,
        checkingUsdc: r.checkingUsdc,
        checkingEth: r.checkingUsdc,
        ethBalance: r.ethBalance,
      }));
    } catch (err) {
      toast.show(err?.message || err?.error || "Swap failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (error && !summary) {
    return (
      <div className="client-page">
        <StateMessage
          title="Could not load exchange"
          description={error.message || "Try again."}
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">FX desk</p>
        <h1 className="client-title">Exchange</h1>
        <p className="client-lede">
          Retail USDC ↔ ETH with a small demo spread ({spreadBps} bps). Bank operators use Treasury
          for institutional swaps.
        </p>
        <div className="client-hero-badges">
          <Badge>~{rate} USDC / ETH</Badge>
          <Link to="/app/account/convert" className="text-link">
            USD → USDC →
          </Link>
        </div>
      </header>

      <div className="client-snap-row">
        <StatCard label="Checking USDC" value={formatUsdc(summary?.checkingUsdc ?? summary?.checkingEth)} />
        <StatCard label="ETH balance" value={fmtEth(summary?.ethBalance)} />
        <StatCard label="Spread" value={`${(spreadBps / 100).toFixed(2)}%`} />
      </div>

      <Glass className="client-panel">
        <p className="eyebrow">Swap</p>
        <h2 className="client-panel-title">Trade crypto</h2>
        <form className="stack-form" onSubmit={onSwap}>
          <label className="field">
            <span>Direction</span>
            <select className="input" value={side} onChange={(e) => setSide(e.target.value)}>
              <option value="USDC_TO_ETH">Sell USDC → buy ETH</option>
              <option value="ETH_TO_USDC">Sell ETH → buy USDC</option>
            </select>
          </label>
          <Input
            label={side === "USDC_TO_ETH" ? "USDC amount" : "ETH amount"}
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          {preview ? (
            <p className="client-lede" style={{ margin: "0 0 12px" }}>
              You receive ≈{" "}
              {preview.unit === "ETH" ? fmtEth(preview.out) : formatUsdc(preview.out)}
            </p>
          ) : null}
          <Button type="submit" disabled={busy || !preview}>
            Execute swap
          </Button>
        </form>
        <div style={{ marginTop: 16 }}>
          <Link to="/app/account/statement" className="text-link">
            View statement →
          </Link>
        </div>
      </Glass>
    </div>
  );
}

/**
 * Shared treasury FX swap UI for World / National / Local operators.
 * Route examples: /bank/world?tab=treasury, /bank/national?tab=treasury, /bank/local?tab=treasury
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import StateMessage from "../../components/ui/StateMessage";
import Sheet from "../../components/ui/Sheet";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";
import { useSession } from "@/lib/store";

function fmtEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${Number(n).toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;
}

export default function TreasurySwapPage({
  title = "Treasury FX swap",
  lede = "Swap USDC ↔ ETH with World, National, or Local counterparties. Large notionals require World multisig settle.",
}) {
  const toast = useToast();
  const role = useSession((s) => s.role);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counterpartyId, setCounterpartyId] = useState("");
  const [sellAsset, setSellAsset] = useState("USDC");
  const [sellAmount, setSellAmount] = useState("10000");
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get("/api/treasury/overview");
      setData(d);
      setError(null);
      setCounterpartyId((prev) => prev || d.counterparties?.[0]?.bankId || "");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const amt = Number(sellAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setQuote(null);
      return;
    }
    const t = setTimeout(() => {
      void api
        .post("/api/treasury/quote", { sellAsset, sellAmount: amt })
        .then(setQuote)
        .catch(() => setQuote(null));
    }, 200);
    return () => clearTimeout(t);
  }, [sellAsset, sellAmount]);

  const selectedCp = useMemo(
    () => (data?.counterparties || []).find((c) => c.bankId === counterpartyId),
    [data, counterpartyId],
  );

  async function onPropose() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await api.post("/api/treasury/swaps", {
        counterpartyBankId: counterpartyId,
        sellAsset,
        sellAmount: Number(sellAmount),
      });
      toast.show(
        r.swap?.requiresMultisig
          ? "Large swap proposed — awaiting World multisig settle"
          : "Swap proposed — awaiting counterparty accept",
        { variant: "success" },
      );
      setConfirmOpen(false);
      await load();
    } catch (err) {
      toast.show(err?.message || err?.error || "Propose failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onAccept(id) {
    setBusy(true);
    try {
      await api.post(`/api/treasury/swaps/${id}/accept`, {});
      toast.show("Swap settled", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err?.message || "Accept failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onSettleMsig(id) {
    setBusy(true);
    try {
      await api.post(`/api/treasury/swaps/${id}/settle-multisig`, {});
      toast.show("Multisig settle complete", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err?.message || "Settle failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onReject(id) {
    setBusy(true);
    try {
      await api.post(`/api/treasury/swaps/${id}/reject`, {});
      toast.show("Swap rejected", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err?.message || "Reject failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="client-page">
        <StateMessage title="Loading treasury…" description="Balances and open swaps." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Treasury unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      </div>
    );
  }

  const me = data.me;
  const isWorld = role === "OWNER" || role === "DEV_ADMIN";

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Treasury</p>
        <h1 className="client-title">{title}</h1>
        <p className="client-lede">{lede}</p>
        <div className="client-hero-badges">
          <Badge>
            Oracle {formatUsdc(data.oracleUsdcPerEth)} / ETH
          </Badge>
          <Badge>Spread {(data.spreadBps / 100).toFixed(2)}%</Badge>
          <Badge>Large ≥ {formatUsdc(data.largeSwapUsdcThreshold)}</Badge>
        </div>
      </header>

      <div className="client-snap-row">
        <StatCard label="USDC reserve" value={formatUsdc(me?.usdc)} />
        <StatCard label="Available USDC" value={formatUsdc(me?.availableUsdc)} />
        <StatCard label="ETH treasury" value={fmtEth(me?.eth)} />
        <StatCard label="Your bank" value={me?.name || "—"} />
      </div>

      <div className="client-grid-2">
        <Glass className="client-panel">
          <p className="eyebrow">Propose swap</p>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <Input
              label="Counterparty"
              as="select"
              value={counterpartyId}
              onChange={(e) => setCounterpartyId(e.target.value)}
            >
              {(data.counterparties || []).map((c) => (
                <option key={c.bankId} value={c.bankId}>
                  [{c.tier}] {c.name} · {formatUsdc(c.availableUsdc)} / {fmtEth(c.availableEth)}
                </option>
              ))}
            </Input>
            <Input
              label="You sell"
              as="select"
              value={sellAsset}
              onChange={(e) => setSellAsset(e.target.value)}
            >
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </Input>
            <Input
              label={`Amount (${sellAsset})`}
              type="number"
              step="0.01"
              min="0"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
            />
            {quote ? (
              <p className="client-lede" style={{ margin: 0 }}>
                You receive ≈{" "}
                <strong>
                  {quote.buyAsset === "USDC"
                    ? formatUsdc(quote.buyAmount)
                    : fmtEth(quote.buyAmount)}
                </strong>
                {quote.requiresMultisig ? " · multisig required" : ""}
              </p>
            ) : null}
            <Button type="submit" disabled={busy || !counterpartyId} block>
              Review proposal
            </Button>
          </form>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Counterparty snapshot</p>
          {selectedCp ? (
            <>
              <h2 className="client-panel-title" style={{ fontSize: "1.2rem" }}>
                {selectedCp.name}
              </h2>
              <p className="client-lede">
                {selectedCp.tier} · available {formatUsdc(selectedCp.availableUsdc)} USDC ·{" "}
                {fmtEth(selectedCp.availableEth)}
              </p>
            </>
          ) : (
            <p className="client-lede">Select a counterparty.</p>
          )}
          <p className="client-lede" style={{ fontSize: 13 }}>
            Allowed pairs: World↔National, World↔Local, National↔its Local banks. USDC legs respect
            the {(data.minReserveRatio * 100).toFixed(0)}% reserve floor.
          </p>
        </Glass>
      </div>

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">Open swaps</h2>
          <Button type="button" variant="ghost" showArrow={false} disabled={busy} onClick={() => void load()}>
            Refresh
          </Button>
        </div>
        {(data.openSwaps || []).length === 0 ? (
          <StateMessage variant="empty" title="No open swaps" description="Propose one above." />
        ) : (
          <ul className="ops-stack">
            {data.openSwaps.map((s) => {
              const iAmCounter = s.counterpartyBankId === me?.bankId;
              const iAmInitiator = s.initiatorBankId === me?.bankId;
              return (
                <li key={s.id} className="ops-row glass">
                  <div>
                    <strong>
                      {s.sellAmount.toLocaleString()} {s.sellAsset} → {Number(s.buyAmount).toFixed(4)}{" "}
                      {s.buyAsset}
                    </strong>
                    <span>
                      {s.initiator?.name} → {s.counterparty?.name} · {s.status}
                      {s.requiresMultisig ? " · LARGE" : ""}
                    </span>
                  </div>
                  <div className="quick-actions">
                    {iAmCounter && s.status === "PROPOSED" ? (
                      <Button type="button" disabled={busy} onClick={() => void onAccept(s.id)}>
                        Accept
                      </Button>
                    ) : null}
                    {isWorld && s.status === "PENDING_MULTISIG" ? (
                      <Button type="button" disabled={busy} onClick={() => void onSettleMsig(s.id)}>
                        Multisig settle
                      </Button>
                    ) : null}
                    {(iAmCounter || iAmInitiator || isWorld) &&
                    (s.status === "PROPOSED" || s.status === "PENDING_MULTISIG") ? (
                      <Button
                        type="button"
                        variant="ghost"
                        showArrow={false}
                        disabled={busy}
                        onClick={() => void onReject(s.id)}
                      >
                        Reject
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="client-section">
        <h2 className="client-section-title">Recent history</h2>
        <ul className="activity-list">
          {(data.history || []).slice(0, 15).map((s) => (
            <li key={s.id} className="activity-row glass">
              <div>
                <strong>
                  {s.sellAmount.toLocaleString()} {s.sellAsset} ↔ {Number(s.buyAmount).toFixed(4)}{" "}
                  {s.buyAsset}
                </strong>
                <span>
                  {s.status} · {new Date(s.createdAt).toLocaleString()}
                </span>
              </div>
              <Badge>{s.id.slice(0, 12)}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <Sheet open={confirmOpen} onClose={() => !busy && setConfirmOpen(false)} title="Confirm swap">
        <p className="client-lede">
          Sell {sellAmount} {sellAsset} to {selectedCp?.name || "counterparty"} for ≈{" "}
          {quote
            ? quote.buyAsset === "USDC"
              ? formatUsdc(quote.buyAmount)
              : fmtEth(quote.buyAmount)
            : "—"}
          .
        </p>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" disabled={busy} onClick={() => void onPropose()}>
            {busy ? "Working…" : "Propose"}
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

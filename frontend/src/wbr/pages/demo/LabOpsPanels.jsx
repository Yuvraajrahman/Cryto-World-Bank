/**
 * On-page Lab operations — allocate, exchange, facilities, upstream request, manage.
 * Keeps Demo Lab single-page (no desk redirects).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { X, RefreshCw, Landmark, ArrowLeftRight, Layers, Send } from "lucide-react";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

function shortMoney(n) {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toFixed(v >= 100 ? 0 : 2);
}

function PanelShell({ title, subtitle, icon: Icon, onClose, children }) {
  return (
    <section
      id="sec-ops"
      className="rounded-xl border border-base bg-surface overflow-hidden scroll-mt-24"
    >
      <div className="px-5 py-3.5 border-b border-base flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {Icon ? (
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-accent-soft">
              <Icon size={15} className="text-accent" />
            </div>
          ) : null}
          <div className="min-w-0">
            <h2 className="font-display text-sm font-semibold">{title}</h2>
            {subtitle ? <p className="text-xs text-muted mt-0.5">{subtitle}</p> : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted hover:text-ink hover:bg-surface-alt transition-colors"
          aria-label="Close panel"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-base bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-[var(--accent)]";

export default function LabOpsPanels({
  role,
  panel,
  bank,
  banks,
  availableToAllocate,
  onClose,
  onDone,
  setToast,
}) {
  if (!panel) return null;

  if (panel === "allocate") {
    return (
      <AllocatePanel
        role={role}
        bank={bank}
        banks={banks}
        available={availableToAllocate}
        onClose={onClose}
        onDone={onDone}
        setToast={setToast}
      />
    );
  }
  if (panel === "exchange") {
    return (
      <ExchangePanel
        bank={bank}
        banks={banks}
        onClose={onClose}
        onDone={onDone}
        setToast={setToast}
      />
    );
  }
  if (panel === "facilities") {
    return <FacilitiesPanel onClose={onClose} onDone={onDone} setToast={setToast} />;
  }
  if (panel === "request") {
    return (
      <RequestUpstreamPanel role={role} onClose={onClose} onDone={onDone} setToast={setToast} />
    );
  }
  if (panel === "manage") {
    return (
      <ManagePanel
        role={role}
        bank={bank}
        banks={banks}
        onClose={onClose}
        onDone={onDone}
        setToast={setToast}
      />
    );
  }
  if (panel === "governance") {
    return <GovernancePanel onClose={onClose} setToast={setToast} />;
  }
  return null;
}

function AllocatePanel({ role, bank, banks, available, onClose, onDone, setToast }) {
  const options = (banks || []).filter((b) => b.id && b.status !== "INACTIVE");
  const [toBankId, setToBankId] = useState(bank?.id || options[0]?.id || "");
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (bank?.id) setToBankId(bank.id);
  }, [bank?.id]);

  const amt = Number(amount);
  const valid = Number.isFinite(amt) && amt > 0 && toBankId && amt <= (Number(available) || 0) + 1e-9;
  const endpoint =
    role === "world" ? "/api/world-bank/capital/allocate" : "/api/national-bank/capital/allocate";
  const childLabel = role === "world" ? "National Bank" : "Local Bank";

  async function submit(e) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    try {
      await api.post(endpoint, {
        toBankId,
        amount: amt,
        note: note.trim() || undefined,
      });
      setToast?.({ tone: "ok", text: `Allocated ${amt} USDC` });
      onDone?.();
      onClose?.();
    } catch (err) {
      setToast?.({ tone: "err", text: err?.message || err?.error || "Allocate failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelShell
      title="Allocate capital"
      subtitle={`Send reserve down to a ${childLabel}. Available: ${shortMoney(available)} USDC.`}
      icon={Landmark}
      onClose={onClose}
    >
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Field label={childLabel}>
          <select
            className={inputCls}
            value={toBankId}
            onChange={(e) => setToBankId(e.target.value)}
          >
            {options.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · reserve {b.col2}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (USDC)">
          <input
            className={inputCls}
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Note (optional)">
            <input
              className={inputCls}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lab allocation"
            />
          </Field>
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={!valid || busy}
            className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium"
          >
            {busy ? "Allocating…" : "Confirm allocate"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </PanelShell>
  );
}

function ExchangePanel({ bank, banks, onClose, onDone, setToast }) {
  const [overview, setOverview] = useState(null);
  const [counterpartyBankId, setCounterpartyBankId] = useState(bank?.id || "");
  const [sellAsset, setSellAsset] = useState("USDC");
  const [sellAmount, setSellAmount] = useState("50");
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get("/api/treasury/overview");
      setOverview(d);
      const cps = d.counterparties || [];
      const prefer = bank?.id && cps.find((c) => c.bankId === bank.id || c.id === bank.id);
      setCounterpartyBankId((prev) => prefer?.bankId || prefer?.id || prev || cps[0]?.bankId || cps[0]?.id || "");
    } catch (err) {
      setToast?.({ tone: "err", text: err?.message || "Treasury unavailable" });
    } finally {
      setLoading(false);
    }
  }, [bank?.id, setToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const amt = Number(sellAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setQuote(null);
      return undefined;
    }
    const t = setTimeout(() => {
      api
        .post("/api/treasury/quote", { sellAsset, sellAmount: amt })
        .then(setQuote)
        .catch(() => setQuote(null));
    }, 250);
    return () => clearTimeout(t);
  }, [sellAsset, sellAmount]);

  const counterparties = overview?.counterparties || [];
  // Prefer roster banks when present in counterparties
  const options = useMemo(() => {
    if (!counterparties.length) return (banks || []).map((b) => ({ id: b.id, name: b.name }));
    return counterparties.map((c) => ({
      id: c.bankId || c.id,
      name: c.name,
      tier: c.tier,
    }));
  }, [counterparties, banks]);

  async function submit(e) {
    e.preventDefault();
    const amt = Number(sellAmount);
    if (!counterpartyBankId || !Number.isFinite(amt) || amt <= 0 || busy) return;
    setBusy(true);
    try {
      await api.post("/api/treasury/swaps", {
        counterpartyBankId,
        sellAsset,
        sellAmount: amt,
      });
      setToast?.({ tone: "ok", text: "Exchange request sent" });
      onDone?.();
      onClose?.();
    } catch (err) {
      setToast?.({ tone: "err", text: err?.message || err?.error || "Exchange failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelShell
      title="Send exchange request"
      subtitle="Propose a USDC ↔ ETH treasury swap with a counterparty bank."
      icon={ArrowLeftRight}
      onClose={onClose}
    >
      {loading ? (
        <div className="text-sm text-muted flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin" /> Loading treasury…
        </div>
      ) : (
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="sm:col-span-2 rounded-lg border border-base bg-surface-alt px-3.5 py-2.5 text-xs text-muted flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Your USDC:{" "}
              <strong className="text-ink font-mono-data">
                {shortMoney(overview?.me?.availableUsdc ?? overview?.me?.usdc)}
              </strong>
            </span>
            <span>
              Your ETH:{" "}
              <strong className="text-ink font-mono-data">
                {shortMoney(overview?.me?.availableEth ?? overview?.me?.eth)}
              </strong>
            </span>
            <span>
              Oracle:{" "}
              <strong className="text-ink font-mono-data">
                {overview?.oracleUsdcPerEth} USDC/ETH
              </strong>
            </span>
          </div>
          <Field label="Counterparty">
            <select
              className={inputCls}
              value={counterpartyBankId}
              onChange={(e) => setCounterpartyBankId(e.target.value)}
            >
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.tier ? ` · ${c.tier}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sell asset">
            <select
              className={inputCls}
              value={sellAsset}
              onChange={(e) => setSellAsset(e.target.value)}
            >
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </select>
          </Field>
          <Field label="Sell amount">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="any"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
            />
          </Field>
          <Field label="Indicative buy">
            <div className="rounded-lg border border-base px-3 py-2 text-sm font-mono-data">
              {quote
                ? `${shortMoney(quote.buyAmount)} ${sellAsset === "USDC" ? "ETH" : "USDC"}`
                : "—"}
            </div>
          </Field>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy || !counterpartyBankId}
              className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium"
            >
              {busy ? "Sending…" : "Send exchange request"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </PanelShell>
  );
}

function FacilitiesPanel({ onClose, onDone, setToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lenderId, setLenderId] = useState("");
  const [ibAmount, setIbAmount] = useState("25");
  const [upAmount, setUpAmount] = useState("50");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get("/api/facilities/overview");
      setData(d);
      setLenderId((prev) => prev || d.peers?.[0]?.id || "");
    } catch (err) {
      setToast?.({ tone: "err", text: err?.message || "Facilities unavailable" });
    } finally {
      setLoading(false);
    }
  }, [setToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const me = data?.me;
  const canBorrow = me?.tier === "NATIONAL" || me?.tier === "LOCAL";
  const canUpward = Boolean(data?.parent);

  async function requestIb(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.post("/api/facilities/interbank/request", {
        lenderBankId: lenderId,
        amountUsdc: Number(ibAmount),
        tenorDays: 7,
      });
      setToast?.({ tone: "ok", text: "Interbank loan requested" });
      await load();
      onDone?.();
    } catch (err) {
      setToast?.({ tone: "err", text: err?.message || err?.error || "Request failed" });
    } finally {
      setBusy(false);
    }
  }

  async function depositUp(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.post("/api/facilities/upward/deposit", {
        amountUsdc: Number(upAmount),
      });
      setToast?.({ tone: "ok", text: "Upward deposit submitted" });
      await load();
      onDone?.();
    } catch (err) {
      setToast?.({ tone: "err", text: err?.message || err?.error || "Deposit failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelShell
      title="Facilities desk"
      subtitle="Same-tier interbank lending and surplus parked with the parent tier."
      icon={Layers}
      onClose={onClose}
    >
      {loading ? (
        <div className="text-sm text-muted flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin" /> Loading facilities…
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Your reserve", shortMoney(me?.reserveUsdc)],
              ["Available", shortMoney(me?.availableUsdc)],
              ["Open IB loans", String((data?.interbank || []).length)],
              ["Upward positions", String((data?.upward || []).length)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-base px-3 py-2.5">
                <div className="text-xs text-muted">{label}</div>
                <div className="font-mono-data text-base font-semibold mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          {canBorrow && (data?.peers || []).length > 0 ? (
            <form onSubmit={requestIb} className="rounded-lg border border-base p-4 space-y-3 max-w-xl">
              <div className="text-sm font-medium">Request interbank loan</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Lender peer">
                  <select
                    className={inputCls}
                    value={lenderId}
                    onChange={(e) => setLenderId(e.target.value)}
                  >
                    {(data.peers || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Amount (USDC)">
                  <input
                    className={inputCls}
                    type="number"
                    value={ibAmount}
                    onChange={(e) => setIbAmount(e.target.value)}
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="btn-primary inline-flex rounded-lg px-3.5 py-2 text-sm font-medium"
              >
                Request loan
              </button>
            </form>
          ) : (
            <p className="text-xs text-muted">
              {me?.tier === "WORLD"
                ? "World Bank funds National Banks via Allocate — peer IB markets apply at National / Local."
                : "No peer lenders available in this demo seed."}
            </p>
          )}

          {canUpward ? (
            <form onSubmit={depositUp} className="rounded-lg border border-base p-4 space-y-3 max-w-xl">
              <div className="text-sm font-medium">
                Park surplus with {data.parent?.name || "parent"}
              </div>
              <Field label="Amount (USDC)">
                <input
                  className={inputCls}
                  type="number"
                  value={upAmount}
                  onChange={(e) => setUpAmount(e.target.value)}
                />
              </Field>
              <button
                type="submit"
                disabled={busy}
                className="btn-primary inline-flex rounded-lg px-3.5 py-2 text-sm font-medium"
              >
                Submit upward deposit
              </button>
            </form>
          ) : null}
        </div>
      )}
    </PanelShell>
  );
}

function RequestUpstreamPanel({ role, onClose, onDone, setToast }) {
  const [lenders, setLenders] = useState([]);
  const [lenderId, setLenderId] = useState("");
  const [amount, setAmount] = useState("100");
  const [purpose, setPurpose] = useState("Lab liquidity request");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get("/api/loans/lenders")
      .then((d) => {
        const list = d.lenders || d.banks || [];
        setLenders(list);
        setLenderId(list[0]?.id || "");
      })
      .catch(() => setLenders([]));
  }, []);

  async function submit(e) {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0 || busy) return;
    setBusy(true);
    try {
      if (role === "national") {
        await api.post("/api/loans/bank-request/national-from-world", {
          amount: amt,
          termMonths: 6,
          installmentCount: 6,
          purpose,
          lenderBankId: lenderId || undefined,
        });
      } else {
        await api.post("/api/loans/bank-request/local-from-national", {
          amount: amt,
          termMonths: 6,
          installmentCount: 6,
          purpose,
          lenderBankId: lenderId || undefined,
        });
      }
      setToast?.({ tone: "ok", text: "Liquidity request submitted" });
      onDone?.();
      onClose?.();
    } catch (err) {
      setToast?.({ tone: "err", text: err?.message || err?.error || "Request failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelShell
      title={role === "national" ? "Request from World Bank" : "Request from National Bank"}
      subtitle="Ask the tier above for liquidity. The request appears in their approvals queue."
      icon={Send}
      onClose={onClose}
    >
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {lenders.length > 0 ? (
          <Field label="Lender">
            <select
              className={inputCls}
              value={lenderId}
              onChange={(e) => setLenderId(e.target.value)}
            >
              {lenders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · avail {shortMoney(l.availableToLend)}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="Amount (USDC)">
          <input
            className={inputCls}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Purpose">
            <input
              className={inputCls}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </Field>
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="btn-primary inline-flex rounded-lg px-4 py-2 text-sm font-medium"
          >
            {busy ? "Sending…" : "Submit request"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary inline-flex rounded-lg px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </PanelShell>
  );
}

function ManagePanel({ role, bank, banks, onClose, onDone, setToast }) {
  const [selectedId, setSelectedId] = useState(bank?.id || banks?.[0]?.id || "");
  const selected = (banks || []).find((b) => b.id === selectedId) || bank;

  useEffect(() => {
    if (bank?.id) setSelectedId(bank.id);
  }, [bank?.id]);

  if (!selected) {
    return (
      <PanelShell title="Manage banks" subtitle="No banks in roster." onClose={onClose}>
        <p className="text-sm text-muted">Switch persona or wait for live data.</p>
      </PanelShell>
    );
  }

  const specs = selected.specs || {};
  const isClient = specs.kind === "client" || role === "local";

  return (
    <PanelShell
      title={`Manage · ${selected.name}`}
      subtitle={
        isClient
          ? "Live client profile for this branch. Loan requests appear in Approvals."
          : "Live specs for the selected bank. Use actions without leaving the Lab."
      }
      icon={Landmark}
      onClose={onClose}
    >
      <div className="space-y-4">
        <Field label={isClient ? "Client" : role === "world" ? "National Bank" : "Local Bank"}>
          <select
            className={inputCls}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {(banks || []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(isClient
            ? [
                ["Login ID", specs.loginId || "—"],
                ["Outstanding", shortMoney(specs.reserve)],
                ["Active loans", String(specs.activeLoanCount ?? 0)],
                ["Loan requests", String(specs.loanRequests ?? 0)],
                ["KYC", specs.kycStatus || "—"],
                ["Status", selected.status || "—"],
                ["Wallet", specs.wallet ? `${String(specs.wallet).slice(0, 10)}…` : "—"],
              ]
            : [
                ["Reserve", shortMoney(specs.reserve)],
                ["Available", shortMoney(specs.available)],
                ["Sent down", shortMoney(specs.sentDown)],
                ["Ratio", `${Number(specs.ratioPct ?? selected.ratio ?? 0).toFixed(1)}%`],
                ["Loan requests", String(specs.loanRequests ?? 0)],
                ["Capital requests", String(specs.capitalRequests ?? 0)],
                ["Status", selected.status || "—"],
                ["Near min", specs.nearMinimum ? "Yes" : "No"],
              ]
          ).map(([label, value]) => (
            <div key={label} className="rounded-lg border border-base px-3 py-2.5">
              <div className="text-xs text-muted">{label}</div>
              <div className="font-mono-data text-sm font-semibold mt-0.5 break-all">{value}</div>
            </div>
          ))}
        </div>

        {(specs.pendingLoans || []).length > 0 ? (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
              Open loan requests
            </div>
            <div className="space-y-1.5">
              {specs.pendingLoans.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-lg border border-base px-3 py-2 text-sm"
                >
                  <span>{l.id}</span>
                  <span className="font-mono-data text-muted">{formatUsdc(l.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted">
            {isClient
              ? "No open loan requests from this client right now."
              : "No open loan requests from this bank right now."}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {!isClient ? (
            <>
              <button
                type="button"
                onClick={() => onDone?.({ openPanel: "allocate", bank: selected })}
                className="btn-primary inline-flex rounded-lg px-3.5 py-2 text-sm font-medium"
              >
                Allocate
              </button>
              <button
                type="button"
                onClick={() => onDone?.({ openPanel: "exchange", bank: selected })}
                className="btn-secondary inline-flex rounded-lg px-3.5 py-2 text-sm font-medium"
              >
                Send exchange
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-sm inline-flex rounded-lg px-3.5 py-2 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </PanelShell>
  );
}

function GovernancePanel({ onClose, setToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/world-bank/multisig")
      .then(setData)
      .catch((err) => setToast?.({ tone: "err", text: err?.message || "Governance unavailable" }))
      .finally(() => setLoading(false));
  }, [setToast]);

  return (
    <PanelShell
      title="Governance & multisig"
      subtitle="Pending World Bank multisig transactions and reserve snapshot."
      icon={Layers}
      onClose={onClose}
    >
      {loading ? (
        <div className="text-sm text-muted flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Threshold", `${data?.threshold ?? "—"}`],
              ["Signers", `${data?.signerCount ?? "—"}`],
              ["Pending", `${(data?.pending || []).length}`],
              ["Available", shortMoney(data?.reserve?.availableToAllocateEth)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-base px-3 py-2.5">
                <div className="text-xs text-muted">{label}</div>
                <div className="font-mono-data text-base font-semibold mt-0.5">{value}</div>
              </div>
            ))}
          </div>
          {(data?.pending || []).length === 0 ? (
            <p className="text-sm text-muted">No pending multisig transactions.</p>
          ) : (
            <div className="space-y-2">
              {data.pending.slice(0, 8).map((tx) => (
                <div
                  key={tx.id}
                  className="rounded-lg border border-base px-3.5 py-2.5 text-sm flex justify-between gap-3"
                >
                  <div>
                    <div className="font-medium">{tx.title || tx.action}</div>
                    <div className="text-xs text-muted">{tx.id}</div>
                  </div>
                  <span className="text-xs badge-pending rounded-md px-2 py-0.5 h-fit">
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PanelShell>
  );
}

function nextUnpaidInstallment(loan) {
  return (loan?.installments || []).find((i) => !i.paid) || null;
}

function remainingPrincipal(loan) {
  const unpaid = (loan?.installments || []).filter((i) => !i.paid);
  if (unpaid.length) return unpaid.reduce((s, i) => s + Number(i.amount || 0), 0);
  if (loan?.status === "ACTIVE" || loan?.status === "APPROVED") return Number(loan.amount || 0);
  return 0;
}

/**
 * On-page client borrow + repay for Demo Lab (no redirect to /app).
 */
export function ClientBorrowPanel({ onDone, setToast, homeBankId }) {
  const [lenders, setLenders] = useState([]);
  const [loans, setLoans] = useState([]);
  const [limits, setLimits] = useState(null);
  const [lenderId, setLenderId] = useState(homeBankId || "");
  const [amount, setAmount] = useState("50");
  const [termMonths, setTermMonths] = useState("6");
  const [purpose, setPurpose] = useState("Lab client loan request");
  const [repayLoanId, setRepayLoanId] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lend, mine, home] = await Promise.all([
        api.get("/api/loans/lenders"),
        api.get("/api/loans/mine").catch(() => ({ loans: [] })),
        api.get("/api/profile/home").catch(() => null),
      ]);
      const local = lend.categories?.LOCAL || [];
      const national = lend.categories?.NATIONAL || [];
      // Prefer Bangladesh / home branch first for Lab
      const ranked = [...local, ...national].sort((a, b) => {
        const score = (x) => {
          let s = 0;
          if (homeBankId && x.id === homeBankId) s += 100;
          if (String(x.id || "").includes("bangladesh")) s += 50;
          if (String(x.name || "").toLowerCase().includes("bangladesh")) s += 40;
          if (String(x.id || "").includes("dhaka")) s += 20;
          return s;
        };
        return score(b) - score(a);
      });
      setLenders(ranked);
      const prefer =
        (homeBankId && ranked.find((l) => l.id === homeBankId)?.id) ||
        ranked.find((l) => String(l.id).includes("bangladesh_dhaka"))?.id ||
        ranked[0]?.id ||
        "";
      setLenderId((prev) => prev || prefer);
      const list = mine.loans || [];
      setLoans(list);
      setLimits(home?.limits || null);
      setRepayLoanId((prev) => {
        if (prev && list.some((l) => l.id === prev && (l.status === "ACTIVE" || l.status === "APPROVED"))) {
          return prev;
        }
        const firstActive = list.find((l) => l.status === "ACTIVE" || l.status === "APPROVED");
        return firstActive?.id || "";
      });
      setError(null);
    } catch (err) {
      setError(err?.message || "Could not load borrow desk");
    } finally {
      setLoading(false);
    }
  }, [homeBankId]);

  useEffect(() => {
    void load();
  }, [load]);

  const repayable = useMemo(
    () => loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED"),
    [loans],
  );
  const selectedLoan = repayable.find((l) => l.id === repayLoanId) || null;
  const nextInst = nextUnpaidInstallment(selectedLoan);
  const remaining = selectedLoan ? remainingPrincipal(selectedLoan) : 0;
  const atCap =
    limits &&
    Number(limits.activeLoanCount || 0) >= Number(limits.maxActiveLoans || 1);

  async function submit(e) {
    e.preventDefault();
    const amt = Number(amount);
    const term = Number(termMonths);
    if (!lenderId || !Number.isFinite(amt) || amt <= 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.post("/api/loans", {
        amount: amt,
        termMonths: term,
        installmentCount: term,
        purpose: purpose.trim() || "Lab loan",
        lenderBankId: lenderId,
        loanType: "credit",
        autoActivate: false,
      });
      setToast?.({
        tone: "ok",
        text: `Loan requested (${r.loan?.id || "ok"}) — waiting on Local Bank approval`,
      });
      await load();
      onDone?.();
    } catch (err) {
      const limitsInfo = err?.details?.limits || err?.details || {};
      const msg =
        err?.code === "active_loan_cap" || err?.message === "active_loan_cap"
          ? `Active loan cap reached (${limitsInfo.activeLoanCount ?? "?"}/${limitsInfo.maxActiveLoans ?? "?"}). Settle or repay an active loan below, then try again.`
          : err?.message || err?.code || "Loan request failed";
      setError(msg);
      setToast?.({ tone: "err", text: msg });
    } finally {
      setBusy(false);
    }
  }

  async function payInstallment() {
    if (!selectedLoan || !nextInst || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/loans/${selectedLoan.id}/installments/${nextInst.index}/pay`);
      setToast?.({
        tone: "ok",
        text: `Paid installment #${nextInst.index} (${formatUsdc(nextInst.amount)})`,
      });
      await load();
      onDone?.();
    } catch (err) {
      const msg = err?.message || err?.code || "Installment payment failed";
      setError(msg);
      setToast?.({ tone: "err", text: msg });
    } finally {
      setBusy(false);
    }
  }

  async function repayFull() {
    if (!selectedLoan || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (selectedLoan.isInstallment && (selectedLoan.installments || []).length) {
        // Lab full payoff: settle remaining schedule in one step
        await api.post(`/api/loans/${selectedLoan.id}/settle`, {});
        setToast?.({ tone: "ok", text: `Repaid remaining balance on ${selectedLoan.id}` });
      } else {
        await api.post(`/api/loans/${selectedLoan.id}/repay`, {});
        setToast?.({ tone: "ok", text: `Repaid ${selectedLoan.id} in full` });
      }
      await load();
      onDone?.();
    } catch (err) {
      const msg = err?.message || err?.code || "Repayment failed";
      setError(msg);
      setToast?.({ tone: "err", text: msg });
    } finally {
      setBusy(false);
    }
  }

  async function settle(loanId) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/loans/${loanId}/settle`, {});
      setToast?.({ tone: "ok", text: `Settled ${loanId}` });
      await load();
      onDone?.();
    } catch (err) {
      setError(err?.message || err?.code || "Settle failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-base bg-surface p-5 text-sm text-muted flex items-center gap-2">
        <RefreshCw size={14} className="animate-spin" /> Loading borrow desk…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {atCap ? (
        <div className="rounded-lg border border-base bg-brass-soft px-3.5 py-2.5 text-xs text-brass">
          You already have {limits.activeLoanCount} active loan(s) (max {limits.maxActiveLoans}).
          Repay or settle one below to free capacity for a new request.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-base px-3.5 py-2.5 text-xs text-brass">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Request */}
        <div className="rounded-lg border border-base p-4">
          <div className="text-sm font-semibold mb-1">Request a loan</div>
          <p className="text-xs text-muted mb-3">
            Borrow from your Local Bank. Requests stay PENDING until the branch approves.
          </p>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Lender bank">
              <select className={inputCls} value={lenderId} onChange={(e) => setLenderId(e.target.value)}>
                {lenders.slice(0, 40).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} · avail {shortMoney(l.availableToLendUsdc ?? l.reserveUsdc)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Amount (USDC)">
              <input
                className={inputCls}
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            <Field label="Term (months)">
              <input
                className={inputCls}
                type="number"
                min="1"
                max="60"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
              />
            </Field>
            <Field label="Purpose">
              <input
                className={inputCls}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={busy || !lenderId || atCap}
                className="btn-primary inline-flex rounded-lg px-3.5 py-2 text-xs font-medium"
              >
                {busy ? "Submitting…" : "Request now"}
              </button>
              <button
                type="button"
                onClick={() => void load()}
                className="btn-secondary inline-flex rounded-lg px-3.5 py-2 text-xs font-medium"
              >
                Refresh
              </button>
            </div>
          </form>
        </div>

        {/* Repay */}
        <div className="rounded-lg border border-base p-4">
          <div className="text-sm font-semibold mb-1">Repay loan</div>
          <p className="text-xs text-muted mb-3">
            Pay the next installment, or clear the remaining balance in full.
          </p>
          {repayable.length === 0 ? (
            <p className="text-sm text-muted">
              No active loans to repay. Request a loan and have Local Bank approve it first.
            </p>
          ) : (
            <div className="space-y-3">
              <Field label="Active loan">
                <select
                  className={inputCls}
                  value={repayLoanId}
                  onChange={(e) => setRepayLoanId(e.target.value)}
                >
                  {repayable.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.id} · {l.status} · {formatUsdc(l.amount)} · due {formatUsdc(remainingPrincipal(l))}
                    </option>
                  ))}
                </select>
              </Field>

              {selectedLoan ? (
                <div className="rounded-md border border-base bg-surface-alt px-3 py-2.5 text-xs space-y-1">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted">Lender</span>
                    <span className="font-mono-data">{selectedLoan.lenderBankId}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted">Remaining</span>
                    <span className="font-mono-data">{formatUsdc(remaining)}</span>
                  </div>
                  {nextInst ? (
                    <>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted">Next installment</span>
                        <span className="font-mono-data">
                          #{nextInst.index} · {formatUsdc(nextInst.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted">Due</span>
                        <span className="font-mono-data">
                          {nextInst.dueDate
                            ? new Date(nextInst.dueDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </>
                  ) : selectedLoan.isInstallment ? (
                    <div className="text-muted">No unpaid installments on this loan.</div>
                  ) : (
                    <div className="text-muted">Single-payment loan — repay the full principal.</div>
                  )}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {nextInst ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void payInstallment()}
                    className="btn-primary inline-flex rounded-lg px-3.5 py-2 text-xs font-medium"
                  >
                    {busy ? "Paying…" : `Pay installment #${nextInst.index}`}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy || !selectedLoan || remaining <= 0}
                  onClick={() => void repayFull()}
                  className="btn-secondary inline-flex rounded-lg px-3.5 py-2 text-xs font-medium"
                >
                  {busy ? "Working…" : "Repay in full"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-faint mb-2">Your loans</div>
        {loans.length === 0 ? (
          <p className="text-sm text-muted">No loans yet.</p>
        ) : (
          <div className="space-y-2">
            {loans.slice(0, 12).map((l) => {
              const next = nextUnpaidInstallment(l);
              const canPay = (l.status === "ACTIVE" || l.status === "APPROVED") && next;
              const canSettle =
                l.status === "ACTIVE" || l.status === "APPROVED" || l.status === "PENDING";
              return (
                <div
                  key={l.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-base px-3.5 py-2.5 text-sm"
                >
                  <div>
                    <div className="font-medium">{l.id}</div>
                    <div className="text-xs text-muted">
                      {l.status} · {formatUsdc(l.amount)} · {l.lenderBankId}
                      {next ? ` · next #${next.index} ${formatUsdc(next.amount)}` : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {canPay ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setRepayLoanId(l.id);
                          void (async () => {
                            setBusy(true);
                            setError(null);
                            try {
                              await api.post(`/api/loans/${l.id}/installments/${next.index}/pay`);
                              setToast?.({
                                tone: "ok",
                                text: `Paid installment #${next.index} on ${l.id}`,
                              });
                              await load();
                              onDone?.();
                            } catch (err) {
                              const msg = err?.message || err?.code || "Payment failed";
                              setError(msg);
                              setToast?.({ tone: "err", text: msg });
                            } finally {
                              setBusy(false);
                            }
                          })();
                        }}
                        className="btn-secondary-sm rounded-md px-2.5 py-1.5 text-xs font-medium"
                      >
                        Pay #{next.index}
                      </button>
                    ) : null}
                    {canSettle ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void settle(l.id)}
                        className="btn-secondary-sm rounded-md px-2.5 py-1.5 text-xs font-medium"
                      >
                        Settle (Lab)
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

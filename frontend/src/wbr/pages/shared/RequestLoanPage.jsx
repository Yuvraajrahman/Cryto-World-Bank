/**
 * Hierarchical loan request — select lender (Local/National/World by role),
 * amount, duration, installment count. Clients never see World.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import StateMessage from "../../components/ui/StateMessage";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { formatUsdc } from "@/lib/formatMoney";

const TIER_LABEL = { LOCAL: "Local banks", NATIONAL: "National banks", WORLD: "World Bank" };

export default function RequestLoanPage({
  title = "Request a loan",
  backTo,
  onDone,
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const role = useSession((s) => s.role);
  const user = useSession((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [lenders, setLenders] = useState(null);
  const [tier, setTier] = useState("");
  const [bankId, setBankId] = useState("");
  const [amount, setAmount] = useState("1000");
  const [termMonths, setTermMonths] = useState("12");
  const [installments, setInstallments] = useState("12");
  const [purpose, setPurpose] = useState("Working capital / liquidity request");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const r = await api.get("/api/loans/lenders");
        setLenders(r);
        const firstTier = r.allowedTiers || [];
        const t = firstTier[0] || "";
        setTier(t);
        const list = r.categories?.[t] || [];
        if (list[0]) setBankId(list[0].id);
      } catch (err) {
        toast.show(err?.message || "Could not load lenders", { variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const banksInTier = useMemo(() => {
    if (!lenders || !tier) return [];
    const raw = lenders.categories?.[tier] || [];
    const q = search.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.jurisdiction?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q),
    );
  }, [lenders, tier, search]);

  const selected = useMemo(
    () => banksInTier.find((b) => b.id === bankId) || (lenders?.categories?.[tier] || []).find((b) => b.id === bankId),
    [banksInTier, lenders, tier, bankId],
  );

  const amountNum = Number(amount) || 0;
  const termNum = Math.max(1, Number(termMonths) || 1);
  const instNum = Math.max(1, Number(installments) || termNum);
  const overPool = selected && amountNum > (selected.availableToLendUsdc ?? selected.reserveUsdc) + 1e-9;

  async function submit() {
    if (!selected || amountNum <= 0 || busy) return;
    if (overPool) {
      toast.show("Amount exceeds lender available pool", { variant: "error" });
      return;
    }
    setBusy(true);
    try {
      if (role === "BORROWER") {
        const r = await api.post("/api/loans", {
          amount: amountNum,
          termMonths: termNum,
          installmentCount: instNum,
          purpose,
          lenderBankId: selected.id,
          loanType: "credit",
          autoActivate: false,
        });
        toast.show(`Request sent to ${selected.name}`, { variant: "success" });
        if (onDone) onDone(r);
        else navigate(`/app?tab=borrow&loan=${encodeURIComponent(r.loan.id)}`);
        return;
      }
      if (role === "LOCAL_BANK_ADMIN" || role === "APPROVER") {
        const r = await api.post("/api/loans/bank-request/local-from-national", {
          amount: amountNum,
          termMonths: termNum,
          installmentCount: instNum,
          purpose,
          lenderBankId: selected.id,
        });
        toast.show("Liquidity request sent to National bank", { variant: "success" });
        if (onDone) onDone(r);
        else navigate("/bank/local?tab=overview");
        return;
      }
      if (role === "NATIONAL_BANK_ADMIN") {
        await api.post("/api/loans/bank-request/national-from-world", {
          amount: amountNum,
          termMonths: termNum,
          installmentCount: instNum,
          purpose,
          lenderBankId: selected.id,
        });
        toast.show("Liquidity request sent to World Bank", { variant: "success" });
        if (onDone) onDone();
        else navigate("/bank/national?tab=overview");
        return;
      }
      toast.show("Your role cannot request loans this way", { variant: "error" });
    } catch (err) {
      toast.show(err?.message || err?.error || "Request failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="client-page">
        <StateMessage title="Loading lenders…" description="Banks and lending pools." />
      </div>
    );
  }

  if (!lenders) {
    return (
      <div className="client-page">
        <StateMessage title="Lenders unavailable" description="Try again from your dashboard." />
      </div>
    );
  }

  const tiers = lenders.allowedTiers || [];

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Loan request</p>
        <h1 className="client-title">{title}</h1>
        <p className="client-lede">{lenders.note}</p>
        {backTo ? (
          <Link to={backTo} className="text-link">
            ← Back
          </Link>
        ) : null}
        {role === "BORROWER" ? (
          <div className="notice" style={{ marginTop: 12 }}>
            Clients request from <strong>Local</strong> or <strong>National</strong> banks only — not
            World Bank.
          </div>
        ) : null}
      </header>

      <Glass className="client-panel" level={2}>
        <div className="fund-type-tabs" role="tablist" style={{ marginBottom: 14 }}>
          {tiers.map((t) => (
            <button
              key={t}
              type="button"
              className={`ops-log-tab${tier === t ? " active" : ""}`}
              onClick={() => {
                setTier(t);
                setSearch("");
                const list = lenders.categories?.[t] || [];
                setBankId(list[0]?.id || "");
              }}
            >
              {TIER_LABEL[t] || t}
            </button>
          ))}
        </div>

        {tier === "LOCAL" || (lenders.categories?.[tier]?.length || 0) > 3 ? (
          <Input
            label="Search banks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, country, city…"
          />
        ) : null}

        <div className="fund-bank-list" style={{ maxHeight: 320, marginTop: 10 }} role="listbox">
          {banksInTier.slice(0, 80).map((b) => (
            <button
              key={b.id}
              type="button"
              className={`fund-bank-row${bankId === b.id ? " selected" : ""}`}
              onClick={() => setBankId(b.id)}
            >
              <span className="fund-bank-name">
                <strong>{b.name}</strong>
                <small>
                  {b.jurisdiction || b.city || b.tier}
                  {b.activeLoanCount != null ? ` · ${b.activeLoanCount} active loans` : ""}
                </small>
              </span>
              <span className="fund-bank-metrics">
                <span>
                  <em>Available</em>
                  <b>{formatUsdc(b.availableToLendUsdc)}</b>
                </span>
                <span>
                  <em>Reserve</em>
                  <b>{formatUsdc(b.reserveUsdc)}</b>
                </span>
                <span>
                  <em>Book</em>
                  <b>{formatUsdc(b.activeLoanValueUsdc)}</b>
                </span>
              </span>
            </button>
          ))}
          {banksInTier.length === 0 ? <p className="client-lede">No banks in this category.</p> : null}
        </div>

        {selected ? (
          <div className="fund-cost" style={{ marginTop: 14 }}>
            <div>
              <span>Lending pool</span>
              <strong>{formatUsdc(selected.availableToLendUsdc)}</strong>
            </div>
            <div>
              <span>Reserve</span>
              <strong>{formatUsdc(selected.reserveUsdc)}</strong>
            </div>
            <div>
              <span>Active book</span>
              <strong>{formatUsdc(selected.activeLoanValueUsdc)}</strong>
            </div>
          </div>
        ) : null}

        <div className="client-grid-2" style={{ marginTop: 16 }}>
          <Input
            label="Amount (USDC)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
          />
          <Input
            label="Duration (months)"
            type="number"
            value={termMonths}
            onChange={(e) => setTermMonths(e.target.value)}
            min={1}
            max={60}
          />
          <Input
            label="Installment count"
            type="number"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            min={1}
            max={60}
          />
          <Input
            label="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        {overPool ? (
          <p className="fund-warn">Amount exceeds this bank’s available lending pool.</p>
        ) : null}

        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy || !selected || amountNum <= 0 || overPool} onClick={() => void submit()}>
            {busy ? "Submitting…" : "Submit loan request"}
          </Button>
          <Badge>
            {user?.role?.replaceAll("_", " ")} · pending approval at lender
          </Badge>
        </div>
      </Glass>
    </div>
  );
}

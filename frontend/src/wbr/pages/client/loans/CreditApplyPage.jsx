import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import StatusStepper from "../../../components/ui/StatusStepper";
import Sheet from "../../../components/ui/Sheet";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { fetchCreditPassport } from "@/lib/phase2";
import { useBorrowingLimits } from "../../../hooks/useLoans";
import {
  formatEth,
  previewSchedule,
  TIER_APR_DISCOUNT_BPS,
  TIER_CAPS_USD,
} from "../../../lib/loanSchedule";

const ETH_USD = 3200; // illustrative for tier USD caps → ETH

/**
 * Route: `/app/loans/apply/credit` — plan D.14
 */
export default function CreditApplyPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSession((s) => s.user);
  const { address } = useAccount();
  const { limits } = useBorrowingLimits();

  const [banks, setBanks] = useState([]);
  const [bankId, setBankId] = useState("");
  const [amount, setAmount] = useState("0.5");
  const [termMonths, setTermMonths] = useState(6);
  const [purpose, setPurpose] = useState("Uncollateralized working capital");
  const [passport, setPassport] = useState(null);
  const [txState, setTxState] = useState("idle");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const kycPending =
    user?.kyc1Status === "PENDING" || user?.kyc1Status === "NOT_STARTED";

  useEffect(() => {
    void api.get("/api/banks").then((r) => {
      setBanks(r.localBanks || []);
      if (r.localBanks?.[0]) setBankId(r.localBanks[0].id);
    });
  }, []);

  useEffect(() => {
    if (!address) {
      setPassport({ riskTier: "BRONZE", creditScore: 320, available: false });
      return;
    }
    void fetchCreditPassport(address)
      .then((p) => setPassport(p || { riskTier: "BRONZE", creditScore: 320 }))
      .catch(() => setPassport({ riskTier: "BRONZE", creditScore: 320 }));
  }, [address]);

  const tier = (passport?.riskTierName || passport?.riskTier || "BRONZE")
    .toString()
    .toUpperCase();
  const tierKey = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"].includes(tier)
    ? tier
    : "BRONZE";
  const tierCapUsd = TIER_CAPS_USD[tierKey] ?? TIER_CAPS_USD.BRONZE;
  const tierCapEth = tierCapUsd / ETH_USD;
  const eligible = true;
  const discount = TIER_APR_DISCOUNT_BPS[tierKey] ?? 0;
  const selectedBank = banks.find((b) => b.id === bankId);
  const aprBps = Math.max(300, (selectedBank?.aprBps ?? 800) - discount);
  const remaining = limits?.sixMonth?.remaining ?? Infinity;
  const maxAmount = Math.min(tierCapEth, remaining);

  const schedule = useMemo(
    () => previewSchedule({ principal: Number(amount) || 0, termMonths, aprBps }),
    [amount, termMonths, aprBps],
  );

  const errors = [];
  if (!eligible) errors.push("Credit Passport tier too low for uncollateralized loans");
  if ((Number(amount) || 0) > maxAmount + 1e-9) {
    errors.push(`Exceeds tier/limit cap (${formatEth(maxAmount)})`);
  }
  if (kycPending) errors.push("KYC Level 1 required");

  async function onSubmit(e) {
    e.preventDefault();
    if (errors.length || busy) return;
    setTxState("idle");
    setConfirmOpen(true);
  }

  async function onConfirm() {
    if (errors.length || busy) return;
    setBusy(true);
    setTxState("signing");
    try {
      await new Promise((r) => setTimeout(r, 280));
      setTxState("pending");
      const r = await api.post("/api/loans", {
        amount: Number(amount),
        termMonths: Number(termMonths),
        purpose,
        localBankId: bankId,
        loanType: "credit",
        category: "Credit",
        autoActivate: true,
      });
      setTxState("success");
      toast.show("Credit loan submitted", { variant: "success" });
      setConfirmOpen(false);
      navigate(`/app/loans/${r.loan.id}`);
    } catch (err) {
      setTxState("error");
      const code = err?.code || "";
      toast.show(
        code === "exceeds_six_month_limit"
          ? "Six-month borrowing limit reached — see Limits"
          : err.message || err.code || "Submit failed",
        { variant: "error" },
      );
    } finally {
      setBusy(false);
    }
  }

  if (passport && tierKey === "BRONZE" && tierCapUsd <= 50 && (Number(amount) || 0) > tierCapEth) {
    /* validation via errors */
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Credit loan</p>
        <h1 className="client-title">Borrow against your passport</h1>
        <p className="client-lede">
          Tier <strong>{tierKey}</strong>
          {passport?.creditScore != null ? ` · score ${passport.creditScore}` : ""} · max
          uncollateralized ~{formatEth(tierCapEth)} (illustrative ${tierCapUsd.toLocaleString()}{" "}
          cap).
        </p>
        <div className="client-hero-badges">
          <Badge icon="passport">{tierKey}</Badge>
          <Badge>APR discount {(discount / 100).toFixed(2)}%</Badge>
        </div>
        <Link to="/app/passport" className="text-link">
          View Credit Passport →
        </Link>
      </header>

      {tierKey === "BRONZE" && tierCapUsd <= 50 ? (
        <div className="notice warn">
          Bronze caps are small. For larger amounts, use the{" "}
          <Link to="/app/loans/apply/collateral">collateral path</Link> while you build score.
        </div>
      ) : null}

      {!eligible ? (
        <Glass className="client-panel">
          <p className="client-lede">
            Your tier does not qualify for credit-based loans yet. Switch to collateral-backed
            lending instead.
          </p>
          <Button as={Link} to="/app/loans/apply/collateral">
            Apply with collateral
          </Button>
        </Glass>
      ) : (
        <form className="settings-stack" onSubmit={onSubmit}>
          <Glass className="client-panel">
            <div className="settings-fields">
              <Input
                label="Loan amount (ETH)"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                hint={`Max ${formatEth(maxAmount)}`}
              />
              <Input
                label="Term (months)"
                type="number"
                min="1"
                max="60"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value) || 1)}
              />
              <Input
                label="Local bank"
                as="select"
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Input>
            </div>
            <Input label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            <p className="client-lede" style={{ margin: 0 }}>
              Indicative APR {(aprBps / 100).toFixed(2)}% · monthly {formatEth(schedule.monthly)} ·
              total {formatEth(schedule.total)}
            </p>
          </Glass>

          <Glass className="client-panel">
            <p className="eyebrow">Schedule preview</p>
            <div className="schedule-table-wrap">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Due</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.rows.map((row) => (
                    <tr key={row.index}>
                      <td>{row.index}</td>
                      <td>{new Date(row.dueDate).toLocaleDateString()}</td>
                      <td>{formatEth(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Glass>

          {errors.length ? (
            <div className="notice warn">
              {errors.map((e) => (
                <div key={e}>{e}</div>
              ))}
              {errors.some((e) => /limit|cap/i.test(e)) ? (
                <div>
                  <Link to="/app/loans/limits">Open borrowing limits →</Link>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="onboard-actions">
            <Button type="submit" block disabled={busy || errors.length > 0} showArrow={false}>
              Review &amp; submit
            </Button>
            <Button as={Link} to="/app/loans/apply" variant="ghost" showArrow={false} block>
              Back
            </Button>
          </div>
        </form>
      )}

      <Sheet
        open={confirmOpen}
        onClose={() => (!busy ? setConfirmOpen(false) : null)}
        title="Confirm credit loan"
      >
        <p className="client-lede">
          Borrow {formatEth(Number(amount))} uncollateralized ({tierKey}) for {termMonths} months at
          ~{(aprBps / 100).toFixed(2)}% APR.
        </p>
        <StatusStepper state={txState} errorStep="pending" />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void onConfirm()}>
            {busy ? "Submitting…" : "Confirm"}
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

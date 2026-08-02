import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import StatusStepper from "../../../components/ui/StatusStepper";
import Sheet from "../../../components/ui/Sheet";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { useBorrowingLimits } from "../../../hooks/useLoans";
import {
  formatEth,
  illustrativeUtilization,
  maxBorrowFromLtv,
  previewSchedule,
  rateAtUtilization,
} from "../../../lib/loanSchedule";

const LTV_BPS = 5000;

/**
 * Route: `/app/loans/apply/collateral` — plan D.13
 */
export default function CollateralApplyPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSession((s) => s.user);
  const { address } = useAccount();
  const ethBal = useBalance({ address });
  const { limits } = useBorrowingLimits();

  const [banks, setBanks] = useState([]);
  const [bankId, setBankId] = useState("");
  const [collateral, setCollateral] = useState("2");
  const [amount, setAmount] = useState("0.8");
  const [termMonths, setTermMonths] = useState(12);
  const [purpose, setPurpose] = useState("Working capital backed by ETH collateral");
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

  const selectedBank = banks.find((b) => b.id === bankId);
  const walletEth = ethBal.data ? Number(formatEther(ethBal.data.value)) : 0;
  const coll = Number(collateral) || 0;
  const maxLtv = maxBorrowFromLtv(coll, LTV_BPS);
  const util = illustrativeUtilization(selectedBank?.totalLent, selectedBank?.reserve);
  const aprBps = rateAtUtilization(util, selectedBank?.aprBps ?? 800);
  const schedule = useMemo(
    () => previewSchedule({ principal: Number(amount) || 0, termMonths, aprBps }),
    [amount, termMonths, aprBps],
  );

  const remaining = limits?.sixMonth?.remaining ?? Infinity;
  const errors = [];
  if (coll > walletEth + 1e-6 && ethBal.data) errors.push("Collateral exceeds wallet balance");
  if ((Number(amount) || 0) > maxLtv + 1e-9) errors.push(`Exceeds LTV max (${formatEth(maxLtv)})`);
  if ((Number(amount) || 0) > remaining) errors.push("Exceeds six-month borrowing limit");
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
        loanType: "collateral",
        collateralEth: coll,
        ltvBps: LTV_BPS,
        category: "Collateral",
        autoActivate: true,
      });
      setTxState("success");
      toast.show("Collateral loan submitted", { variant: "success" });
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

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Collateral loan</p>
        <h1 className="client-title">Back your borrow with ETH</h1>
        <p className="client-lede">
          LTV {LTV_BPS / 100}% · pool utilization {(util * 100).toFixed(0)}% (kink at 80%) · wallet{" "}
          {ethBal.data ? formatEth(walletEth) : "—"}.
        </p>
        <Badge icon="wallet">Max borrow {formatEth(maxLtv)}</Badge>
      </header>

      <form className="settings-stack" onSubmit={onSubmit}>
        <Glass className="client-panel">
          <div className="settings-fields">
            <Input
              label="Collateral (ETH)"
              type="number"
              step="0.01"
              min="0"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
            />
            <Input
              label="Loan amount (ETH)"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              hint={`Cap ${formatEth(Math.min(maxLtv, remaining))}`}
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
          <Input
            label="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
          <div className="ltv-meter" aria-hidden>
            <div
              className="ltv-meter-fill"
              style={{
                width: `${Math.min(100, maxLtv > 0 ? ((Number(amount) || 0) / maxLtv) * 100 : 0)}%`,
              }}
            />
          </div>
          <p className="client-lede" style={{ margin: 0 }}>
            Indicative APR {(aprBps / 100).toFixed(2)}% · monthly {formatEth(schedule.monthly)} ·
            total repay {formatEth(schedule.total)}
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
                {schedule.rows.slice(0, 6).map((row) => (
                  <tr key={row.index}>
                    <td>{row.index}</td>
                    <td>{new Date(row.dueDate).toLocaleDateString()}</td>
                    <td>{formatEth(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {schedule.rows.length > 6 ? (
              <p className="client-lede">…and {schedule.rows.length - 6} more periods</p>
            ) : null}
          </div>
        </Glass>

        {errors.length ? (
          <div className="notice warn">
            {errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
            {errors.some((e) => /six-month|limit/i.test(e)) ? (
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

      <Sheet
        open={confirmOpen}
        onClose={() => (!busy ? setConfirmOpen(false) : null)}
        title="Confirm collateral loan"
      >
        <p className="client-lede">
          Borrow {formatEth(Number(amount))} against {formatEth(coll)} ETH collateral for{" "}
          {termMonths} months at ~{(aprBps / 100).toFixed(2)}% APR via{" "}
          {selectedBank?.name || "local bank"}.
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

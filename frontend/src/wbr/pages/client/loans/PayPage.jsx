import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import StatusStepper from "../../../components/ui/StatusStepper";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { useLoan } from "../../../hooks/useLoans";
import { formatEth } from "../../../lib/loanSchedule";

/**
 * Route: `/app/loans/:loanId/pay` — plan D.17
 */
export default function PayPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { address } = useAccount();
  const ethBal = useBalance({ address });
  const { loan, loading, error, refresh } = useLoan(loanId);
  const [txState, setTxState] = useState("idle");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const next = useMemo(
    () => (loan?.installments || []).find((i) => !i.paid),
    [loan],
  );

  const walletEth = ethBal.data ? Number(formatEther(ethBal.data.value)) : 0;
  const overdue = next ? new Date(next.dueDate).getTime() < Date.now() : false;
  const lateFee = overdue ? Number((next.amount * 0.02).toFixed(6)) : 0;
  const dueTotal = next ? next.amount + lateFee : 0;
  const remainingAfter = loan
    ? (loan.installments || []).filter((i) => !i.paid && i.index !== next?.index).reduce((a, i) => a + i.amount, 0)
    : 0;
  const insufficient = ethBal.data && dueTotal > walletEth + 1e-9;

  async function onPay() {
    if (!next || busy || insufficient) return;
    setTxState("idle");
    setConfirmOpen(true);
  }

  async function onConfirmPay() {
    if (!next || busy || insufficient) return;
    setBusy(true);
    setTxState("signing");
    try {
      await new Promise((r) => setTimeout(r, 280));
      setTxState("pending");
      await api.post(`/api/loans/${loanId}/installments/${next.index}/pay`);
      setTxState("success");
      toast.show("Installment paid", { variant: "success" });
      setConfirmOpen(false);
      await refresh();
      navigate(`/app/loans/${loanId}`);
    } catch (err) {
      setTxState("error");
      toast.show(err.message || "Payment failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !loan) {
    return (
      <div className="client-page">
        <StateMessage variant="empty" title="Loading…" description="Preparing payment." />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="client-page">
        <StateMessage title="Loan unavailable" description={error?.message} />
      </div>
    );
  }

  if (!next) {
    return (
      <div className="client-page">
        <StateMessage
          variant="empty"
          title="Nothing due"
          description="All installments are paid, or this loan has no schedule."
          action={{ label: "Back to loan", onClick: () => navigate(`/app/loans/${loanId}`) }}
        />
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Payment</p>
        <h1 className="client-title">Pay installment #{next.index}</h1>
        <p className="client-lede">
          Exact amount due. Partial payments are not enabled on this facility.
        </p>
      </header>

      {overdue ? (
        <div className="notice warn">
          This installment is overdue. A 2% late fee ({formatEth(lateFee)}) is shown for
          transparency; paying late may affect your Credit Passport score.
        </div>
      ) : null}

      <Glass className="client-panel">
        <ul className="terms-list">
          <li>
            <span>Amount due</span>
            <strong>{formatEth(next.amount)}</strong>
          </li>
          {lateFee > 0 ? (
            <li>
              <span>Late fee (illustrative)</span>
              <strong>{formatEth(lateFee)}</strong>
            </li>
          ) : null}
          <li>
            <span>Due date</span>
            <strong>{new Date(next.dueDate).toLocaleDateString()}</strong>
          </li>
          <li>
            <span>Remaining after</span>
            <strong>{formatEth(remainingAfter)}</strong>
          </li>
          <li>
            <span>Wallet ETH</span>
            <strong>{ethBal.data ? formatEth(walletEth) : "—"}</strong>
          </li>
        </ul>
        <p className="client-lede">Payment method: connected wallet (native ETH / stablecoin path).</p>
      </Glass>

      {insufficient ? (
        <div className="notice warn">
          Insufficient wallet balance for {formatEth(dueTotal)}.{" "}
          <Link to="/app/account/checking">Add funds via checking</Link>, then retry.
        </div>
      ) : null}

      <div className="onboard-actions">
        <Button type="button" block disabled={busy || insufficient} showArrow={false} onClick={onPay}>
          Review payment
        </Button>
        <Button as={Link} to={`/app/loans/${loanId}`} variant="ghost" showArrow={false} block>
          Cancel
        </Button>
      </div>

      <Sheet
        open={confirmOpen}
        onClose={() => (!busy ? setConfirmOpen(false) : null)}
        title="Confirm installment payment"
      >
        <p className="client-lede">
          Pay installment #{next.index} · {formatEth(next.amount)}
          {lateFee > 0 ? ` (+ ${formatEth(lateFee)} late fee note)` : ""}.
        </p>
        <StatusStepper state={txState} errorStep="pending" />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void onConfirmPay()}>
            {busy ? "Confirming…" : `Pay ${formatEth(next.amount)}`}
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

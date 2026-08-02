import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import Sheet from "../../../components/ui/Sheet";
import StatusStepper from "../../../components/ui/StatusStepper";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { useGroup, kyc2ApplyBlocked, kyc2SoftWarning } from "../../../hooks/useGroups";
import EligibilityChecklist, {
  Kyc2GateBanner,
} from "../../../components/groups/EligibilityChecklist";

/**
 * Route: `/app/groups/:groupId/apply`
 */
export default function GroupApplyPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSession((s) => s.user);
  const { group, loading, refresh } = useGroup(groupId);

  const [amount, setAmount] = useState("1.5");
  const [termMonths, setTermMonths] = useState(6);
  const [purpose, setPurpose] = useState("Shared working capital for the circle");
  const [busy, setBusy] = useState(false);
  const [txState, setTxState] = useState("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  const blockApply = kyc2ApplyBlocked(user);
  const showKycWarn = kyc2SoftWarning(user);

  const memberCount = group?.members?.length || 0;
  const shareHint = useMemo(() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || memberCount < 1) return null;
    return n / memberCount;
  }, [amount, memberCount]);

  async function onSubmit(e) {
    e.preventDefault();
    if (busy || blockApply) return;
    setTxState("idle");
    setConfirmOpen(true);
  }

  async function onConfirm() {
    if (busy || blockApply) return;
    setBusy(true);
    setTxState("signing");
    try {
      await new Promise((r) => setTimeout(r, 250));
      setTxState("pending");
      const r = await api.post(`/api/groups/${groupId}/apply`, {
        totalAmountEth: Number(amount),
        termMonths: Number(termMonths),
        purpose: purpose.trim(),
      });
      setTxState("success");
      toast.show(
        r.request?.status === "ACTIVE" ? "Group loan activated" : "Submitted — awaiting consent",
        { variant: "success" },
      );
      setConfirmOpen(false);
      navigate(`/app/groups/${groupId}/consent?requestId=${r.request.id}`);
    } catch (err) {
      setTxState("error");
      const details = err?.details;
      if (details?.eligibility) setPreview(details.eligibility);
      toast.show(
        err?.code === "eligibility_failed" ? "Eligibility checks failed" : err?.message || "Apply failed",
        { variant: "error" },
      );
      void refresh();
    } finally {
      setBusy(false);
    }
  }

  if (loading || !group) {
    return (
      <div className="client-page">
        <StateMessage variant="empty" title="Loading" description="Preparing apply form…" />
      </div>
    );
  }

  const eligibility = preview || group.eligibility;

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Group loan</p>
        <h1 className="client-title">Apply as a circle</h1>
        <p className="client-lede">
          Total amount is split across {memberCount} members for DTI. All members must consent
          before activation.
        </p>
        <Link to={`/app/groups/${groupId}`} className="text-link">
          ← {group.name}
        </Link>
      </header>

      {showKycWarn ? <Kyc2GateBanner user={user} blockApply={blockApply} /> : null}

      <Glass className="client-panel">
        <p className="eyebrow">Mutual liability</p>
        <p className="client-lede" style={{ margin: 0 }}>
          Every member is jointly liable for the group loan. A missed installment can affect the
          circle&apos;s standing and each member&apos;s share exposure.
        </p>
      </Glass>

      <div className="client-grid-2">
        <Glass className="client-panel">
          <form className="stack-form" onSubmit={onSubmit}>
            <Input
              label="Total amount (ETH)"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {shareHint != null ? (
              <p className="client-lede">≈ {shareHint.toFixed(4)} ETH per member</p>
            ) : null}
            <label className="field">
              <span className="field-label">Term (months)</span>
              <select
                className="field-input"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
              >
                {[3, 6, 9, 12, 18, 24].map((m) => (
                  <option key={m} value={m}>
                    {m} months
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
            <Button type="submit" disabled={busy || blockApply} block>
              Review application
            </Button>
          </form>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Members</p>
          <ul className="member-roster">
            {(group.members || []).map((m) => (
              <li key={m.id}>
                <div>
                  <strong>{m.displayName || m.userId}</strong>
                  <span className="member-meta">{m.role}</span>
                </div>
                <Badge>in circle</Badge>
              </li>
            ))}
          </ul>
          <p className="eyebrow" style={{ marginTop: 16 }}>
            Risk checks
          </p>
          <EligibilityChecklist eligibility={eligibility} />
        </Glass>
      </div>

      <Sheet
        open={confirmOpen}
        onClose={() => (!busy ? setConfirmOpen(false) : null)}
        title="Confirm group loan application"
      >
        <p className="client-lede">
          Request {Number(amount).toFixed(4)} ETH over {termMonths} months. Every member must
          consent before activation — mutual liability applies.
        </p>
        <StatusStepper state={txState} errorStep="pending" />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void onConfirm()}>
            {busy ? "Submitting…" : "Submit for consent"}
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

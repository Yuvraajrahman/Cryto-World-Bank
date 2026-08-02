import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAccount, useSignMessage } from "wagmi";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Sheet from "../../../components/ui/Sheet";
import StatusStepper from "../../../components/ui/StatusStepper";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { useGroup, useGroupRequest } from "../../../hooks/useGroups";
import EligibilityChecklist from "../../../components/groups/EligibilityChecklist";

/**
 * Route: `/app/groups/:groupId/consent?requestId=`
 */
export default function GroupConsentPage() {
  const { groupId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { group, refresh: refreshGroup } = useGroup(groupId);

  const requestId = useMemo(() => {
    const q = params.get("requestId");
    if (q) return q;
    const pending = group?.requests?.find((r) => r.status === "AWAITING_CONSENT");
    return pending?.id || null;
  }, [params, group]);

  const { data, loading, refresh } = useGroupRequest(groupId, requestId);
  const [busy, setBusy] = useState(false);
  const [txState, setTxState] = useState("idle");
  const [sheet, setSheet] = useState(null); // 'consent' | 'decline' | null

  const request = data?.request;
  const myConsent = data?.myConsent;
  const already = Boolean(myConsent?.consentedAt);
  const declined = Boolean(myConsent?.declinedAt);

  async function onConsent() {
    if (!requestId || busy || already || declined) return;
    setBusy(true);
    setTxState("signing");
    try {
      let signature;
      if (address && signMessageAsync) {
        try {
          const msg = `WBR group loan consent\ngroup:${groupId}\nrequest:${requestId}\namount:${request?.totalAmountEth}\nwallet:${address.toLowerCase()}`;
          signature = await signMessageAsync({ message: msg });
        } catch {
          toast.show("Signature skipped — recording DB consent only", { variant: "pending" });
        }
      }
      setTxState("pending");
      const r = await api.post(`/api/groups/${groupId}/requests/${requestId}/consent`, {
        signature,
      });
      setTxState("success");
      toast.show(
        r.request?.status === "ACTIVE" ? "All members consented — loan active" : "Consent recorded",
        { variant: "success" },
      );
      setSheet(null);
      await refresh();
      await refreshGroup();
      if (r.request?.status === "ACTIVE") navigate(`/app/groups/${groupId}`);
    } catch (err) {
      setTxState("error");
      toast.show(err?.message || "Consent failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onDecline() {
    if (!requestId || busy || already) return;
    setBusy(true);
    setTxState("pending");
    try {
      await api.post(`/api/groups/${groupId}/requests/${requestId}/decline`, {});
      setTxState("success");
      toast.show("Request cancelled", { variant: "success" });
      setSheet(null);
      navigate(`/app/groups/${groupId}`);
    } catch (err) {
      setTxState("error");
      toast.show(err?.message || "Decline failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (!requestId) {
    return (
      <div className="client-page">
        <StateMessage
          variant="empty"
          title="No pending request"
          description="There is no group loan awaiting consent."
          action={{ label: "Back", onClick: () => navigate(`/app/groups/${groupId}`) }}
        />
      </div>
    );
  }

  if (loading && !request) {
    return (
      <div className="client-page">
        <StateMessage variant="empty" title="Loading consent" description="Fetching checklist…" />
      </div>
    );
  }

  const consents = request?.consents || [];
  const done = consents.filter((c) => c.consentedAt).length;
  const share =
    request && consents.length
      ? request.totalAmountEth / Math.max(consents.length, 1)
      : null;

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">
          Consent · {done}/{consents.length}
        </p>
        <h1 className="client-title">Approve the group loan</h1>
        <p className="client-lede">
          Off-chain unanimous consent is recorded in our database
          {address ? ", with an optional wallet signature" : ""}. On-chain{" "}
          <code className="mono">recordConsent</code> is for GroupLendingPool activation only.
        </p>
        <Link to={`/app/groups/${groupId}`} className="text-link">
          ← Group dashboard
        </Link>
      </header>

      <Glass className="client-panel">
        <p className="eyebrow">Request</p>
        <h2 className="client-panel-title">
          {request?.totalAmountEth} ETH · {request?.termMonths} mo
        </h2>
        <p className="client-lede">{request?.purpose}</p>
        {share != null ? (
          <p className="client-lede">Your share ≈ {share.toFixed(4)} ETH · mutual liability applies</p>
        ) : null}
        <Badge>{request?.status}</Badge>
      </Glass>

      <Glass className="client-panel">
        <div className="client-section-head">
          <h2 className="client-section-title">
            Consents {done}/{consents.length}
          </h2>
        </div>
        <ul className="consent-checklist">
          {consents.map((c) => (
            <li
              key={c.id}
              className={c.declinedAt ? "pending" : c.consentedAt ? "done" : "pending"}
            >
              <span>
                {c.displayName || c.userId}
                {c.signature ? " · signed" : ""}
              </span>
              <Badge>
                {c.declinedAt ? "declined" : c.consentedAt ? "consented" : "waiting"}
              </Badge>
            </li>
          ))}
        </ul>

        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button
            type="button"
            onClick={() => {
              setTxState("idle");
              setSheet("consent");
            }}
            disabled={busy || already || declined}
          >
            {already ? "You already consented" : "Review & consent"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            onClick={() => {
              setTxState("idle");
              setSheet("decline");
            }}
            disabled={busy || already || declined || request?.status !== "AWAITING_CONSENT"}
          >
            Decline (cancel request)
          </Button>
        </div>
      </Glass>

      {data?.eligibility ? (
        <Glass className="client-panel">
          <p className="eyebrow">Eligibility snapshot</p>
          <EligibilityChecklist eligibility={data.eligibility} dense />
        </Glass>
      ) : null}

      <Sheet
        open={sheet === "consent"}
        onClose={() => (!busy ? setSheet(null) : null)}
        title="Confirm consent"
      >
        <p className="client-lede">
          You accept mutual liability for {request?.totalAmountEth} ETH
          {share != null ? ` (your share ≈ ${share.toFixed(4)} ETH)` : ""}. Wallet signature is
          optional.
        </p>
        <StatusStepper state={txState} errorStep="signing" />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void onConsent()}>
            {busy ? "Recording…" : "Sign & consent"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            disabled={busy}
            onClick={() => setSheet(null)}
          >
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={sheet === "decline"}
        onClose={() => (!busy ? setSheet(null) : null)}
        title="Decline group loan"
      >
        <div className="notice warn" role="alert">
          Declining cancels this request for the whole circle. Members can apply again later.
        </div>
        <StatusStepper state={txState} errorStep="pending" />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void onDecline()}>
            {busy ? "Cancelling…" : "Confirm decline"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            disabled={busy}
            onClick={() => setSheet(null)}
          >
            Keep waiting
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

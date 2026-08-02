import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import OnboardingShell from "../../components/layout/OnboardingShell";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { useOnboardingStore } from "../../hooks/onboardingStore";
import { useSession } from "@/lib/store";

/**
 * Route: `/onboarding/consent` — plan B.8
 */
export default function ConsentPage() {
  const registrationDone = useOnboardingStore((s) => s.registration.done);
  const kyc1 = useOnboardingStore((s) => s.kyc1);
  if (!registrationDone) return <Navigate to="/onboarding/register" replace />;
  if (kyc1.status === "not_started") return <Navigate to="/onboarding/kyc-1" replace />;

  return (
    <OnboardingShell step={4} backTo="/onboarding/kyc-2">
      <ConsentForm />
    </OnboardingShell>
  );
}

function ConsentForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const consent = useOnboardingStore((s) => s.consent);
  const setConsent = useOnboardingStore((s) => s.setConsent);
  const completeConsent = useOnboardingStore((s) => s.completeConsent);
  const consentRemote = useOnboardingStore((s) => s.consentRemote);
  const token = useSession((s) => s.token);

  const scrollRef = useRef(null);
  const [scrolledEnd, setScrolledEnd] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 12;
      if (atEnd) setScrolledEnd(true);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const allChecked = consent.risk && consent.data && consent.agent;
  const canSubmit = scrolledEnd && allChecked;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      if (token) {
        await consentRemote({ risk: true, data: true, agent: true });
      } else {
        await new Promise((r) => setTimeout(r, 300));
        completeConsent();
      }
      toast.show("Consents recorded", { variant: "success" });
      navigate("/onboarding/complete");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Consent failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="onboard-card-wrap" onSubmit={onSubmit}>
      <Glass className="onboard-card">
        <p className="eyebrow">Disclosures</p>
        <h1 className="onboard-title">Risk, data &amp; agent terms</h1>
        <p className="onboard-lede">
          Read the disclosures fully, then confirm each acknowledgment. Continue stays disabled
          until you scroll to the end and check every box.
        </p>

        <div
          className="disclosure-scroll"
          ref={scrollRef}
          tabIndex={0}
          role="region"
          aria-label="Risk and data disclosures"
        >
          <h3>Lending &amp; liquidation risk</h3>
          <p>
            Collateralized loans can be liquidated when the health factor falls below the protocol
            threshold. Understand Loan-to-Value (LTV) and health-factor mechanics before borrowing.
            On default, your Credit Passport (SBT) score may be downgraded, reducing future limits
            and interest modifiers.
          </p>
          <h3>Data usage &amp; privacy</h3>
          <p>
            On-chain: wallet address, role assignments, loan state, reserve balances, and document
            hashes. Off-chain: KYC images, chat transcripts, and detailed ML features. Access is
            limited to Local Bank Approvers, National/World Bank admins, and regulators (read-only
            audit portal).
          </p>
          <h3>AI banking agent</h3>
          <p>
            The conversational agent can propose write actions (loan application, repayment) but
            never executes them without your explicit Approve confirmation in the UI. You can cancel
            any proposed action.
          </p>
          <h3>Testnet notice</h3>
          <p>
            WorldBankReserve on Sepolia / Hardhat is a research and demonstration deployment. It is
            not a licensed depository institution. Do not send mainnet funds you cannot afford to
            lose.
          </p>
          {!scrolledEnd ? (
            <p className="disclosure-hint">Scroll to the end to enable acknowledgments →</p>
          ) : null}
        </div>

        <label className={`check-row${!scrolledEnd ? " disabled" : ""}`}>
          <input
            type="checkbox"
            disabled={!scrolledEnd}
            checked={consent.risk}
            onChange={(e) => setConsent({ risk: e.target.checked })}
          />
          <span>I understand lending, liquidation, and SBT downgrade risks.</span>
        </label>
        <label className={`check-row${!scrolledEnd ? " disabled" : ""}`}>
          <input
            type="checkbox"
            disabled={!scrolledEnd}
            checked={consent.data}
            onChange={(e) => setConsent({ data: e.target.checked })}
          />
          <span>I consent to the data usage and privacy disclosure above.</span>
        </label>
        <label className={`check-row${!scrolledEnd ? " disabled" : ""}`}>
          <input
            type="checkbox"
            disabled={!scrolledEnd}
            checked={consent.agent}
            onChange={(e) => setConsent({ agent: e.target.checked })}
          />
          <span>I agree agent write actions always require my confirmation.</span>
        </label>

        <div className="onboard-actions">
          <Button variant="primary" block type="submit" disabled={!canSubmit || busy}>
            {busy ? "Saving…" : "Accept & continue"}
          </Button>
        </div>
      </Glass>
    </form>
  );
}

import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import OnboardingShell from "../../components/layout/OnboardingShell";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/ui/Icon";
import { useOnboardingStore } from "../../hooks/onboardingStore";
import { useSession } from "@/lib/store";

function CompleteContent() {
  const registration = useOnboardingStore((s) => s.registration);
  const kyc1 = useOnboardingStore((s) => s.kyc1);
  const kyc2 = useOnboardingStore((s) => s.kyc2);
  const consent = useOnboardingStore((s) => s.consent);
  const markComplete = useOnboardingStore((s) => s.markComplete);
  const completeRemote = useOnboardingStore((s) => s.completeRemote);
  const token = useSession((s) => s.token);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (token) await completeRemote();
        else if (!cancelled) markComplete();
      } catch {
        if (!cancelled) markComplete();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [markComplete, completeRemote, token]);

  const kycPending = kyc1.status === "pending" || kyc1.status === "not_started";
  const showKyc2Cta = kyc2.skipped || kyc2.status === "not_started";

  return (
    <div className="onboard-card-wrap">
      <Glass className="onboard-card onboard-success">
        <div className="success-mark" aria-hidden>
          <Icon name="check" size={28} />
        </div>
        <p className="eyebrow center">Welcome</p>
        <h1 className="onboard-title" style={{ textAlign: "center" }}>
          You&apos;re in, {registration.fullName.split(" ")[0] || "client"}.
        </h1>
        <p
          className="onboard-lede"
          style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}
        >
          Starting Credit Passport: <strong>Bronze</strong> · illustrative max uncollateralized loan{" "}
          <strong>$50</strong>. Build score with on-time repayments.
        </p>

        {kycPending ? (
          <div className="notice warn">
            KYC Level 1 is still <strong>pending</strong>. You can explore the dashboard, but loan
            applications stay locked until a Local Bank Approver clears your documents.
          </div>
        ) : null}

        <ul className="checklist">
          <li className="done">
            <Icon name="check" size={14} /> Registration
          </li>
          <li className={kyc1.status === "not_started" ? "" : "done"}>
            <Icon name={kyc1.status === "not_started" ? "clock" : "check"} size={14} /> KYC Level 1{" "}
            <Badge>{kyc1.status}</Badge>
          </li>
          <li className={kyc2.status !== "not_started" || kyc2.skipped ? "done" : ""}>
            <Icon name="check" size={14} /> KYC Level 2{" "}
            <Badge>{kyc2.skipped ? "skipped" : kyc2.status}</Badge>
          </li>
          <li className="done">
            <Icon name="check" size={14} /> Consent recorded
            {consent.consentedAt ? (
              <span className="tier-row-meta" style={{ marginLeft: 8 }}>
                {new Date(consent.consentedAt).toLocaleString()}
              </span>
            ) : null}
          </li>
        </ul>

        <p className="eyebrow" style={{ marginTop: 8 }}>
          Quick start
        </p>
        <div className="quick-grid">
          <Link to="/app/loans/apply" className="quick-card glass glass-interactive">
            <Icon name="loan" size={20} />
            <strong>Apply for a loan</strong>
            <span>Collateral or credit path</span>
          </Link>
          <Link to="/app/dashboard" className="quick-card glass glass-interactive">
            <Icon name="savings" size={20} />
            <strong>Explore savings</strong>
            <span>Vaults &amp; deposits</span>
          </Link>
          <Link to="/app/assistant" className="quick-card glass glass-interactive">
            <Icon name="agent" size={20} />
            <strong>Try the AI agent</strong>
            <span>Ask about balances &amp; policy</span>
          </Link>
        </div>

        <div className="onboard-actions">
          <Button as={Link} to="/app/dashboard" variant="primary" block>
            Go to Dashboard
          </Button>
          {showKyc2Cta ? (
            <Button as={Link} to="/onboarding/kyc-2" variant="ghost" block showArrow={false}>
              Upgrade to KYC Level 2 now
            </Button>
          ) : null}
        </div>
      </Glass>
    </div>
  );
}

/**
 * Route: `/onboarding/complete` — plan B.9
 */
export default function CompletePage() {
  const registrationDone = useOnboardingStore((s) => s.registration.done);
  const consentDone = useOnboardingStore((s) => s.consent.done);

  if (!registrationDone) return <Navigate to="/onboarding/register" replace />;
  if (!consentDone) return <Navigate to="/onboarding/consent" replace />;

  return (
    <OnboardingShell step={5} backTo="/onboarding/consent">
      <CompleteContent />
    </OnboardingShell>
  );
}

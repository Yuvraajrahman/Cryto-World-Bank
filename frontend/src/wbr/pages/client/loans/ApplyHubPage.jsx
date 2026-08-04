import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import Badge from "../../../components/ui/Badge";
import { useSession } from "@/lib/store";

/**
 * Route: `/app/loans/apply` — choose collateral vs credit path
 */
export default function ApplyHubPage() {
  const user = useSession((s) => s.user);
  const kycPending =
    user?.kyc1Status === "PENDING" ||
    user?.kyc1Status === "NOT_STARTED" ||
    (!user?.onboardingComplete && user?.isFirstTime);

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">New loan</p>
        <h1 className="client-title">How do you want to borrow?</h1>
        <p className="client-lede">
          Collateral-backed loans are the lower-friction path. Credit-based loans need a qualifying
          Credit Passport tier — no collateral required.
        </p>
        <Link to="/app/loans/limits" className="text-link">
          Check borrowing limits →
        </Link>
      </header>

      {kycPending ? (
        <div className="notice warn">
          KYC Level 1 is still pending. You can review the forms, but submission stays locked until
          verification clears. <Link to="/app/settings">View KYC status</Link>
        </div>
      ) : null}

      <div className="quick-grid" style={{ gridTemplateColumns: "1fr" }}>
        <Glass className="client-panel loan-choice">
          <Badge icon="loan">Bank select</Badge>
          <h2 className="client-panel-title">Request from Local or National</h2>
          <p className="client-lede">
            Choose a lending bank (not World), set amount, duration, and installment count. The
            bank approves; reserve is debited when funded.
          </p>
          <Button as={Link} to="/app/loans/request" disabled={kycPending}>
            Request a loan
          </Button>
        </Glass>

        <Glass className="client-panel loan-choice">
          <Badge icon="wallet">Collateral</Badge>
          <h2 className="client-panel-title">Collateral-based</h2>
          <p className="client-lede">
            Lock ETH as collateral. Max borrow follows LTV (default 50%). Best for new borrowers
            below SBT credit thresholds.
          </p>
          <Button as={Link} to="/app/loans/apply/collateral" disabled={kycPending}>
            Continue with collateral
          </Button>
        </Glass>

        <Glass className="client-panel loan-choice">
          <Badge icon="passport">Credit</Badge>
          <h2 className="client-panel-title">Credit-based</h2>
          <p className="client-lede">
            Uncollateralized, gated by Credit Passport tier (Bronze–Diamond). Higher tiers unlock
            larger caps and slightly better rates.
          </p>
          <Button as={Link} to="/app/loans/apply/credit" variant="ghost" disabled={kycPending}>
            Continue with credit
          </Button>
        </Glass>
      </div>

      <p className="client-lede">
        <Icon name="loan" size={14} /> Or browse{" "}
        <Link to="/app/loans/history" className="text-link">
          loan history
        </Link>
        {" · "}
        <Link to="/app/groups" className="text-link">
          group lending
        </Link>
        .
      </p>
    </div>
  );
}

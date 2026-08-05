import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import Badge from "../../../components/ui/Badge";
import { useSession } from "@/lib/store";

/**
 * Route: `/app/loans/apply` — choose collateral vs credit path
 * Layout mirrors Binance Earn product rows: title + tags | metrics | CTA
 */
const PRODUCTS = [
  {
    key: "bank",
    badge: "Popular",
    badgeAccent: true,
    icon: "loan",
    title: "Bank select · Local / National",
    tags: ["Flexible term", "USDC", "Approval required"],
    desc: "Pick a lending bank, set amount and installments. Reserve is debited when the bank funds you.",
    metrics: [
      { label: "Est. APR", value: "8.5–14%", apr: true },
      { label: "Term", value: "1–60 mo" },
      { label: "Collateral", value: "Optional" },
    ],
    to: "/app/loans/request",
    cta: "Request loan",
    variant: "primary",
    hint: "Clients cannot borrow from World Bank",
  },
  {
    key: "collateral",
    badge: "Lower friction",
    badgeAccent: false,
    icon: "wallet",
    title: "Collateral-based",
    tags: ["ETH lock", "LTV 50%", "Approval required"],
    desc: "Lock ETH as collateral at a Local or National bank. Max borrow follows LTV — best when Credit Passport tier is still low.",
    metrics: [
      { label: "Est. APR", value: "6.0%", apr: true },
      { label: "Max LTV", value: "50%" },
      { label: "Asset", value: "ETH" },
    ],
    to: "/app/loans/apply/collateral",
    cta: "Continue",
    variant: "primary",
    hint: "Local or National lender · approval required",
  },
  {
    key: "credit",
    badge: "Uncollateralized",
    badgeAccent: false,
    icon: "passport",
    title: "Credit-based",
    tags: ["Passport gated", "Bronze–Diamond", "No lock"],
    desc: "Borrow against Credit Passport tier from a Local or National bank. Higher tiers unlock larger caps and slightly better rates.",
    metrics: [
      { label: "Est. APR", value: "9.5–16%", apr: true },
      { label: "Gate", value: "SBT tier" },
      { label: "Collateral", value: "None" },
    ],
    to: "/app/loans/apply/credit",
    cta: "Continue",
    variant: "ghost",
    hint: "Local or National lender · approval required",
  },
];

export default function ApplyHubPage() {
  const user = useSession((s) => s.user);
  const kycPending =
    user?.kyc1Status === "PENDING" ||
    user?.kyc1Status === "NOT_STARTED" ||
    (!user?.onboardingComplete && user?.isFirstTime);

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Lending</p>
        <h1 className="client-title">Borrow</h1>
        <p className="client-lede">
          Choose a product. Rates shown are indicative for the demo pool — final APR is set at
          approval.
        </p>
        <Link to="/app/loans/limits" className="text-link">
          Check borrowing limits →
        </Link>
      </header>

      {kycPending ? (
        <div className="notice warn">
          KYC Level 1 is still pending. You can review products, but submission stays locked until
          verification clears. <Link to="/app/settings">View KYC status</Link>
        </div>
      ) : null}

      <div className="loan-product-list">
        {PRODUCTS.map((p) => (
          <Glass key={p.key} className="loan-product-card" level={2}>
            <div className="loan-product-main">
              <div className="loan-product-tags">
                <Badge icon={p.icon}>{p.badge}</Badge>
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className={`loan-product-tag${p.badgeAccent && t === p.tags[0] ? " accent" : ""}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h2>{p.title}</h2>
              <p className="loan-product-desc">{p.desc}</p>
            </div>

            <div className="loan-product-metrics" aria-label={`${p.title} metrics`}>
              {p.metrics.map((m) => (
                <div key={m.label} className="loan-metric">
                  <span>{m.label}</span>
                  <strong className={m.apr ? "apr" : undefined}>{m.value}</strong>
                </div>
              ))}
            </div>

            <div className="loan-product-cta">
              <Button as={Link} to={p.to} variant={p.variant} disabled={kycPending}>
                {p.cta}
              </Button>
              <span className="hint">{p.hint}</span>
            </div>
          </Glass>
        ))}
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

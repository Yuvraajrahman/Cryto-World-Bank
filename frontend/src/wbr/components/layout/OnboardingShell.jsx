import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import Icon from "../ui/Icon";
import LogoMark from "../ui/LogoMark";
import ThemeToggle from "../ui/ThemeToggle";
import { ToastProvider } from "../ui/Toast";
import { useSession } from "@/lib/store";
import { useOnboardingStore } from "../../hooks/onboardingStore";
import "../../global.css";

const STEP_META = [
  { n: 1, label: "Register", path: "/onboarding/register" },
  { n: 2, label: "KYC 1", path: "/onboarding/kyc-1" },
  { n: 3, label: "KYC 2", path: "/onboarding/kyc-2" },
  { n: 4, label: "Consent", path: "/onboarding/consent" },
  { n: 5, label: "Done", path: "/onboarding/complete" },
];

/**
 * Minimal onboarding chrome (design.md §11 Group B):
 * back + step count header, no public marketing nav.
 */
export default function OnboardingShell({
  step, // 1..5
  backTo,
  children,
  requireAuth = true,
}) {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const token = useSession((s) => s.token);
  const user = useSession((s) => s.user);
  const syncFromApi = useOnboardingStore((s) => s.syncFromApi);

  useEffect(() => {
    if (token) void syncFromApi();
  }, [token, syncFromApi]);

  const wallet = user?.wallet || address;
  const authed = Boolean(token);

  if (requireAuth && !authed) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(STEP_META[step - 1]?.path || "/onboarding/register")}`} replace />;
  }

  const meta = STEP_META[step - 1];

  return (
    <div className="wbr-root">
      <ToastProvider>
        <div className="bg-orbs" aria-hidden>
          <div className="orb orb-gold" />
          <div className="orb orb-signal" />
        </div>
        <div className="grain" aria-hidden />

        <header className="onboard-top">
          <div className="onboard-top-inner">
            {backTo ? (
              <button
                type="button"
                className="icon-btn"
                aria-label="Go back"
                onClick={() => navigate(backTo)}
              >
                <Icon name="chevronRight" size={18} style={{ transform: "rotate(180deg)" }} />
              </button>
            ) : (
              <Link to="/" className="icon-btn" aria-label="Home">
                <LogoMark />
              </Link>
            )}

            <div className="onboard-step-label">
              <span className="eyebrow" style={{ margin: 0 }}>
                Step {step} of 5
              </span>
              <strong>{meta?.label}</strong>
            </div>

            <ThemeToggle />
          </div>

          <ol className="onboard-progress" aria-label="Onboarding progress">
            {STEP_META.map((s) => {
              const state = s.n < step ? "done" : s.n === step ? "active" : "";
              return (
                <li key={s.n} className={`onboard-progress-step ${state}`.trim()}>
                  <span className="onboard-progress-dot" aria-hidden>
                    {s.n < step ? <Icon name="check" size={12} /> : s.n}
                  </span>
                  <span className="onboard-progress-name">{s.label}</span>
                </li>
              );
            })}
          </ol>

          {wallet ? (
            <p className="onboard-wallet">
              <span className="tier-row-meta">Wallet</span>{" "}
              <code>
                {wallet.slice(0, 6)}…{wallet.slice(-4)}
              </code>
            </p>
          ) : null}
        </header>

        <main className="onboard-main">{children}</main>
      </ToastProvider>
    </div>
  );
}

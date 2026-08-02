import { Link } from "react-router-dom";
import Icon from "../../components/ui/Icon";

/**
 * Pass/fail eligibility checklist for group loan apply / consent.
 */
export default function EligibilityChecklist({ eligibility, dense = false }) {
  const checks = eligibility?.checks || [];
  if (!checks.length) return null;

  return (
    <ul className={`eligibility-list${dense ? " dense" : ""}`} role="list">
      {checks.map((c) => (
        <li key={c.id} className={`eligibility-row ${c.pass ? "pass" : "fail"}`}>
          <span className="eligibility-icon" aria-hidden>
            <Icon name={c.pass ? "check" : "warn"} size={16} />
          </span>
          <div className="eligibility-body">
            <strong>{c.label}</strong>
            <span className="eligibility-detail">{c.detail}</span>
          </div>
        </li>
      ))}
      {eligibility?.dtiByMember?.length ? (
        <li className="eligibility-dti-block">
          <p className="eyebrow">Per-member DTI</p>
          <ul className="eligibility-dti-list">
            {eligibility.dtiByMember.map((m) => (
              <li key={m.userId} className={m.pass ? "pass" : "fail"}>
                <span>{m.displayName}</span>
                <span className="mono">
                  {(m.dti * 100).toFixed(0)}% · share {m.shareEth.toFixed(3)} ETH
                </span>
              </li>
            ))}
          </ul>
        </li>
      ) : null}
    </ul>
  );
}

export function Kyc2GateBanner({ user, blockApply }) {
  if (!user) return null;
  const approved = user.kyc2Status === "APPROVED";
  if (approved) return null;

  return (
    <div className={`notice ${blockApply ? "warn" : ""}`}>
      {blockApply ? (
        <>
          KYC Level 2 is recommended before group applications. Complete or skip with awareness.{" "}
          <Link to="/onboarding/kyc-2">Continue KYC-2 →</Link>
        </>
      ) : (
        <>
          KYC Level 2 was skipped or is pending. You can still apply; income DTI uses a default floor
          of $500/mo. <Link to="/onboarding/kyc-2">Add KYC-2 docs →</Link>
        </>
      )}
    </div>
  );
}

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import OnboardingShell from "../../components/layout/OnboardingShell";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import FileUpload from "../../components/ui/FileUpload";
import { useToast } from "../../components/ui/Toast";
import { useOnboardingStore } from "../../hooks/onboardingStore";
import { useSession } from "@/lib/store";

const STATUS_LABEL = {
  not_started: "Not started",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

/**
 * Route: `/onboarding/kyc-2` — plan B.7 (optional upgrade)
 */
export default function Kyc2Page() {
  const registrationDone = useOnboardingStore((s) => s.registration.done);
  const kyc1 = useOnboardingStore((s) => s.kyc1);
  if (!registrationDone) return <Navigate to="/onboarding/register" replace />;
  if (kyc1.status === "not_started") return <Navigate to="/onboarding/kyc-1" replace />;

  return (
    <OnboardingShell step={3} backTo="/onboarding/kyc-1">
      <Kyc2Form />
    </OnboardingShell>
  );
}

function Kyc2Form() {
  const navigate = useNavigate();
  const toast = useToast();
  const kyc2 = useOnboardingStore((s) => s.kyc2);
  const setKyc2 = useOnboardingStore((s) => s.setKyc2);
  const submitKyc2 = useOnboardingStore((s) => s.submitKyc2);
  const skipKyc2 = useOnboardingStore((s) => s.skipKyc2);
  const submitKyc2Remote = useOnboardingStore((s) => s.submitKyc2Remote);
  const skipKyc2Remote = useOnboardingStore((s) => s.skipKyc2Remote);
  const token = useSession((s) => s.token);

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function onFile(key, file, err) {
    if (err) {
      setErrors((e) => ({ ...e, [key]: err }));
      return;
    }
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
    setKyc2({ [key]: file?.name || "" });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!kyc2.addressDocName) next.addressDocName = "Upload proof of address";
    if (!kyc2.incomeDocName) next.incomeDocName = "Upload proof of income";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      if (token) {
        await submitKyc2Remote({
          addressDocName: kyc2.addressDocName,
          incomeDocName: kyc2.incomeDocName,
        });
      } else {
        await new Promise((r) => setTimeout(r, 400));
        submitKyc2();
      }
      toast.show("KYC Level 2 submitted", { variant: "success" });
      navigate("/onboarding/consent");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Upload failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onSkip() {
    try {
      if (token) await skipKyc2Remote();
      else skipKyc2();
      toast.show("Skipped KYC Level 2 — you can upgrade later", { variant: "pending" });
      navigate("/onboarding/consent");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Skip failed", { variant: "error" });
    }
  }

  return (
    <form className="onboard-card-wrap" onSubmit={onSubmit}>
      <Glass className="onboard-card">
        <div className="onboard-status-row">
          <p className="eyebrow" style={{ margin: 0 }}>
            Optional upgrade
          </p>
          <Badge>{kyc2.skipped ? "Skipped" : STATUS_LABEL[kyc2.status]}</Badge>
        </div>
        <h1 className="onboard-title">KYC Level 2</h1>
        <p className="onboard-lede">
          Enhanced verification for Gold–Diamond tiers, higher limits, and group lending. Not
          required for basic Bronze/Silver use.
        </p>

        <div className="compare-grid" style={{ marginTop: 8 }}>
          <Glass className="compare-card" style={{ padding: 16 }}>
            <p className="eyebrow">Level 1</p>
            <h3 style={{ fontSize: 17, margin: "6px 0 8px" }}>Essential</h3>
            <ul>
              <li>Bronze / Silver caps</li>
              <li>Collateral loans</li>
              <li>Basic savings</li>
            </ul>
          </Glass>
          <Glass className="compare-card" style={{ padding: 16 }}>
            <p className="eyebrow">Level 2</p>
            <h3 style={{ fontSize: 17, margin: "6px 0 8px" }}>Enhanced</h3>
            <ul>
              <li>Gold → Diamond path</li>
              <li>Group lending</li>
              <li>Higher credit limits</li>
            </ul>
          </Glass>
        </div>

        <FileUpload
          label="Proof of address"
          fileName={kyc2.addressDocName}
          error={errors.addressDocName}
          onFile={(f, err) => onFile("addressDocName", f, err)}
        />
        <FileUpload
          label="Proof of income / source of funds"
          fileName={kyc2.incomeDocName}
          error={errors.incomeDocName}
          onFile={(f, err) => onFile("incomeDocName", f, err)}
        />

        <div className="notice">
          Optional: a Local Bank may request a short video verification after documents are
          reviewed.
        </div>

        <div className="onboard-actions">
          <Button variant="primary" block type="submit" disabled={busy}>
            {busy ? "Uploading…" : "Submit Level 2"}
          </Button>
          <Button variant="ghost" block showArrow={false} type="button" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
      </Glass>
    </form>
  );
}

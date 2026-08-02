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
 * Route: `/onboarding/kyc-1` — plan B.6
 * Gate: registration done. Users may continue to KYC-2 / consent while pending.
 */
export default function Kyc1Page() {
  const registrationDone = useOnboardingStore((s) => s.registration.done);
  if (!registrationDone) return <Navigate to="/onboarding/register" replace />;

  return (
    <OnboardingShell step={2} backTo="/onboarding/register">
      <Kyc1Form />
    </OnboardingShell>
  );
}

function Kyc1Form() {
  const navigate = useNavigate();
  const toast = useToast();
  const kyc1 = useOnboardingStore((s) => s.kyc1);
  const setKyc1 = useOnboardingStore((s) => s.setKyc1);
  const submitKyc1 = useOnboardingStore((s) => s.submitKyc1);
  const submitKyc1Remote = useOnboardingStore((s) => s.submitKyc1Remote);
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
    setKyc1({ [key]: file?.name || "" });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!kyc1.idFrontName) next.idFrontName = "Upload ID front";
    if (!kyc1.idBackName) next.idBackName = "Upload ID back";
    if (!kyc1.selfieName) next.selfieName = "Upload a selfie";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      if (token) {
        await submitKyc1Remote({
          idFrontName: kyc1.idFrontName,
          idBackName: kyc1.idBackName,
          selfieName: kyc1.selfieName,
        });
      } else {
        await new Promise((r) => setTimeout(r, 400));
        submitKyc1();
      }
      toast.show("KYC Level 1 submitted", { variant: "success" });
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Upload failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  const pending = kyc1.status === "pending" || kyc1.status === "approved";

  return (
    <form className="onboard-card-wrap" onSubmit={onSubmit}>
      <Glass className="onboard-card">
        <div className="onboard-status-row">
          <p className="eyebrow" style={{ margin: 0 }}>
            Identity
          </p>
          <Badge icon={kyc1.status === "approved" ? "check" : kyc1.status === "rejected" ? "alert" : "clock"}>
            {STATUS_LABEL[kyc1.status] || kyc1.status}
          </Badge>
        </div>
        <h1 className="onboard-title">KYC Level 1</h1>
        <p className="onboard-lede">
          Government ID + selfie unlocks Bronze / Silver small loans. Only a document hash is
          written on-chain — images stay off-chain.
        </p>

        <div className="notice ok">
          <strong>Unlocks:</strong> collateral-based loans, Bronze/Silver credit path, basic savings.
          Estimated review: under 24 hours on testnet.
        </div>

        <p className="field-label" style={{ marginTop: 8 }}>
          Accepted ID types
        </p>
        <p className="onboard-lede" style={{ marginTop: 4 }}>
          Passport, national ID, or driver&apos;s license — front and back (or PDF scan).
        </p>

        {kyc1.status === "rejected" && kyc1.rejectionReason ? (
          <div className="notice error">{kyc1.rejectionReason}</div>
        ) : null}

        <FileUpload
          label="Government ID — front"
          fileName={kyc1.idFrontName}
          error={errors.idFrontName}
          onFile={(f, err) => onFile("idFrontName", f, err)}
        />
        <FileUpload
          label="Government ID — back"
          fileName={kyc1.idBackName}
          error={errors.idBackName}
          onFile={(f, err) => onFile("idBackName", f, err)}
        />
        <FileUpload
          label="Selfie (liveness / face-match)"
          hint="Clear face photo · PNG or JPG · max 8MB"
          accept="image/*"
          fileName={kyc1.selfieName}
          error={errors.selfieName}
          onFile={(f, err) => onFile("selfieName", f, err)}
        />

        <div className="onboard-actions">
          {!pending || kyc1.status === "rejected" ? (
            <Button variant="primary" block type="submit" disabled={busy}>
              {busy ? "Uploading…" : kyc1.status === "rejected" ? "Resubmit for review" : "Submit for review"}
            </Button>
          ) : (
            <div className="notice warn">
              Documents are pending review. You can continue onboarding — loan actions stay gated until
              approval.
            </div>
          )}
          <Button
            variant="ghost"
            block
            showArrow={false}
            type="button"
            disabled={kyc1.status === "not_started"}
            onClick={() => navigate("/onboarding/kyc-2")}
          >
            Continue while pending
          </Button>
        </div>
      </Glass>
    </form>
  );
}

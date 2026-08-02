import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingShell from "../../components/layout/OnboardingShell";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { useOnboardingStore } from "../../hooks/onboardingStore";
import { useSession } from "@/lib/store";
import { ApiError } from "@/lib/api";

function validate(form) {
  const errors = {};
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = "Enter your full legal name";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email";
  }
  if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 8) {
    errors.phone = "Enter a valid phone number";
  }
  if (!form.country.trim()) errors.country = "Select a country";
  if (!form.dateOfBirth) errors.dateOfBirth = "Required";
  else {
    const age =
      (Date.now() - new Date(form.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 18) errors.dateOfBirth = "You must be 18 or older";
  }
  if (!form.terms) errors.terms = "Accept the terms to continue";
  return errors;
}

export default function RegisterPage() {
  return (
    <OnboardingShell step={1}>
      <RegisterForm />
    </OnboardingShell>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);
  const token = useSession((s) => s.token);
  const saved = useOnboardingStore((s) => s.registration);
  const setRegistration = useOnboardingStore((s) => s.setRegistration);
  const completeRegistration = useOnboardingStore((s) => s.completeRegistration);
  const registerRemote = useOnboardingStore((s) => s.registerRemote);
  const syncFromApi = useOnboardingStore((s) => s.syncFromApi);

  const [form, setForm] = useState({
    fullName: saved.fullName || user?.displayName || "",
    email: saved.email || user?.email || "",
    phone: saved.phone || "",
    country: saved.country || user?.country || "",
    dateOfBirth: saved.dateOfBirth || "",
    accountType: saved.accountType || "individual",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) void syncFromApi();
  }, [token, syncFromApi]);

  const wallet = useMemo(() => user?.wallet || "", [user]);

  function patch(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      setRegistration({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        dateOfBirth: form.dateOfBirth,
        accountType: form.accountType,
      });

      if (token) {
        try {
          const status = await registerRemote({
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            country: form.country.trim(),
            dateOfBirth: form.dateOfBirth,
            accountType: form.accountType,
            termsAccepted: true,
          });
          if (status?.user) {
            setUser({
              ...user,
              ...status.user,
              role: status.user.role || user?.role || "BORROWER",
            });
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 409) {
            setErrors({ email: "Email already registered" });
            toast.show("Duplicate email", { variant: "error" });
            return;
          }
          toast.show(
            err instanceof Error ? err.message : "Could not save profile",
            { variant: "error" },
          );
          return;
        }
      } else {
        completeRegistration();
      }

      toast.show("Profile created", { variant: "success" });
      navigate("/onboarding/kyc-1");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="onboard-card-wrap" onSubmit={onSubmit} noValidate>
      <Glass className="onboard-card">
        <p className="eyebrow">Create your account</p>
        <h1 className="onboard-title">Tell us who you are</h1>
        <p className="onboard-lede">
          Linked to your wallet. Profile is stored in the backend JSON store (and Prisma schema
          targets the same fields for production).
        </p>

        <Input
          label="Wallet address"
          value={wallet || "Connect a wallet on /login first"}
          readOnly
          hint="Auto-filled from your session"
        />

        <Input
          label="Full name"
          autoComplete="name"
          value={form.fullName}
          onChange={(e) => patch("fullName", e.target.value)}
          error={errors.fullName}
          placeholder="As on your government ID"
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => patch("email", e.target.value)}
          error={errors.email}
          placeholder="you@example.com"
        />

        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => patch("phone", e.target.value)}
          error={errors.phone}
          placeholder="+880…"
        />

        <Input
          as="select"
          label="Country of residence"
          value={form.country}
          onChange={(e) => patch("country", e.target.value)}
          error={errors.country}
        >
          <option value="">Select…</option>
          <option value="Bangladesh">Bangladesh</option>
          <option value="India">India</option>
          <option value="Kenya">Kenya</option>
          <option value="United States">United States</option>
          <option value="Other">Other</option>
        </Input>

        <Input
          label="Date of birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => patch("dateOfBirth", e.target.value)}
          error={errors.dateOfBirth}
        />

        <fieldset className="account-type">
          <legend className="field-label">Account type</legend>
          <div className="account-type-row">
            {[
              { id: "individual", title: "Individual retail", desc: "Borrow and save on your own" },
              { id: "group", title: "Group client intent", desc: "Plan to join solidarity lending" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`account-type-pill${form.accountType === opt.id ? " active" : ""}`}
                onClick={() => patch("accountType", opt.id)}
              >
                <strong>{opt.title}</strong>
                <span>{opt.desc}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className={`check-row${errors.terms ? " error" : ""}`}>
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => patch("terms", e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <a href="/about#faq" target="_blank" rel="noreferrer">
              Terms of Service
            </a>{" "}
            and acknowledge this is a testnet demo, not a licensed bank.
          </span>
        </label>
        {errors.terms ? (
          <span className="field-hint" style={{ color: "var(--danger-bright)" }}>
            {errors.terms}
          </span>
        ) : null}

        <div className="onboard-actions">
          <Button variant="primary" block type="submit" disabled={submitting} showArrow={!submitting}>
            {submitting ? "Saving…" : "Continue to KYC"}
          </Button>
        </div>
      </Glass>
    </form>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useChainId, useDisconnect, useSignMessage } from "wagmi";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { networkLabel } from "../../lib/explorer";

function buildSiweMessage({ address, chainId, nonce, domain, uri }) {
  return `${domain} wants you to sign in with your Ethereum account:
${address}

Link wallet to Crypto World Bank account.

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;
}

const DEFAULT_PREFS = {
  email: true,
  push: false,
  inApp: true,
  categories: {
    loan: true,
    kyc: true,
    payment: true,
    agent: true,
    chat: true,
    system: true,
  },
};

/**
 * Route: `/app/settings` — plan C.11 Profile & Account Settings
 */
export default function SettingsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const sessionUser = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);
  const setSession = useSession((s) => s.setSession);
  const reset = useSession((s) => s.reset);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();
  const [walletBusy, setWalletBusy] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kyc, setKyc] = useState(null);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    country: "",
    loginId: "",
    emailConfirmed: false,
    pendingEmail: "",
  });
  const [confirmToken, setConfirmToken] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [baseline, setBaseline] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profile, status] = await Promise.all([
          api.get("/api/profile"),
          api.get("/api/onboarding/status").catch(() => null),
        ]);
        if (cancelled) return;
        const u = profile.user;
        const nextForm = {
          displayName: u.displayName || "",
          email: u.email || "",
          phone: u.phone || "",
          country: u.country || "",
          loginId: u.loginId || "",
          emailConfirmed: Boolean(u.emailConfirmed),
          pendingEmail: u.pendingEmail || "",
        };
        const nextPrefs = { ...DEFAULT_PREFS, ...(u.notificationPrefs || {}) };
        if (u.notificationPrefs?.categories) {
          nextPrefs.categories = {
            ...DEFAULT_PREFS.categories,
            ...u.notificationPrefs.categories,
          };
        }
        setForm(nextForm);
        setPrefs(nextPrefs);
        setBaseline({ form: nextForm, prefs: nextPrefs });
        setKyc(status);
        if (u) setUser(u);
      } catch (err) {
        toast.show(err.message || "Failed to load profile", { variant: "error" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, toast]);

  const dirty = useMemo(() => {
    if (!baseline) return false;
    return (
      JSON.stringify({ form, prefs }) !==
      JSON.stringify({ form: baseline.form, prefs: baseline.prefs })
    );
  }, [form, prefs, baseline]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    const nextErr = {};
    if (!form.displayName.trim()) nextErr.displayName = "Name is required";
    // Personal email is optional until confirmed via request-confirm flow
    setErrors(nextErr);
    if (Object.keys(nextErr).length) return;

    setSaving(true);
    try {
      const r = await api.put("/api/profile", {
        displayName: form.displayName.trim(),
        phone: form.phone.trim() || undefined,
        country: form.country.trim() || undefined,
        notificationPrefs: prefs,
      });
      setUser(r.user);
      setBaseline({ form: { ...form }, prefs: { ...prefs, categories: { ...prefs.categories } } });
      toast.show("Profile saved", { variant: "success" });
    } catch (err) {
      toast.show(err.message || "Save failed", { variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  function onLogout() {
    if (dirty && !window.confirm("You have unsaved changes. Log out anyway?")) return;
    reset();
    if (isConnected) disconnect();
    navigate("/login");
  }

  const wallet = sessionUser?.wallet || address;

  if (loading) {
    return (
      <div className="client-page">
        <p className="client-lede">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Account</p>
        <h1 className="client-title">Settings</h1>
        <p className="client-lede">
          Profile, KYC status, notification preferences, and session controls.
        </p>
        {dirty ? <Badge icon="warn">Unsaved changes</Badge> : null}
      </header>

      <form className="settings-stack" onSubmit={onSave}>
        <Glass className="client-panel">
          <p className="eyebrow">Profile</p>
          <div className="settings-fields">
            {form.loginId ? (
              <p className="client-lede">
                User ID: <code>{form.loginId}</code>
              </p>
            ) : null}
            <Input
              label="Full name"
              value={form.displayName}
              onChange={(e) => setField("displayName", e.target.value)}
              error={errors.displayName}
            />
            <Input
              label="Personal email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              error={errors.email}
              hint={
                form.emailConfirmed
                  ? "Confirmed — you can sign in with this email and your User ID password."
                  : form.pendingEmail
                    ? `Pending confirmation: ${form.pendingEmail}`
                    : "Add and confirm to also sign in with email."
              }
            />
            <div className="settings-row-actions">
              <Button
                type="button"
                variant="ghost"
                showArrow={false}
                disabled={emailBusy || !form.email.trim()}
                onClick={async () => {
                  try {
                    setEmailBusy(true);
                    const r = await api.post("/api/auth/email/request-confirm", {
                      email: form.email.trim(),
                    });
                    setConfirmToken(r.confirmToken || "");
                    setForm((f) => ({ ...f, pendingEmail: form.email.trim() }));
                    toast.show("Confirmation token ready — click Confirm email", {
                      variant: "success",
                    });
                  } catch (err) {
                    toast.show(err.message || "Email request failed", { variant: "error" });
                  } finally {
                    setEmailBusy(false);
                  }
                }}
              >
                Request email confirm
              </Button>
              <Button
                type="button"
                variant="ghost"
                showArrow={false}
                disabled={emailBusy || !confirmToken}
                onClick={async () => {
                  try {
                    setEmailBusy(true);
                    const r = await api.post("/api/auth/email/confirm", { token: confirmToken });
                    setUser(r.user);
                    setForm((f) => ({
                      ...f,
                      email: r.user.email || f.email,
                      emailConfirmed: true,
                      pendingEmail: "",
                    }));
                    toast.show("Email confirmed", { variant: "success" });
                  } catch (err) {
                    toast.show(err.message || "Confirm failed", { variant: "error" });
                  } finally {
                    setEmailBusy(false);
                  }
                }}
              >
                Confirm email
              </Button>
            </div>
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              hint="Include country code"
            />
            <Input
              label="Country"
              value={form.country}
              onChange={(e) => setField("country", e.target.value)}
            />
          </div>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Banking products</p>
          <h2 className="client-panel-title">Accounts & FX</h2>
          <div className="pref-toggles" style={{ display: "grid", gap: 8 }}>
            <Link to="/app/savings" className="text-link">
              Savings vault →
            </Link>
            <Link to="/app/deposits/fixed" className="text-link">
              Fixed deposits →
            </Link>
            <Link to="/app/account/checking" className="text-link">
              Checking (P2P USDC) →
            </Link>
            <Link to="/app/account/convert" className="text-link">
              USD → USDC convert →
            </Link>
            <Link to="/app/account/exchange" className="text-link">
              Exchange USDC ↔ ETH →
            </Link>
            <Link to="/app/account/statement" className="text-link">
              Account statement →
            </Link>
            <Link to="/app/groups" className="text-link">
              Group lending →
            </Link>
          </div>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">KYC</p>
          <div className="kyc-status-grid">
            <div>
              <strong>Level 1</strong>
              <Badge>{String(kyc?.kyc1?.status || sessionUser?.kyc1Status || "—").toLowerCase()}</Badge>
            </div>
            <div>
              <strong>Level 2</strong>
              <Badge>
                {kyc?.kyc2?.skipped
                  ? "skipped"
                  : String(kyc?.kyc2?.status || sessionUser?.kyc2Status || "—").toLowerCase()}
              </Badge>
            </div>
          </div>
          <p className="client-lede" style={{ margin: "12px 0" }}>
            Level 2 unlocks higher limits and group lending eligibility.
          </p>
          <Button as={Link} to="/onboarding/kyc-2" variant="ghost" showArrow={false}>
            Upgrade KYC Level 2
          </Button>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Wallet & session</p>
          <p className="client-lede">
            Account wallet: <code>{sessionUser?.wallet || "—"}</code>
          </p>
          <p className="client-lede">
            Connected MetaMask: <code>{wallet || "—"}</code>
          </p>
          <p className="client-lede">Network: {networkLabel(chainId)}</p>
          <p className="client-lede">
            MetaMask is optional — link it after you create your account. Password / User ID login
            still works.
          </p>
          <div className="settings-row-actions">
            <Button
              type="button"
              showArrow={false}
              disabled={walletBusy || !isConnected || !address}
              onClick={async () => {
                try {
                  setWalletBusy(true);
                  const { nonce } = await api.get("/api/auth/nonce");
                  const domain = window.location.host;
                  const message = buildSiweMessage({
                    address,
                    chainId,
                    nonce,
                    domain,
                    uri: window.location.origin,
                  });
                  const signature = await signMessageAsync({ message });
                  const r = await api.post("/api/auth/link-wallet", { message, signature });
                  if (r.token && r.user) setSession({ token: r.token, user: r.user });
                  else if (r.user) setUser(r.user);
                  toast.show("MetaMask linked to your account", { variant: "success" });
                } catch (err) {
                  toast.show(err.message || "Link wallet failed", { variant: "error" });
                } finally {
                  setWalletBusy(false);
                }
              }}
            >
              Link MetaMask
            </Button>
            <Button
              type="button"
              variant="ghost"
              showArrow={false}
              onClick={() => {
                if (isConnected) disconnect();
                toast.show("Wallet disconnected", { variant: "success" });
              }}
              disabled={!isConnected}
            >
              Disconnect wallet
            </Button>
            <Button type="button" variant="ghost" showArrow={false} onClick={onLogout}>
              Log out session
            </Button>
            <Button
              type="button"
              variant="ghost"
              showArrow={false}
              onClick={() => {
                reset();
                if (isConnected) disconnect();
                navigate("/login");
              }}
            >
              Log out all (this device)
            </Button>
            <Link to="/app/notifications" className="text-link">
              Open notifications →
            </Link>
          </div>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Notification preferences</p>
          <div className="pref-toggles">
            {[
              ["email", "Email"],
              ["push", "Push"],
              ["inApp", "In-app"],
            ].map(([key, label]) => (
              <label key={key} className="check-row">
                <input
                  type="checkbox"
                  checked={Boolean(prefs[key])}
                  onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <p className="eyebrow" style={{ marginTop: 16 }}>
            Categories
          </p>
          <div className="pref-toggles">
            {Object.keys(DEFAULT_PREFS.categories).map((key) => (
              <label key={key} className="check-row">
                <input
                  type="checkbox"
                  checked={Boolean(prefs.categories?.[key])}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      categories: { ...p.categories, [key]: e.target.checked },
                    }))
                  }
                />
                <span style={{ textTransform: "capitalize" }}>{key}</span>
              </label>
            ))}
          </div>
        </Glass>

        <div className="onboard-actions">
          <Button type="submit" block disabled={saving || !dirty} showArrow={false}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

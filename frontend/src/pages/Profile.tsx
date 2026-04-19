import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { shortAddress, formatDateTime } from "@/lib/utils";
import {
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Copy,
  FileText,
  Clock,
  AlertCircle,
  CircleDollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, ProfileResponse } from "@/lib/api";
import { useSession } from "@/lib/store";

export function Profile() {
  const { chain } = useAccount();
  const user = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ displayName: "", email: "", country: "Bangladesh" });
  const [monthlyIncomeUsd, setMonthlyIncomeUsd] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await api.get<ProfileResponse>("/api/profile");
      setProfile(r);
      setForm({
        displayName: r.user.displayName ?? "",
        email: r.user.email ?? "",
        country: r.user.country ?? "Bangladesh",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await api.put<{ ok: boolean; user: ProfileResponse["user"] }>(
        "/api/profile",
        form,
      );
      toast.success("Profile saved");
      setUser({ ...user!, ...r.user });
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setUploading(true);
      try {
        await api.post("/api/income/upload", {
          fileName: f.name,
          mimeType: f.type,
          contentBase64: base64,
          monthlyIncomeUsd: monthlyIncomeUsd ? Number(monthlyIncomeUsd) : undefined,
        });
        toast.success("Income proof uploaded — pending review");
        await load();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(f);
  }

  const verif = profile?.incomeVerification;
  const verifBadge = (() => {
    switch (verif?.status) {
      case "APPROVED":
        return "badge-green";
      case "PENDING":
        return "badge-gold";
      case "REJECTED":
        return "badge-red";
      default:
        return "badge";
    }
  })();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Identity"
        title="Your Profile"
        description="Your wallet is your identity. Profile metadata and income verification unlock higher loan tiers."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="label">Display name</label>
              <input
                className="input"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Country</label>
              <select
                className="input"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              >
                <option>Bangladesh</option>
                <option>Nigeria</option>
                <option>Indonesia</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <div className="input flex items-center justify-between">
                <span>{(user?.role ?? "GUEST").replace(/_/g, " ")}</span>
                <span className="badge-gold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user?.role === "BORROWER"
                    ? "Tier 4"
                    : user?.role === "LOCAL_BANK_ADMIN" || user?.role === "APPROVER"
                      ? "Tier 3"
                      : user?.role === "NATIONAL_BANK_ADMIN"
                        ? "Tier 2"
                        : "Tier 1"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="btn-primary" onClick={save} disabled={saving || loading}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button className="btn-ghost" onClick={load} disabled={loading}>
              Reload
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Wallet</div>
          <div className="font-display text-xl font-semibold text-ink-100">
            {shortAddress(user?.wallet, 6)}
          </div>
          <div className="mt-1 text-xs text-ink-200">
            Network: <span className="text-gold-300">{chain?.name ?? "Testnet (demo)"}</span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2.5">
            <span className="truncate font-mono text-xs text-ink-100">{user?.wallet ?? "—"}</span>
            <button
              className="ml-2 inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200"
              onClick={() => {
                if (user?.wallet) {
                  navigator.clipboard.writeText(user.wallet);
                  toast.success("Address copied");
                }
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
          <div className="divider my-5" />
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between text-ink-200">
              <span>Session</span>
              <span className="badge-green">Active</span>
            </li>
            <li className="flex items-center justify-between text-ink-200">
              <span>Role on-chain</span>
              <span className="badge-gold">{(user?.role ?? "GUEST").replace(/_/g, " ")}</span>
            </li>
            <li className="flex items-center justify-between text-ink-200">
              <span>Bank</span>
              <span className="badge">{profile?.bank?.name ?? "—"}</span>
            </li>
          </ul>
        </div>
      </div>

      {user?.role === "BORROWER" && profile?.limits ? (
        <div className="card p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
                Borrowing limits
              </div>
              <div className="font-display text-xl font-semibold text-ink-100">
                Your current capacity
              </div>
              <p className="mt-1 text-sm text-ink-200">
                Limits reset on a rolling 6-month and 1-year window, recomputed on
                every approval, installment payment, and nightly cron.
              </p>
            </div>
            {profile.limits.exceptionApplied ? (
              <span className="badge-green">
                <CheckCircle2 className="h-3.5 w-3.5" />
                1.5x good-history multiplier
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LimitCard label="6-month" data={profile.limits.sixMonth} />
            <LimitCard label="1-year" data={profile.limits.oneYear} />
            <div className="rounded-xl border border-ink-600/60 bg-ink-900/60 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
                Active loans
              </div>
              <div className="mt-1 font-display text-2xl font-semibold text-ink-100">
                {profile.limits.activeLoanCount} / {profile.limits.maxActiveLoans}
              </div>
              <div className="mt-1 text-xs text-ink-200">
                Consecutive paid: {user?.consecutivePaidLoans ?? 0}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {user?.role === "BORROWER" ? (
        <div className="card p-6">
          <div className="mb-1 text-xs uppercase tracking-[0.22em] text-ink-200">
            Income Verification
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-xl font-semibold text-ink-100">
                Raise your borrowing ceiling
              </div>
              <p className="mt-1 max-w-2xl text-sm text-ink-200">
                Upload proof of monthly income (bank statement, payslip, or invoices).
                An approver will review and countersign — your verified status unlocks
                first-time lending and higher caps.
              </p>
            </div>
            <span className={verifBadge}>
              {verif?.status === "APPROVED" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : verif?.status === "PENDING" ? (
                <Clock className="h-3.5 w-3.5" />
              ) : verif?.status === "REJECTED" ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : null}
              {verif?.status ?? "UNSUBMITTED"}
            </span>
          </div>

          {verif && verif.status !== "UNSUBMITTED" ? (
            <div className="mt-4 rounded-xl border border-ink-600/60 bg-ink-900/60 p-4 text-sm text-ink-200">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold-400" />
                <span className="truncate text-ink-100">{verif.fileName}</span>
              </div>
              {verif.monthlyIncomeUsd ? (
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <CircleDollarSign className="h-3.5 w-3.5 text-gold-400" />
                  Verified monthly income:{" "}
                  <span className="font-mono text-ink-100">
                    ${verif.monthlyIncomeUsd.toLocaleString()}
                  </span>
                </div>
              ) : null}
              {verif.createdAt ? (
                <div className="mt-0.5 text-xs">
                  Uploaded {formatDateTime(verif.createdAt)}
                  {verif.reviewedAt ? ` · Reviewed ${formatDateTime(verif.reviewedAt)}` : ""}
                </div>
              ) : null}
              {verif.notes ? (
                <div className="mt-2 rounded-lg border border-ink-600/60 bg-ink-950/60 p-2 text-xs text-ink-200">
                  Reviewer note: {verif.notes}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <label className="relative rounded-2xl border-2 border-dashed border-ink-500/70 bg-ink-900/60 p-6 text-center md:col-span-2 cursor-pointer hover:border-gold-700/40 hover:bg-gold-900/10 transition-colors">
              <UploadCloud className="mx-auto h-8 w-8 text-gold-400" />
              <div className="mt-2 font-medium text-ink-100">Drop a PDF or image</div>
              <div className="text-xs text-ink-200">Up to 10 MB · PDF / PNG / JPG</div>
              <button className="btn-primary mt-4" type="button" disabled>
                {uploading ? "Uploading…" : "Browse files"}
              </button>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/jpg"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            <div className="space-y-3">
              <div>
                <label className="label">Monthly income (USD, optional)</label>
                <input
                  className="input"
                  placeholder="e.g. 1400"
                  value={monthlyIncomeUsd}
                  onChange={(e) => setMonthlyIncomeUsd(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-xs">
                {[
                  "Valid ID cross-check",
                  "3-month income window",
                  "Wallet-signed submission",
                  "Approver countersign",
                ].map((x) => (
                  <div
                    key={x}
                    className="flex items-center gap-2 rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2 text-ink-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-gold-400" />
                    {x}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {profile?.transactions && profile.transactions.length > 0 ? (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
                Transactions
              </div>
              <div className="font-display text-xl font-semibold text-ink-100">
                Recent ledger entries
              </div>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {profile.transactions.slice(0, 10).map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-ink-600/50 bg-ink-900/50 px-3 py-2.5"
              >
                <div>
                  <div className="font-medium text-ink-100">
                    {t.type.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-ink-200">
                    {formatDateTime(t.at)}
                    {t.note ? ` · ${t.note}` : ""}
                    {t.txHash ? (
                      <span className="ml-2 font-mono text-ink-300">
                        tx {t.txHash.slice(0, 10)}…
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="font-mono text-gold-300">
                  {t.type === "INSTALLMENT_PAID" || t.type === "LOAN_REPAID" ? "-" : "+"}
                  {t.amount.toFixed(4)} ETH
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function LimitCard({
  label,
  data,
}: {
  label: string;
  data: { limit: number; borrowed: number; remaining: number };
}) {
  const pct = data.limit > 0 ? Math.round((data.borrowed / data.limit) * 100) : 0;
  return (
    <div className="rounded-xl border border-ink-600/60 bg-ink-900/60 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-ink-200">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold text-ink-100">
        {data.remaining.toFixed(2)} / {data.limit.toFixed(2)} ETH
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-ink-200">
        Used {data.borrowed.toFixed(2)} ETH ({pct}%)
      </div>
    </div>
  );
}

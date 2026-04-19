import { useAccount } from "wagmi";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { shortAddress } from "@/lib/utils";
import { UploadCloud, CheckCircle2, ShieldCheck, Copy } from "lucide-react";
import toast from "react-hot-toast";

export function Profile() {
  const { address, chain } = useAccount();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Identity"
        title="Your Profile"
        description="Your wallet is your identity. Profile metadata and income verification make you eligible for larger loan tiers."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="label">Display name</label>
              <input className="input" placeholder="Md. Bokhtiar Rahman" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" placeholder="you@example.com" type="email" />
            </div>
            <div>
              <label className="label">Country</label>
              <select className="input">
                <option>Bangladesh</option>
                <option>Nigeria</option>
                <option>Indonesia</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <div className="input flex items-center justify-between">
                <span>Borrower</span>
                <span className="badge-gold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Tier 4
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="btn-primary">Save changes</button>
            <button className="btn-ghost">Cancel</button>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Wallet</div>
          <div className="font-display text-xl font-semibold text-ink-100">
            {shortAddress(address, 6)}
          </div>
          <div className="mt-1 text-xs text-ink-200">
            Network: <span className="text-gold-300">{chain?.name ?? "Unknown"}</span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2.5">
            <span className="truncate font-mono text-xs text-ink-100">{address ?? "—"}</span>
            <button
              className="ml-2 inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200"
              onClick={() => {
                if (address) {
                  navigator.clipboard.writeText(address);
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
              <span>SIWE session</span>
              <span className="badge-green">Active</span>
            </li>
            <li className="flex items-center justify-between text-ink-200">
              <span>Role on-chain</span>
              <span className="badge-gold">Borrower</span>
            </li>
            <li className="flex items-center justify-between text-ink-200">
              <span>2FA</span>
              <span className="badge">Wallet-native</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-1 text-xs uppercase tracking-[0.22em] text-ink-200">Income Verification</div>
        <div className="font-display text-xl font-semibold text-ink-100">Raise your borrowing ceiling</div>
        <p className="mt-1 max-w-2xl text-sm text-ink-200">
          Upload proof of monthly income (bank statement, payslip, or invoices). An approver will
          review and countersign — your verified status is recorded on-chain.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-dashed border-ink-500/70 bg-ink-900/60 p-6 text-center md:col-span-2">
            <UploadCloud className="mx-auto h-8 w-8 text-gold-400" />
            <div className="mt-2 font-medium text-ink-100">Drop a PDF or image</div>
            <div className="text-xs text-ink-200">Up to 10 MB · PDF / PNG / JPG</div>
            <button className="btn-primary mt-4">Browse files</button>
          </div>
          <div className="space-y-2 text-sm">
            {[
              "Valid ID cross-check",
              "3-month income window",
              "Wallet-signed submission",
              "Approver countersign",
            ].map((x) => (
              <div key={x} className="flex items-center gap-2 rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2 text-ink-200">
                <CheckCircle2 className="h-4 w-4 text-gold-400" />
                {x}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

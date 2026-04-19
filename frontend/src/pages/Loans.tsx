import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FilePlus2, Coins, ArrowUpRight, Filter } from "lucide-react";

type Status = "PENDING" | "APPROVED" | "ACTIVE" | "REPAID" | "REJECTED";

const demoLoans: Array<{
  id: string;
  principal: string;
  term: number;
  apr: string;
  status: Status;
  purpose: string;
  created: string;
}> = [
  { id: "#1024", principal: "5.00 ETH", term: 12, apr: "8.0%", status: "ACTIVE", purpose: "Inventory restock", created: "Mar 12, 2026" },
  { id: "#1018", principal: "2.50 ETH", term: 6, apr: "8.0%", status: "APPROVED", purpose: "Equipment financing", created: "Mar 08, 2026" },
  { id: "#1012", principal: "1.20 ETH", term: 3, apr: "8.0%", status: "PENDING", purpose: "Working capital", created: "Mar 02, 2026" },
  { id: "#0983", principal: "10.00 ETH", term: 24, apr: "8.0%", status: "REPAID", purpose: "Vehicle purchase", created: "Jan 22, 2026" },
  { id: "#0921", principal: "0.80 ETH", term: 6, apr: "8.0%", status: "REJECTED", purpose: "Unverified income", created: "Jan 04, 2026" },
];

const statusStyle: Record<Status, string> = {
  PENDING: "badge-blue",
  APPROVED: "badge-gold",
  ACTIVE: "badge-gold",
  REPAID: "badge-green",
  REJECTED: "badge-red",
};

export function Loans() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Loans"
        title="Your Loan Portfolio"
        description="Every loan you've requested, approved, or repaid — with an immutable on-chain link for each state transition."
        right={
          <>
            <button className="btn-ghost">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <Link to="/app/loans/new" className="btn-primary">
              <FilePlus2 className="h-4 w-4" />
              Request Loan
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Requested", value: "5" },
          { label: "Currently Active", value: "2" },
          { label: "Outstanding", value: "4.50 ETH" },
          { label: "Lifetime Repaid", value: "11.20 ETH" },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-700/50 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-ink-200">
            <Coins className="h-4 w-4 text-gold-400" />
            Showing {demoLoans.length} loans
          </div>
          <span className="text-xs text-ink-200">Sort by <span className="text-gold-300">Newest</span></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/60 text-[11px] uppercase tracking-[0.2em] text-ink-200">
              <tr>
                <th className="px-6 py-3 text-left">Loan</th>
                <th className="px-6 py-3 text-left">Principal</th>
                <th className="px-6 py-3 text-left">Term</th>
                <th className="px-6 py-3 text-left">APR</th>
                <th className="px-6 py-3 text-left">Purpose</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {demoLoans.map((l) => (
                <tr key={l.id} className="border-t border-ink-700/50 transition-colors hover:bg-ink-800/40">
                  <td className="px-6 py-4 font-mono text-gold-300">{l.id}</td>
                  <td className="px-6 py-4 text-ink-100">{l.principal}</td>
                  <td className="px-6 py-4 text-ink-200">{l.term} mo</td>
                  <td className="px-6 py-4 text-ink-200">{l.apr}</td>
                  <td className="px-6 py-4 text-ink-100">{l.purpose}</td>
                  <td className="px-6 py-4">
                    <span className={statusStyle[l.status]}>{l.status}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-ink-200">{l.created}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200">
                      Details <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

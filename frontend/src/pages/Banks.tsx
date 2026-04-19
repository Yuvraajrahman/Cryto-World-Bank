import { SectionHeader } from "@/components/ui/SectionHeader";
import { Building2, Banknote, Landmark, Users, Activity, MapPin } from "lucide-react";

export function Banks() {
  const nationalBanks = [
    { name: "Bangladesh National Bank", j: "Bangladesh", locals: 4, alloc: 420, util: 72 },
    { name: "Nigeria National Bank", j: "Nigeria", locals: 3, alloc: 380, util: 66 },
    { name: "Indonesia National Bank", j: "Indonesia", locals: 5, alloc: 310, util: 58 },
  ];
  const localBanks = [
    { name: "Dhaka Local Bank", parent: "Bangladesh NB", alloc: 90, borrowers: 48 },
    { name: "Chittagong Local Bank", parent: "Bangladesh NB", alloc: 70, borrowers: 31 },
    { name: "Lagos Local Bank", parent: "Nigeria NB", alloc: 110, borrowers: 62 },
    { name: "Abuja Local Bank", parent: "Nigeria NB", alloc: 85, borrowers: 41 },
    { name: "Jakarta Local Bank", parent: "Indonesia NB", alloc: 95, borrowers: 53 },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Network"
        title="Bank Hierarchy"
        description="The living map of participating institutions — registered, capitalized, and lending."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "World Bank", value: "1", icon: Landmark, hint: "Tier 1 reserve" },
          { label: "National Banks", value: "3", icon: Building2, hint: "Tier 2 · 3 jurisdictions" },
          { label: "Local Banks", value: "12", icon: Banknote, hint: "Tier 3 · 9 regions" },
          { label: "Borrowers", value: "213", icon: Users, hint: "Tier 4 · verified" },
        ].map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="stat card-hover">
            <div className="flex items-center justify-between">
              <span className="stat-label">{label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/20 text-gold-300">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="text-xs text-ink-200">{hint}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Tier 2</div>
            <div className="font-display text-xl font-semibold text-ink-100">National Banks</div>
          </div>
          <span className="badge">3.00% APR from reserve</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.2em] text-ink-200">
                <th className="py-2 pr-4">Bank</th>
                <th className="py-2 pr-4">Jurisdiction</th>
                <th className="py-2 pr-4">Local Banks</th>
                <th className="py-2 pr-4">Allocated</th>
                <th className="py-2 pr-4">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {nationalBanks.map((b) => (
                <tr key={b.name} className="border-t border-ink-700/50">
                  <td className="py-3 pr-4 font-medium text-ink-100">{b.name}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5 text-ink-200">
                      <MapPin className="h-3.5 w-3.5 text-gold-400" />
                      {b.j}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-ink-200">{b.locals}</td>
                  <td className="py-3 pr-4 font-mono text-gold-300">{b.alloc} ETH</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-ink-700">
                        <div
                          className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                          style={{ width: `${b.util}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink-200">{b.util}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Tier 3</div>
            <div className="font-display text-xl font-semibold text-ink-100">Local Banks</div>
          </div>
          <span className="badge">5.00% APR from national</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {localBanks.map((b) => (
            <div key={b.name} className="rounded-xl border border-ink-600/60 bg-ink-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-ink-100">{b.name}</div>
                <Activity className="h-4 w-4 text-gold-400" />
              </div>
              <div className="mt-1 text-xs text-ink-200">Parent · {b.parent}</div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-ink-200">Allocated</span>
                <span className="font-mono text-gold-300">{b.alloc} ETH</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-200">Borrowers</span>
                <span className="font-mono text-ink-100">{b.borrowers}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

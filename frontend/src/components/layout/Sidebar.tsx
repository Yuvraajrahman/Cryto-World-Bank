import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Landmark,
  Coins,
  FilePlus2,
  Receipt,
  MessageSquare,
  UserRound,
  ShieldAlert,
  Settings2,
  Network,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/app/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/app/reserve", label: "World Reserve", icon: Landmark },
  { to: "/app/banks", label: "Bank Network", icon: Network },
  { to: "/app/loans", label: "My Loans", icon: Coins },
  { to: "/app/loans/new", label: "Request Loan", icon: FilePlus2 },
  { to: "/app/installments", label: "Installments", icon: Receipt },
  { to: "/app/market", label: "Markets", icon: LineChart },
  { to: "/app/chat", label: "Messages", icon: MessageSquare },
  { to: "/app/risk", label: "Risk Console", icon: ShieldAlert },
  { to: "/app/profile", label: "Profile", icon: UserRound },
  { to: "/app/admin", label: "Admin", icon: Settings2 },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-ink-700/60 bg-ink-900/60 backdrop-blur-sm lg:flex lg:flex-col">
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        <div className="px-3 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-ink-200">
          Navigation
        </div>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition-all",
                isActive
                  ? "border-gold-700/40 bg-gold-900/15 text-gold-200 shadow-gold-soft"
                  : "text-ink-100 hover:border-ink-500/60 hover:bg-ink-800/60 hover:text-gold-300",
              )
            }
          >
            <Icon className="h-4 w-4 opacity-90 group-hover:opacity-100" />
            <span>{label}</span>
          </NavLink>
        ))}
        <div className="mt-6 rounded-xl border border-gold-700/30 bg-gradient-to-b from-gold-900/10 to-transparent p-4">
          <div className="mb-1 text-[10px] uppercase tracking-[0.24em] text-gold-400">
            Security Notice
          </div>
          <p className="text-xs leading-relaxed text-ink-200">
            Testnet deployment. All transactions use test tokens with no real
            monetary value.
          </p>
        </div>
      </div>
    </aside>
  );
}

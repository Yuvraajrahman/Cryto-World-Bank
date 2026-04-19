import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  className?: string;
}

export function Stat({ label, value, icon: Icon, delta, hint, className }: StatProps) {
  return (
    <div className={cn("stat card-hover", className)}>
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        {Icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/20 text-gold-300">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className="stat-value">{value}</div>
      <div className="flex items-center gap-2 text-xs">
        {delta ? (
          <span
            className={cn(
              "font-medium",
              delta.positive ? "text-emerald-400" : "text-red-400",
            )}
          >
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        ) : null}
        {hint ? <span className="text-ink-200">{hint}</span> : null}
      </div>
    </div>
  );
}

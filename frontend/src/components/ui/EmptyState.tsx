import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-700/40 bg-gold-900/20 text-gold-300">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-display text-xl font-semibold text-ink-100">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-ink-200">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

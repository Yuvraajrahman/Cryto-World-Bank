import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  right,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        {eyebrow ? (
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400">
            <span className="h-px w-8 bg-gradient-to-r from-gold-700/0 via-gold-500/70 to-gold-700/0" />
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-100 text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-ink-200">{description}</p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

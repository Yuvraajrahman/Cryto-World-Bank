import { cn } from "@/lib/utils";

export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="cwb-logo-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff4c4" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#7a5c13" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#060606" />
      <rect
        x="0.75"
        y="0.75"
        width="62.5"
        height="62.5"
        rx="13.25"
        fill="none"
        stroke="url(#cwb-logo-g)"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <path
        d="M18 44 V24 L32 16 L46 24 V44 H40 V28 L32 23 L24 28 V44 Z"
        fill="url(#cwb-logo-g)"
      />
      <rect x="28" y="36" width="8" height="8" fill="#060606" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <Logo size={28} />
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-wide gold-text">
          Crypto World Bank
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-ink-200">
          Decentralized · Reserve
        </span>
      </div>
    </div>
  );
}

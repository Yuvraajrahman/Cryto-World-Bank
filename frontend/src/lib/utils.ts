import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function shortAddress(addr?: string, chars = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, 2 + chars)}…${addr.slice(-chars)}`;
}

export function formatUsd(n: number, opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    ...opts,
  }).format(n);
}

export function formatEth(wei: bigint | string, decimals = 4): string {
  const value = typeof wei === "string" ? BigInt(wei) : wei;
  const divisor = 10n ** 18n;
  const whole = value / divisor;
  const frac = value % divisor;
  const fracStr = (Number(frac) / Number(divisor)).toFixed(decimals).slice(2);
  return `${whole.toString()}.${fracStr}`;
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

export function formatPercent(n: number, digits = 2): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function formatDateTime(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

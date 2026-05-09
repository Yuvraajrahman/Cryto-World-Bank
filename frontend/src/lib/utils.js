import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function shortAddress(addr, chars = 4) {
    if (!addr)
        return "";
    return `${addr.slice(0, 2 + chars)}…${addr.slice(-chars)}`;
}
export function formatUsd(n, opts = {}) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        ...opts,
    }).format(n);
}
export function formatEth(wei, decimals = 4) {
    const value = typeof wei === "string" ? BigInt(wei) : wei;
    const divisor = 10n ** 18n;
    const whole = value / divisor;
    const frac = value % divisor;
    const fracStr = (Number(frac) / Number(divisor)).toFixed(decimals).slice(2);
    return `${whole.toString()}.${fracStr}`;
}
export function formatCompactNumber(n) {
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}
export function formatPercent(n, digits = 2) {
    return `${(n * 100).toFixed(digits)}%`;
}
export function formatDateTime(d) {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

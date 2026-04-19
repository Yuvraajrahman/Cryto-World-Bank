import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export function Logo({ className, size = 32 }) {
    return (_jsxs("svg", { viewBox: "0 0 64 64", width: size, height: size, className: cn("shrink-0", className), "aria-hidden": true, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "cwb-logo-g", x1: "0", x2: "1", y1: "0", y2: "1", children: [_jsx("stop", { offset: "0", stopColor: "#fff4c4" }), _jsx("stop", { offset: "0.5", stopColor: "#d4af37" }), _jsx("stop", { offset: "1", stopColor: "#7a5c13" })] }) }), _jsx("rect", { width: "64", height: "64", rx: "14", fill: "#060606" }), _jsx("rect", { x: "0.75", y: "0.75", width: "62.5", height: "62.5", rx: "13.25", fill: "none", stroke: "url(#cwb-logo-g)", strokeOpacity: "0.5", strokeWidth: "1.5" }), _jsx("path", { d: "M18 44 V24 L32 16 L46 24 V44 H40 V28 L32 23 L24 28 V44 Z", fill: "url(#cwb-logo-g)" }), _jsx("rect", { x: "28", y: "36", width: "8", height: "8", fill: "#060606" })] }));
}
export function Wordmark({ className }) {
    return (_jsxs("div", { className: cn("flex items-center gap-2.5 select-none", className), children: [_jsx(Logo, { size: 28 }), _jsxs("div", { className: "flex flex-col leading-none", children: [_jsx("span", { className: "font-display text-lg font-semibold tracking-wide gold-text", children: "Crypto World Bank" }), _jsx("span", { className: "text-[10px] uppercase tracking-[0.25em] text-ink-200", children: "Decentralized \u00B7 Reserve" })] })] }));
}

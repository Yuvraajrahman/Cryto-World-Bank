import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export function Stat({ label, value, icon: Icon, delta, hint, className }) {
    return (_jsxs("div", { className: cn("stat card-hover", className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "stat-label", children: label }), Icon ? (_jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/20 text-gold-300", children: _jsx(Icon, { className: "h-4 w-4" }) })) : null] }), _jsx("div", { className: "stat-value", children: value }), _jsxs("div", { className: "flex items-center gap-2 text-xs", children: [delta ? (_jsxs("span", { className: cn("font-medium", delta.positive ? "text-emerald-400" : "text-red-400"), children: [delta.positive ? "▲" : "▼", " ", delta.value] })) : null, hint ? _jsx("span", { className: "text-ink-200", children: hint }) : null] })] }));
}

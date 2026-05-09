import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export function SectionHeader({ eyebrow, title, description, right, className, }) {
    return (_jsxs("div", { className: cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className), children: [_jsxs("div", { children: [eyebrow ? (_jsxs("div", { className: "mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400", children: [_jsx("span", { className: "h-px w-8 bg-gradient-to-r from-gold-700/0 via-gold-500/70 to-gold-700/0" }), eyebrow] })) : null, _jsx("h1", { className: "font-display text-3xl sm:text-4xl font-semibold text-ink-100 text-balance", children: title }), description ? (_jsx("p", { className: "mt-2 max-w-2xl text-sm sm:text-base text-ink-200", children: description })) : null] }), right ? _jsx("div", { className: "flex items-center gap-2", children: right }) : null] }));
}

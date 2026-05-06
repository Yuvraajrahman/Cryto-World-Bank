import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export function EmptyState({ icon: Icon, title, description, action, className, }) {
    return (_jsxs("div", { className: cn("card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className), children: [_jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-full border border-gold-700/40 bg-gold-900/20 text-gold-300", children: _jsx(Icon, { className: "h-6 w-6" }) }), _jsx("h3", { className: "font-display text-xl font-semibold text-ink-100", children: title }), description ? (_jsx("p", { className: "max-w-md text-sm text-ink-200", children: description })) : null, action] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
export function NotFound() {
    return (_jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center", children: [_jsx(Logo, { size: 48 }), _jsx("div", { className: "font-display text-5xl font-semibold gold-text", children: "404" }), _jsx("p", { className: "max-w-md text-ink-200", children: "That vault doesn't exist. It may have been moved, renamed, or never existed in the first place." }), _jsx(Link, { to: "/", className: "btn-primary", children: "Back to home" })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Send, Sparkles, CircleDot, Zap, Network, Wand2, Loader2, } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { api } from "@/lib/api";
function uid() {
    return Math.random().toString(36).slice(2, 11);
}
export function AIAssistant() {
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [pending, setPending] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const scrollerRef = useRef(null);
    useEffect(() => {
        (async () => {
            try {
                const r = await api.get("/api/chatbot/welcome");
                setMessages([
                    {
                        id: uid(),
                        role: "bot",
                        body: r.greeting,
                        suggestions: r.suggestions,
                    },
                ]);
                setSuggestions(r.suggestions);
            }
            catch {
                setMessages([
                    {
                        id: uid(),
                        role: "bot",
                        body: "Welcome to the Crypto World Bank AI assistant.",
                    },
                ]);
            }
        })();
    }, []);
    useEffect(() => {
        scrollerRef.current?.scrollTo({
            top: scrollerRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, pending]);
    async function send(text) {
        const body = (text ?? draft).trim();
        if (!body || pending)
            return;
        setDraft("");
        setMessages((m) => [...m, { id: uid(), role: "user", body }]);
        setPending(true);
        try {
            const r = await api.post("/api/chatbot/message", {
                message: body,
            });
            setMessages((m) => [
                ...m,
                {
                    id: uid(),
                    role: "bot",
                    body: r.reply,
                    actions: r.actions,
                    suggestions: r.suggestions,
                    meta: { intent: r.intent, confidence: r.confidence, model: r.model },
                },
            ]);
            setSuggestions(r.suggestions ?? []);
        }
        catch (err) {
            setMessages((m) => [
                ...m,
                {
                    id: uid(),
                    role: "bot",
                    body: err instanceof Error
                        ? `Sorry, I hit an error: ${err.message}`
                        : "Sorry, I hit an error.",
                },
            ]);
        }
        finally {
            setPending(false);
        }
    }
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "AI", title: "Crypto World Bank Assistant", description: "Ask anything about your borrowing limits, installments, bank hierarchy, or platform policies. Intents are classified in real time and routed to the right data.", right: _jsxs("span", { className: "badge-gold", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5" }), "Rules-v0 \u00B7 Sprint 3 ML swap-in ready"] }) }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]", children: [_jsxs("div", { className: "card flex min-h-[640px] flex-col overflow-hidden p-0", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-ink-700/60 bg-gradient-to-r from-gold-900/20 to-transparent px-5 py-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/30 text-gold-300", children: _jsx(Bot, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-ink-100", children: "CWB Assistant" }), _jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-gold-300", children: "Role-aware \u00B7 intent-routed" })] })] }), _jsxs("span", { className: "flex items-center gap-1.5 text-xs text-emerald-300", children: [_jsx(CircleDot, { className: "h-3 w-3" }), "Online"] })] }), _jsxs("div", { ref: scrollerRef, className: "flex-1 space-y-3 overflow-y-auto p-5", children: [messages.map((m) => (_jsx("div", { className: m.role === "user" ? "flex justify-end" : "flex justify-start", children: _jsxs("div", { className: `max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === "user"
                                                ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                                                : "border border-ink-600/60 bg-ink-900/60 text-ink-100"}`, children: [m.role === "bot" && m.meta ? (_jsxs("div", { className: "mb-1 text-[10px] uppercase tracking-[0.22em] text-gold-300", children: [m.meta.intent.replace(/_/g, " "), " \u00B7", " ", Math.round(m.meta.confidence * 100), "%"] })) : null, _jsx("div", { className: "whitespace-pre-line", children: m.body }), m.actions && m.actions.length > 0 ? (_jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: m.actions.map((a) => (_jsxs(Link, { to: a.href, className: "rounded-full border border-gold-700/40 bg-gold-900/20 px-2.5 py-0.5 text-[11px] text-gold-200 hover:bg-gold-900/40", children: [a.label, " \u2192"] }, a.href))) })) : null] }) }, m.id))), pending ? (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "rounded-2xl border border-ink-600/60 bg-ink-900/60 px-4 py-3 text-sm text-ink-200", children: _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) }) })) : null] }), suggestions.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-1.5 border-t border-ink-700/60 bg-ink-900/40 px-5 py-3", children: suggestions.map((s) => (_jsx("button", { onClick: () => send(s), className: "rounded-full border border-ink-600/60 bg-ink-900/80 px-3 py-1 text-xs text-ink-100 hover:border-gold-700/40 hover:text-gold-200", children: s }, s))) })) : null, _jsx("div", { className: "border-t border-ink-700/60 p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input", placeholder: "Ask about limits, loans, banks, policy\u2026", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && send(), disabled: pending }), _jsxs("button", { className: "btn-primary", onClick: () => send(), disabled: pending, children: [_jsx(Send, { className: "h-4 w-4" }), "Send"] })] }) })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Wand2, { className: "h-4 w-4 text-gold-400" }), "What it can do"] }), _jsxs("ul", { className: "space-y-2 text-sm text-ink-100", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Explain borrowing limits and eligibility"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Show your next installment + due date"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "List your recent loan requests and statuses"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Walk through the World \u2192 National \u2192 Local \u2192 Borrower hierarchy"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Route approvers to the pending queue"] })] })] }), _jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Network, { className: "h-4 w-4 text-gold-400" }), "How it works"] }), _jsxs("p", { className: "text-sm text-ink-200", children: ["The current backend classifies your message with a keyword-based intent router (", _jsx("span", { className: "font-mono text-gold-300", children: "cwb-intent-rules-v0" }), "). Sprint 3 replaces this with a transformer classifier + retrieval-augmented responses over your on-chain history \u2014 the UI and API shape stay identical."] })] })] })] })] }));
}

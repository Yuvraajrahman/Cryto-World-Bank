import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
function uuid() {
    return Math.random().toString(36).slice(2, 11);
}
export function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const scrollerRef = useRef(null);
    useEffect(() => {
        if (!open || messages.length > 0)
            return;
        let cancelled = false;
        (async () => {
            try {
                const r = await api.get("/api/chatbot/welcome");
                if (cancelled)
                    return;
                setMessages([{ id: uuid(), role: "bot", body: r.greeting, suggestions: r.suggestions }]);
                setSuggestions(r.suggestions);
            }
            catch {
                setMessages([
                    {
                        id: uuid(),
                        role: "bot",
                        body: "Hi! I'm your Crypto World Bank assistant. Ask me about limits, installments, or the bank network.",
                    },
                ]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, messages.length]);
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
        setMessages((m) => [...m, { id: uuid(), role: "user", body }]);
        setPending(true);
        try {
            const r = await api.post("/api/chatbot/message", { message: body });
            setMessages((m) => [
                ...m,
                {
                    id: uuid(),
                    role: "bot",
                    body: r.reply,
                    actions: r.actions,
                    suggestions: r.suggestions,
                    meta: { intent: r.intent, confidence: r.confidence },
                },
            ]);
            setSuggestions(r.suggestions ?? []);
        }
        catch (err) {
            setMessages((m) => [
                ...m,
                {
                    id: uuid(),
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
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setOpen((o) => !o), "aria-label": "Open AI assistant", className: "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-gold-700/50 bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900 shadow-gold-soft transition-transform hover:scale-105", children: open ? _jsx(X, { className: "h-6 w-6" }) : _jsx(Bot, { className: "h-6 w-6" }) }), open ? (_jsxs("div", { className: "fixed bottom-24 right-6 z-40 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gold-700/40 bg-ink-950/95 shadow-2xl backdrop-blur-xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-ink-700/60 bg-gradient-to-r from-gold-900/20 to-transparent px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/30 text-gold-300", children: _jsx(Sparkles, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-ink-100", children: "CWB Assistant" }), _jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-gold-300", children: "Rules-v0 \u00B7 Sprint 3 ML swap-in ready" })] })] }), _jsxs(Link, { to: "/app/assistant", onClick: () => setOpen(false), className: "btn-ghost py-1 text-xs", title: "Open full view", children: [_jsx(MessageSquare, { className: "h-3.5 w-3.5" }), "Expand"] })] }), _jsxs("div", { ref: scrollerRef, className: "flex-1 space-y-3 overflow-y-auto p-3", children: [messages.map((m) => (_jsx("div", { className: m.role === "user" ? "flex justify-end" : "flex justify-start", children: _jsxs("div", { className: `max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user"
                                        ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                                        : "border border-ink-600/60 bg-ink-900/60 text-ink-100"}`, children: [_jsx("div", { className: "whitespace-pre-line", children: m.body }), m.actions && m.actions.length > 0 ? (_jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: m.actions.map((a) => (_jsxs(Link, { to: a.href, onClick: () => setOpen(false), className: "rounded-full border border-gold-700/40 bg-gold-900/20 px-2 py-0.5 text-[11px] text-gold-200 hover:bg-gold-900/40", children: [a.label, " \u2192"] }, a.href))) })) : null] }) }, m.id))), pending ? (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "rounded-2xl border border-ink-600/60 bg-ink-900/60 px-3 py-2 text-sm text-ink-200", children: _jsxs("span", { className: "inline-flex gap-1", children: [_jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" }), _jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400 [animation-delay:0.15s]" }), _jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400 [animation-delay:0.3s]" })] }) }) })) : null] }), suggestions.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-1.5 border-t border-ink-700/60 bg-ink-900/40 px-3 py-2", children: suggestions.slice(0, 3).map((s) => (_jsx("button", { onClick: () => send(s), className: "rounded-full border border-ink-600/60 bg-ink-900/80 px-2.5 py-1 text-[11px] text-ink-100 hover:border-gold-700/40 hover:text-gold-200", children: s }, s))) })) : null, _jsx("div", { className: "border-t border-ink-700/60 p-3", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input py-2 text-sm", placeholder: "Ask about limits, loans, banks\u2026", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && send(), disabled: pending }), _jsx("button", { className: "btn-primary px-3 py-2 text-sm", onClick: () => send(), disabled: pending, children: _jsx(Send, { className: "h-3.5 w-3.5" }) })] }) })] })) : null] }));
}

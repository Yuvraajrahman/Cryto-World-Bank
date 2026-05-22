import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "@/lib/store";
import { streamChat } from "@/lib/aiStream";
import { getFeatureKeyFromPath, getRecommendedPrompts } from "@/lib/assistantPrompts";
import { MarkdownMessage } from "@/components/chatbot/MarkdownMessage";
function uuid() {
    return Math.random().toString(36).slice(2, 11);
}
export function ChatbotWidget() {
    const { pathname } = useLocation();
    const role = useSession((s) => s.role);
    const user = useSession((s) => s.user);
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const scrollerRef = useRef(null);
    useEffect(() => {
        if (!open || messages.length > 0)
            return;
        const name = user?.displayName?.split(" ")?.[0] ?? "there";
        setMessages([
            {
                id: uuid(),
                role: "bot",
                body: `Hi ${name}! Ask me about this page, or tap a suggested question.`,
            },
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, messages.length, user?.displayName]);
    useEffect(() => {
        scrollerRef.current?.scrollTo({
            top: scrollerRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, pending]);
    const featureKey = getFeatureKeyFromPath(pathname);
    const suggestions = getRecommendedPrompts(featureKey, role).slice(0, 3);
    function toStreamMessages(list) {
        return list.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.body,
        }));
    }
    async function send(text) {
        const body = (text ?? draft).trim();
        if (!body || pending)
            return;
        setDraft("");
        const botId = uuid();
        setMessages((m) => [
            ...m,
            { id: uuid(), role: "user", body },
            { id: botId, role: "bot", body: "", meta: { model: "…" } },
        ]);
        setPending(true);
        try {
            const snapshot = toStreamMessages([
                ...messages,
                { id: uuid(), role: "user", body },
            ]);
            const meta = await streamChat({
                messages: snapshot,
                featureKey,
                route: pathname,
                roleHint: role,
                onMeta: (m) => {
                    setMessages((prev) => prev.map((x) => (x.id === botId ? { ...x, meta: { model: m.model } } : x)));
                },
                onToken: (tok) => {
                    setMessages((prev) => prev.map((x) => (x.id === botId ? { ...x, body: x.body + tok } : x)));
                },
                onError: (msg) => {
                    setMessages((prev) => prev.map((x) => x.id === botId
                        ? { ...x, body: x.body || `Sorry, I hit an error: ${msg}` }
                        : x));
                },
            });
            if (meta.model) {
                setMessages((prev) => prev.map((x) => (x.id === botId ? { ...x, meta: { model: meta.model } } : x)));
            }
        }
        catch (err) {
            setMessages((prev) => prev.map((x) => x.id === botId
                ? {
                    ...x,
                    body: err instanceof Error
                        ? `Sorry, I hit an error: ${err.message}`
                        : "Sorry, I hit an error.",
                }
                : x));
        }
        finally {
            setPending(false);
        }
    }
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setOpen((o) => !o), "aria-label": "Open AI assistant", className: "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-gold-700/50 bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900 shadow-gold-soft transition-transform hover:scale-105", children: open ? _jsx(X, { className: "h-6 w-6" }) : _jsx(Bot, { className: "h-6 w-6" }) }), open ? (_jsxs("div", { className: "fixed bottom-24 right-6 z-40 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gold-700/40 bg-ink-950/95 shadow-2xl backdrop-blur-xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-ink-700/60 bg-gradient-to-r from-gold-900/20 to-transparent px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/30 text-gold-300", children: _jsx(Sparkles, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-ink-100", children: "CWB Assistant" }), _jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-gold-300", children: "Local model \u00B7 streaming" })] })] }), _jsxs(Link, { to: "/app/assistant", onClick: () => setOpen(false), className: "btn-ghost py-1 text-xs", title: "Open full view", children: [_jsx(MessageSquare, { className: "h-3.5 w-3.5" }), "Expand"] })] }), _jsxs("div", { ref: scrollerRef, className: "flex-1 space-y-3 overflow-y-auto p-3", children: [messages.map((m) => (_jsx("div", { className: m.role === "user" ? "flex justify-end" : "flex justify-start", children: _jsxs("div", { className: `max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user"
                                        ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                                        : "border border-ink-600/60 bg-ink-900/60 text-ink-100"}`, children: [m.role === "bot" && m.meta?.model ? (_jsx("div", { className: "mb-0.5 text-[10px] uppercase tracking-[0.22em] text-gold-300", children: m.meta.model })) : null, _jsx(MarkdownMessage, { text: m.body })] }) }, m.id))), pending ? (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "rounded-2xl border border-ink-600/60 bg-ink-900/60 px-3 py-2 text-sm text-ink-200", children: _jsxs("span", { className: "inline-flex gap-1", children: [_jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" }), _jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400 [animation-delay:0.15s]" }), _jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400 [animation-delay:0.3s]" })] }) }) })) : null] }), suggestions.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-1.5 border-t border-ink-700/60 bg-ink-900/40 px-3 py-2", children: suggestions.map((s) => (_jsx("button", { onClick: () => send(s), className: "rounded-full border border-ink-600/60 bg-ink-900/80 px-2.5 py-1 text-[11px] text-ink-100 hover:border-gold-700/40 hover:text-gold-200", children: s }, s))) })) : null, _jsx("div", { className: "border-t border-ink-700/60 p-3", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input py-2 text-sm", placeholder: "Ask about limits, loans, banks\u2026", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && send(), disabled: pending }), _jsx("button", { className: "btn-primary px-3 py-2 text-sm", onClick: () => send(), disabled: pending, children: _jsx(Send, { className: "h-3.5 w-3.5" }) })] }) })] })) : null] }));
}

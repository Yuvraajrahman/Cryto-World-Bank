import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, Send, Sparkles, CircleDot, Zap, Network, Wand2, Loader2, } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { streamChat } from "@/lib/aiStream";
import { getFeatureKeyFromPath, getRecommendedPrompts } from "@/lib/assistantPrompts";
import { useSession } from "@/lib/store";
import { MarkdownMessage } from "@/components/chatbot/MarkdownMessage";
function uid() {
    return Math.random().toString(36).slice(2, 11);
}
export function AIAssistant() {
    const { pathname } = useLocation();
    const role = useSession((s) => s.role);
    const user = useSession((s) => s.user);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [pending, setPending] = useState(false);
    const scrollerRef = useRef(null);
    const featureKey = useMemo(() => getFeatureKeyFromPath(pathname), [pathname]);
    const suggestions = useMemo(() => getRecommendedPrompts(featureKey, role), [featureKey, role]);
    useEffect(() => {
        if (messages.length > 0)
            return;
        const name = user?.displayName?.split(" ")?.[0] ?? "there";
        setMessages([
            {
                id: uid(),
                role: "bot",
                body: `Hi ${name}! Ask me anything about this feature, or pick a suggested question below.`,
            },
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.displayName]);
    useEffect(() => {
        scrollerRef.current?.scrollTo({
            top: scrollerRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, pending]);
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
        const botId = uid();
        setMessages((m) => [
            ...m,
            { id: uid(), role: "user", body },
            { id: botId, role: "bot", body: "", meta: { model: "…" } },
        ]);
        setPending(true);
        try {
            const snapshot = toStreamMessages([
                ...messages,
                { id: uid(), role: "user", body },
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
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "AI", title: "Crypto World Bank Assistant", description: "Ask anything about your borrowing limits, installments, bank hierarchy, or platform policies. Intents are classified in real time and routed to the right data.", right: _jsxs("span", { className: "badge-gold", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5" }), "Local model \u00B7 streaming"] }) }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]", children: [_jsxs("div", { className: "card flex min-h-[640px] flex-col overflow-hidden p-0", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-ink-700/60 bg-gradient-to-r from-gold-900/20 to-transparent px-5 py-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/30 text-gold-300", children: _jsx(Bot, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-ink-100", children: "CWB Assistant" }), _jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-gold-300", children: "Role-aware \u00B7 intent-routed" })] })] }), _jsxs("span", { className: "flex items-center gap-1.5 text-xs text-emerald-300", children: [_jsx(CircleDot, { className: "h-3 w-3" }), "Online"] })] }), _jsxs("div", { ref: scrollerRef, className: "flex-1 space-y-3 overflow-y-auto p-5", children: [messages.map((m) => (_jsx("div", { className: m.role === "user" ? "flex justify-end" : "flex justify-start", children: _jsxs("div", { className: `max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === "user"
                                                ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                                                : "border border-ink-600/60 bg-ink-900/60 text-ink-100"}`, children: [m.role === "bot" && m.meta?.model ? (_jsx("div", { className: "mb-1 text-[10px] uppercase tracking-[0.22em] text-gold-300", children: m.meta.model })) : null, _jsx(MarkdownMessage, { text: m.body })] }) }, m.id))), pending ? (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "rounded-2xl border border-ink-600/60 bg-ink-900/60 px-4 py-3 text-sm text-ink-200", children: _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) }) })) : null] }), suggestions.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-1.5 border-t border-ink-700/60 bg-ink-900/40 px-5 py-3", children: suggestions.map((s) => (_jsx("button", { onClick: () => send(s), className: "rounded-full border border-ink-600/60 bg-ink-900/80 px-3 py-1 text-xs text-ink-100 hover:border-gold-700/40 hover:text-gold-200", children: s }, s))) })) : null, _jsx("div", { className: "border-t border-ink-700/60 p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input", placeholder: "Ask about limits, loans, banks, policy\u2026", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && send(), disabled: pending }), _jsxs("button", { className: "btn-primary", onClick: () => send(), disabled: pending, children: [_jsx(Send, { className: "h-4 w-4" }), "Send"] })] }) })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Wand2, { className: "h-4 w-4 text-gold-400" }), "What it can do"] }), _jsxs("ul", { className: "space-y-2 text-sm text-ink-100", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Explain borrowing limits and eligibility"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Show your next installment + due date"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "List your recent loan requests and statuses"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Walk through the World \u2192 National \u2192 Local \u2192 Borrower hierarchy"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Zap, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Route approvers to the pending queue"] })] })] }), _jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Network, { className: "h-4 w-4 text-gold-400" }), "How it works"] }), _jsxs("p", { className: "text-sm text-ink-200", children: ["The current backend classifies your message with a keyword-based intent router (", _jsx("span", { className: "font-mono text-gold-300", children: "cwb-intent-rules-v0" }), "). Sprint 3 replaces this with a transformer classifier + retrieval-augmented responses over your on-chain history \u2014 the UI and API shape stay identical."] })] })] })] })] }));
}

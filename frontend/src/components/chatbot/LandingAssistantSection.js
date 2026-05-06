import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";
import { streamChat } from "@/lib/aiStream";
import { getRecommendedPrompts } from "@/lib/assistantPrompts";
import { MarkdownMessage } from "@/components/chatbot/MarkdownMessage";
function uid() {
    return Math.random().toString(36).slice(2, 11);
}
export function LandingAssistantSection() {
    const featureKey = "landing";
    const route = "/";
    const suggestions = useMemo(() => getRecommendedPrompts(featureKey), []);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [pending, setPending] = useState(false);
    const scrollerRef = useRef(null);
    useEffect(() => {
        if (messages.length > 0)
            return;
        setMessages([
            {
                id: uid(),
                role: "bot",
                body: "Ask anything about Crypto World Bank — how the hierarchy works, what the reserve does, or how to start using the platform.",
            },
        ]);
    }, [messages.length]);
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
                route,
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
    return (_jsx("section", { className: "border-b border-ink-700/40 bg-ink-900/30", children: _jsxs("div", { className: "container-page py-20", children: [_jsxs("div", { className: "mb-10 max-w-3xl", children: [_jsxs("div", { className: "mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400", children: [_jsx("span", { className: "h-px w-8 bg-gold-500/50" }), "Assistant"] }), _jsxs("h2", { className: "font-display text-4xl font-semibold text-ink-100 sm:text-5xl", children: ["Have questions? ", _jsx("span", { className: "gold-text", children: "Ask the agent" }), "."] }), _jsx("p", { className: "mt-4 text-ink-200", children: "Get instant guidance about features, concepts, and how to use the platform. Answers stream live from your local model." })] }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]", children: [_jsxs("div", { className: "card flex min-h-[520px] flex-col overflow-hidden p-0", children: [_jsx("div", { className: "flex items-center justify-between border-b border-ink-700/60 bg-gradient-to-r from-gold-900/20 to-transparent px-5 py-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/30 text-gold-300", children: _jsx(Bot, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-ink-100", children: "CWB Assistant" }), _jsxs("div", { className: "text-[10px] uppercase tracking-[0.22em] text-gold-300", children: [_jsx(Sparkles, { className: "mr-1 inline h-3.5 w-3.5" }), "Local model \u00B7 streaming"] })] })] }) }), _jsxs("div", { ref: scrollerRef, className: "flex-1 space-y-3 overflow-y-auto p-5", children: [messages.map((m) => (_jsx("div", { className: m.role === "user" ? "flex justify-end" : "flex justify-start", children: _jsxs("div", { className: `max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "user"
                                                    ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                                                    : "border border-ink-600/60 bg-ink-900/60 text-ink-100"}`, children: [m.role === "bot" && m.meta?.model ? (_jsx("div", { className: "mb-1 text-[10px] uppercase tracking-[0.22em] text-gold-300", children: m.meta.model })) : null, _jsx(MarkdownMessage, { text: m.body })] }) }, m.id))), pending ? (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "rounded-2xl border border-ink-600/60 bg-ink-900/60 px-4 py-3 text-sm text-ink-200", children: _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) }) })) : null] }), suggestions.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-1.5 border-t border-ink-700/60 bg-ink-900/40 px-4 py-2.5", children: suggestions.slice(0, 6).map((s) => (_jsx("button", { type: "button", onClick: () => send(s), disabled: pending, className: "rounded-full border border-ink-600/60 bg-ink-900/80 px-2.5 py-1 text-[11px] text-ink-100 hover:border-gold-700/40 hover:text-gold-200 disabled:cursor-not-allowed disabled:opacity-50", children: s }, s))) })) : null, _jsx("div", { className: "border-t border-ink-700/60 p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input", placeholder: "Ask about hierarchy, reserves, loans\u2026", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && send(), disabled: pending }), _jsxs("button", { className: "btn-primary", onClick: () => send(), disabled: pending, children: [_jsx(Send, { className: "h-4 w-4" }), "Send"] })] }) })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "card p-5", children: [_jsx("div", { className: "mb-3 text-xs uppercase tracking-[0.22em] text-ink-200", children: "Suggested questions" }), _jsx("div", { className: "flex flex-wrap gap-2", children: suggestions.map((s) => (_jsx("button", { onClick: () => send(s), className: "rounded-full border border-ink-600/60 bg-ink-900/80 px-3 py-1 text-xs text-ink-100 hover:border-gold-700/40 hover:text-gold-200", children: s }, s))) })] }), _jsxs("div", { className: "card p-5", children: [_jsx("div", { className: "mb-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: "Tip" }), _jsx("p", { className: "text-sm text-ink-200", children: "Try asking \u201CWhat should I do next?\u201D after you enter the app \u2014 the suggestions will adapt to the page you\u2019re on." })] })] })] })] }) }));
}

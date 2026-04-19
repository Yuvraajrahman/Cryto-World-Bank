import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

interface ChatbotReply {
  reply: string;
  intent: string;
  confidence: number;
  actions: Array<{ label: string; href: string }>;
  suggestions: string[];
  model: string;
}

interface Msg {
  id: string;
  role: "user" | "bot";
  body: string;
  actions?: Array<{ label: string; href: string }>;
  suggestions?: string[];
  meta?: { intent: string; confidence: number };
}

function uuid(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || messages.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await api.get<{ greeting: string; suggestions: string[] }>(
          "/api/chatbot/welcome",
        );
        if (cancelled) return;
        setMessages([{ id: uuid(), role: "bot", body: r.greeting, suggestions: r.suggestions }]);
        setSuggestions(r.suggestions);
      } catch {
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

  async function send(text?: string) {
    const body = (text ?? draft).trim();
    if (!body || pending) return;
    setDraft("");
    setMessages((m) => [...m, { id: uuid(), role: "user", body }]);
    setPending(true);
    try {
      const r = await api.post<ChatbotReply>("/api/chatbot/message", { message: body });
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
    } catch (err: unknown) {
      setMessages((m) => [
        ...m,
        {
          id: uuid(),
          role: "bot",
          body:
            err instanceof Error
              ? `Sorry, I hit an error: ${err.message}`
              : "Sorry, I hit an error.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI assistant"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-gold-700/50 bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900 shadow-gold-soft transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-6 z-40 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gold-700/40 bg-ink-950/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-ink-700/60 bg-gradient-to-r from-gold-900/20 to-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/30 text-gold-300">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold text-ink-100">
                  CWB Assistant
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-gold-300">
                  Rules-v0 · Sprint 3 ML swap-in ready
                </div>
              </div>
            </div>
            <Link
              to="/app/assistant"
              onClick={() => setOpen(false)}
              className="btn-ghost py-1 text-xs"
              title="Open full view"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Expand
            </Link>
          </div>

          <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                      : "border border-ink-600/60 bg-ink-900/60 text-ink-100"
                  }`}
                >
                  <div className="whitespace-pre-line">{m.body}</div>
                  {m.actions && m.actions.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.actions.map((a) => (
                        <Link
                          key={a.href}
                          to={a.href}
                          onClick={() => setOpen(false)}
                          className="rounded-full border border-gold-700/40 bg-gold-900/20 px-2 py-0.5 text-[11px] text-gold-200 hover:bg-gold-900/40"
                        >
                          {a.label} →
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {pending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-ink-600/60 bg-ink-900/60 px-3 py-2 text-sm text-ink-200">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400 [animation-delay:0.15s]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400 [animation-delay:0.3s]" />
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 border-t border-ink-700/60 bg-ink-900/40 px-3 py-2">
              {suggestions.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-ink-600/60 bg-ink-900/80 px-2.5 py-1 text-[11px] text-ink-100 hover:border-gold-700/40 hover:text-gold-200"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          <div className="border-t border-ink-700/60 p-3">
            <div className="flex gap-2">
              <input
                className="input py-2 text-sm"
                placeholder="Ask about limits, loans, banks…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={pending}
              />
              <button
                className="btn-primary px-3 py-2 text-sm"
                onClick={() => send()}
                disabled={pending}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

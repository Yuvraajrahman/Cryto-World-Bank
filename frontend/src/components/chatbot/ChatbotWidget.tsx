import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "@/lib/store";
import { streamChat, type StreamChatMessage } from "@/lib/aiStream";
import { getFeatureKeyFromPath, getRecommendedPrompts } from "@/lib/assistantPrompts";
import { MarkdownMessage } from "@/components/chatbot/MarkdownMessage";

interface Msg {
  id: string;
  role: "user" | "bot";
  body: string;
  meta?: { model?: string };
}

function uuid(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function ChatbotWidget() {
  const { pathname } = useLocation();
  const role = useSession((s) => s.role);
  const user = useSession((s) => s.user);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || messages.length > 0) return;
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

  function toStreamMessages(list: Msg[]): StreamChatMessage[] {
    return list.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.body,
    }));
  }

  async function send(text?: string) {
    const body = (text ?? draft).trim();
    if (!body || pending) return;
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
          setMessages((prev) =>
            prev.map((x) => (x.id === botId ? { ...x, meta: { model: m.model } } : x)),
          );
        },
        onToken: (tok) => {
          setMessages((prev) =>
            prev.map((x) => (x.id === botId ? { ...x, body: x.body + tok } : x)),
          );
        },
        onError: (msg) => {
          setMessages((prev) =>
            prev.map((x) =>
              x.id === botId
                ? { ...x, body: x.body || `Sorry, I hit an error: ${msg}` }
                : x,
            ),
          );
        },
      });

      if (meta.model) {
        setMessages((prev) =>
          prev.map((x) => (x.id === botId ? { ...x, meta: { model: meta.model } } : x)),
        );
      }
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.map((x) =>
          x.id === botId
            ? {
                ...x,
                body:
                  err instanceof Error
                    ? `Sorry, I hit an error: ${err.message}`
                    : "Sorry, I hit an error.",
              }
            : x,
        ),
      );
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
                  Local model · streaming
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
                  {m.role === "bot" && m.meta?.model ? (
                    <div className="mb-0.5 text-[10px] uppercase tracking-[0.22em] text-gold-300">
                      {m.meta.model}
                    </div>
                  ) : null}
                  <MarkdownMessage text={m.body} />
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
              {suggestions.map((s) => (
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

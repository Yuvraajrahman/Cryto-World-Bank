import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";
import { streamChat, type StreamChatMessage } from "@/lib/aiStream";
import { getRecommendedPrompts } from "@/lib/assistantPrompts";
import { MarkdownMessage } from "@/components/chatbot/MarkdownMessage";

interface Msg {
  id: string;
  role: "user" | "bot";
  body: string;
  meta?: { model?: string };
}

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

export function LandingAssistantSection() {
  const featureKey = "landing";
  const route = "/";
  const suggestions = useMemo(() => getRecommendedPrompts(featureKey), []);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) return;
    setMessages([
      {
        id: uid(),
        role: "bot",
        body:
          "Ask anything about Crypto World Bank — how the hierarchy works, what the reserve does, or how to start using the platform.",
      },
    ]);
  }, [messages.length]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

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
    <section className="border-b border-ink-700/40 bg-ink-900/30">
      <div className="container-page py-20">
        <div className="mb-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400">
            <span className="h-px w-8 bg-gold-500/50" />
            Assistant
          </div>
          <h2 className="font-display text-4xl font-semibold text-ink-100 sm:text-5xl">
            Have questions? <span className="gold-text">Ask the agent</span>.
          </h2>
          <p className="mt-4 text-ink-200">
            Get instant guidance about features, concepts, and how to use the platform. Answers stream live from your local model.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="card flex min-h-[520px] flex-col overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-ink-700/60 bg-gradient-to-r from-gold-900/20 to-transparent px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/30 text-gold-300">
                  <Bot className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink-100">CWB Assistant</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-gold-300">
                    <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                    Local model · streaming
                  </div>
                </div>
              </div>
            </div>

            <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      m.role === "user"
                        ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                        : "border border-ink-600/60 bg-ink-900/60 text-ink-100"
                    }`}
                  >
                    {m.role === "bot" && m.meta?.model ? (
                      <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-gold-300">
                        {m.meta.model}
                      </div>
                    ) : null}
                    <MarkdownMessage text={m.body} />
                  </div>
                </div>
              ))}
              {pending ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-ink-600/60 bg-ink-900/60 px-4 py-3 text-sm text-ink-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              ) : null}
            </div>

            {suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 border-t border-ink-700/60 bg-ink-900/40 px-4 py-2.5">
                {suggestions.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={pending}
                    className="rounded-full border border-ink-600/60 bg-ink-900/80 px-2.5 py-1 text-[11px] text-ink-100 hover:border-gold-700/40 hover:text-gold-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="border-t border-ink-700/60 p-4">
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Ask about hierarchy, reserves, loans…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  disabled={pending}
                />
                <button className="btn-primary" onClick={() => send()} disabled={pending}>
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <div className="mb-3 text-xs uppercase tracking-[0.22em] text-ink-200">
                Suggested questions
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-ink-600/60 bg-ink-900/80 px-3 py-1 text-xs text-ink-100 hover:border-gold-700/40 hover:text-gold-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="mb-2 text-xs uppercase tracking-[0.22em] text-ink-200">
                Tip
              </div>
              <p className="text-sm text-ink-200">
                Try asking “What should I do next?” after you enter the app — the suggestions will adapt to the page you’re on.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


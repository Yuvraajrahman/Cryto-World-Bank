import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bot,
  Send,
  Sparkles,
  CircleDot,
  Zap,
  Network,
  Wand2,
  Loader2,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { streamChat, type StreamChatMessage } from "@/lib/aiStream";
import { getFeatureKeyFromPath, getRecommendedPrompts } from "@/lib/assistantPrompts";
import { useSession } from "@/lib/store";
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

export function AIAssistant() {
  const { pathname } = useLocation();
  const role = useSession((s) => s.role);
  const user = useSession((s) => s.user);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const featureKey = useMemo(() => getFeatureKeyFromPath(pathname), [pathname]);
  const suggestions = useMemo(
    () => getRecommendedPrompts(featureKey, role),
    [featureKey, role],
  );

  useEffect(() => {
    if (messages.length > 0) return;
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
    <div className="space-y-8">
      <SectionHeader
        eyebrow="AI"
        title="Crypto World Bank Assistant"
        description="Ask anything about your borrowing limits, installments, bank hierarchy, or platform policies. Intents are classified in real time and routed to the right data."
        right={
          <span className="badge-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Local model · streaming
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card flex min-h-[640px] flex-col overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-ink-700/60 bg-gradient-to-r from-gold-900/20 to-transparent px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/30 text-gold-300">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold text-ink-100">
                  CWB Assistant
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-gold-300">
                  Role-aware · intent-routed
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-300">
              <CircleDot className="h-3 w-3" />
              Online
            </span>
          </div>

          <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
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
            <div className="flex flex-wrap gap-1.5 border-t border-ink-700/60 bg-ink-900/40 px-5 py-3">
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
          ) : null}

          <div className="border-t border-ink-700/60 p-4">
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Ask about limits, loans, banks, policy…"
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
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
              <Wand2 className="h-4 w-4 text-gold-400" />
              What it can do
            </div>
            <ul className="space-y-2 text-sm text-ink-100">
              <li className="flex items-start gap-2">
                <Zap className="mt-0.5 h-4 w-4 text-gold-400" />
                Explain borrowing limits and eligibility
              </li>
              <li className="flex items-start gap-2">
                <Zap className="mt-0.5 h-4 w-4 text-gold-400" />
                Show your next installment + due date
              </li>
              <li className="flex items-start gap-2">
                <Zap className="mt-0.5 h-4 w-4 text-gold-400" />
                List your recent loan requests and statuses
              </li>
              <li className="flex items-start gap-2">
                <Zap className="mt-0.5 h-4 w-4 text-gold-400" />
                Walk through the World → National → Local → Borrower hierarchy
              </li>
              <li className="flex items-start gap-2">
                <Zap className="mt-0.5 h-4 w-4 text-gold-400" />
                Route approvers to the pending queue
              </li>
            </ul>
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
              <Network className="h-4 w-4 text-gold-400" />
              How it works
            </div>
            <p className="text-sm text-ink-200">
              The current backend classifies your message with a keyword-based
              intent router (<span className="font-mono text-gold-300">cwb-intent-rules-v0</span>).
              Sprint 3 replaces this with a transformer classifier + retrieval-augmented
              responses over your on-chain history — the UI and API shape stay identical.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

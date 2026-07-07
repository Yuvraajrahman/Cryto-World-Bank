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
import { confirmAgentAction, sendAgentMessage } from "@/lib/phase3";
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
  const [agentConfirm, setAgentConfirm] = useState<{
    confirmationId: string;
    message: string;
    tool: string;
  } | null>(null);
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

    if (/apply.*loan|loan.*apply|borrow\s+\d/i.test(body)) {
      const userMsgId = uid();
      const botId = uid();
      setMessages((m) => [
        ...m,
        { id: userMsgId, role: "user", body },
        { id: botId, role: "bot", body: "", meta: { model: "agent" } },
      ]);
      setPending(true);
      try {
        const res = await sendAgentMessage(body);
        if (res.type === "confirmation_required" && res.confirmationId) {
          setAgentConfirm({
            confirmationId: res.confirmationId,
            message: res.message ?? "Confirm loan application?",
            tool: res.tool ?? "submit_loan_application",
          });
          setMessages((prev) =>
            prev.map((x) =>
              x.id === botId ? { ...x, body: res.message ?? "Please confirm to submit." } : x,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((x) =>
              x.id === botId
                ? { ...x, body: res.message ?? JSON.stringify(res.result ?? res, null, 2) }
                : x,
            ),
          );
        }
      } catch (err: unknown) {
        setMessages((prev) =>
          prev.map((x) =>
            x.id === botId
              ? {
                  ...x,
                  body: err instanceof Error ? err.message : "Agent request failed",
                }
              : x,
          ),
        );
      } finally {
        setPending(false);
      }
      return;
    }

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

  async function confirmAgent() {
    if (!agentConfirm) return;
    setPending(true);
    try {
      const res = await confirmAgentAction(agentConfirm.confirmationId);
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "bot",
          body: `Confirmed. ${JSON.stringify(res.result, null, 2)}`,
          meta: { model: "agent" },
        },
      ]);
      setAgentConfirm(null);
    } catch (err: unknown) {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "bot",
          body: err instanceof Error ? err.message : "Confirmation failed",
        },
      ]);
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

          {agentConfirm ? (
            <div className="border-t border-gold-700/40 bg-gold-900/20 px-5 py-3">
              <p className="text-sm text-gold-100">{agentConfirm.message}</p>
              <div className="mt-2 flex gap-2">
                <button className="btn-primary text-xs" onClick={confirmAgent} disabled={pending}>
                  Confirm {agentConfirm.tool}
                </button>
                <button className="btn-ghost text-xs" onClick={() => setAgentConfirm(null)}>
                  Cancel
                </button>
              </div>
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
                Submit a loan with human confirmation (Phase III agent)
              </li>
            </ul>
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
              <Network className="h-4 w-4 text-gold-400" />
              How it works
            </div>
            <p className="text-sm text-ink-200">
              Loan applications use the Phase III agent with a mandatory confirmation gate.
              General questions stream from your local LLM (Ollama) when configured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

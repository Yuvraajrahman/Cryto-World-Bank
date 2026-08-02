import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import StateMessage from "../../components/ui/StateMessage";
import { useToast } from "../../components/ui/Toast";
import { streamChat } from "@/lib/aiStream";
import { confirmAgentAction, sendAgentMessage } from "@/lib/phase3";
import { getFeatureKeyFromPath, getRecommendedPrompts } from "@/lib/assistantPrompts";
import { useSession } from "@/lib/store";
import { api } from "@/lib/api";

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

/**
 * Route: `/app/assistant` — plan H.27 AI Banking Agent
 * Design: glass message bubbles (self vs other fill weights).
 */
export default function AgentPage() {
  const toast = useToast();
  const { pathname } = useLocation();
  const role = useSession((s) => s.role);
  const user = useSession((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [agentConfirm, setAgentConfirm] = useState(null);
  const [actions, setActions] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [bootError, setBootError] = useState(null);
  const scrollerRef = useRef(null);

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
        role: "assistant",
        body: `Hi ${name}. Ask about limits, loans, or your passport. Write actions always need your Approve before they run.`,
      },
    ]);
  }, [user?.displayName, messages.length]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending, agentConfirm]);

  async function refreshActions() {
    try {
      const r = await api.get("/api/agent/actions");
      setActions(r.actions || []);
      setBootError(null);
    } catch (err) {
      setActions([]);
      setBootError(err?.message || "Could not load agent action log");
    }
  }

  useEffect(() => {
    void refreshActions();
  }, []);

  async function send(text) {
    const body = (text ?? draft).trim();
    if (!body || pending) return;
    if (agentConfirm) {
      toast.show("Approve or cancel the pending action first.", { variant: "error" });
      return;
    }
    setDraft("");
    const userId = uid();
    const botId = uid();
    setMessages((m) => [
      ...m,
      { id: userId, role: "user", body },
      { id: botId, role: "assistant", body: "" },
    ]);
    setPending(true);

    const writeIntent = /apply.*loan|loan.*apply|borrow\s+\d|loan status|borrowing limit|credit passport|credit tier/i.test(
      body,
    );

    try {
      if (writeIntent || /apply for a/i.test(body)) {
        const res = await sendAgentMessage(body, sessionId || undefined);
        if (res.sessionId) setSessionId(res.sessionId);
        if (res.type === "confirmation_required" && res.confirmationId) {
          setAgentConfirm({
            confirmationId: res.confirmationId,
            message: res.message ?? "Confirm this write action?",
            tool: res.tool ?? "tool",
            args: res.args,
          });
          setMessages((prev) =>
            prev.map((x) =>
              x.id === botId
                ? { ...x, body: res.message ?? "Please approve to continue." }
                : x,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((x) =>
              x.id === botId
                ? {
                    ...x,
                    body: res.message ?? JSON.stringify(res.result ?? res, null, 2),
                  }
                : x,
            ),
          );
        }
        await refreshActions();
        return;
      }

      // General Q&A — stream when available, else agent guidance
      try {
        await streamChat({
          messages: [
            ...messages
              .filter((m) => m.body)
              .map((m) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.body,
              })),
            { role: "user", content: body },
          ],
          featureKey,
          route: pathname,
          roleHint: role,
          onToken: (tok) => {
            setMessages((prev) =>
              prev.map((x) => (x.id === botId ? { ...x, body: x.body + tok } : x)),
            );
          },
          onError: async () => {
            const res = await sendAgentMessage(body, sessionId || undefined);
            if (res.sessionId) setSessionId(res.sessionId);
            setMessages((prev) =>
              prev.map((x) =>
                x.id === botId
                  ? { ...x, body: res.message || "I can help with limits, loans, and passport." }
                  : x,
              ),
            );
          },
        });
      } catch {
        const res = await sendAgentMessage(body, sessionId || undefined);
        if (res.sessionId) setSessionId(res.sessionId);
        setMessages((prev) =>
          prev.map((x) =>
            x.id === botId
              ? { ...x, body: res.message || "Ask about borrowing limits or say “apply for a 0.05 ETH loan”." }
              : x,
          ),
        );
      }
    } catch (err) {
      const blocked = err?.status === 403 || /blocked|injection/i.test(err?.message || "");
      setMessages((prev) =>
        prev.map((x) =>
          x.id === botId
            ? {
                ...x,
                body: blocked
                  ? "That request was blocked for safety. Try a normal banking question."
                  : err?.message || "Agent request failed",
              }
            : x,
        ),
      );
    } finally {
      setPending(false);
    }
  }

  async function onApprove() {
    if (!agentConfirm || pending) return;
    setPending(true);
    try {
      const res = await confirmAgentAction(agentConfirm.confirmationId);
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          body: `Done — ${agentConfirm.tool}. ${typeof res.result === "object" ? JSON.stringify(res.result?.data ?? res.result, null, 2) : String(res.result ?? "ok")}`,
        },
      ]);
      setAgentConfirm(null);
      toast.show("Action confirmed", { variant: "success" });
      await refreshActions();
    } catch (err) {
      toast.show(err?.message || "Confirmation failed", { variant: "error" });
    } finally {
      setPending(false);
    }
  }

  function onCancelConfirm() {
    setAgentConfirm(null);
    setMessages((m) => [
      ...m,
      { id: uid(), role: "assistant", body: "Cancelled. Nothing was submitted." },
    ]);
  }

  function newSession() {
    setSessionId(null);
    setAgentConfirm(null);
    setMessages([]);
    setDraft("");
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Support</p>
        <h1 className="client-title">AI banking agent</h1>
        <p className="client-lede">
          Ask questions or propose write actions. Approvals are required before any loan or payment
          tool runs.
        </p>
        <div className="quick-actions">
          <Button type="button" variant="ghost" showArrow={false} onClick={newSession}>
            New session
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setShowLog((v) => !v)}>
            {showLog ? "Hide action log" : "Action log"}
          </Button>
          <Button as={Link} to="/app/chat" variant="ghost" showArrow={false}>
            Live bank chat
          </Button>
        </div>
      </header>

      {bootError ? (
        <StateMessage
          title="Agent services degraded"
          description={bootError}
          action={{ label: "Retry", onClick: () => void refreshActions() }}
        />
      ) : null}

      {showLog ? (
        <Glass className="client-panel">
          <p className="eyebrow">Agent audit trail</p>
          <ul className="activity-list">
            {actions.length === 0 ? (
              <li className="activity-row glass">
                <span className="client-lede">No tool actions logged yet.</span>
              </li>
            ) : (
              actions.map((a) => (
                <li key={a.id} className="activity-row glass">
                  <div>
                    <strong>{a.toolName}</strong>
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                  <Badge>{a.confirmed ? "confirmed" : "proposed"}</Badge>
                </li>
              ))
            )}
          </ul>
        </Glass>
      ) : null}

      <Glass className="chat-shell client-panel">
        <div className="chat-stream" ref={scrollerRef}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-row${m.role === "user" ? " mine" : ""}`}
            >
              <div className={`chat-bubble glass${m.role === "user" ? " mine" : ""}`}>
                {m.body || (pending && m.role === "assistant" ? "…" : "")}
              </div>
            </div>
          ))}
          {pending ? <p className="chat-thinking">Thinking…</p> : null}
        </div>

        {agentConfirm ? (
          <div className="tool-confirm notice warn" role="alertdialog" aria-label="Confirm agent action">
            <p className="eyebrow">Confirm write action</p>
            <strong>{String(agentConfirm.tool).replaceAll("_", " ")}</strong>
            <p className="client-lede">{agentConfirm.message}</p>
            {agentConfirm.args ? (
              <pre className="tool-args">{JSON.stringify(agentConfirm.args, null, 2)}</pre>
            ) : null}
            <div className="quick-actions">
              <Button type="button" disabled={pending} onClick={() => void onApprove()}>
                Approve
              </Button>
              <Button type="button" variant="ghost" showArrow={false} disabled={pending} onClick={onCancelConfirm}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {suggestions.length > 0 && !agentConfirm ? (
          <div className="chat-suggestions">
            {suggestions.slice(0, 4).map((s) => (
              <button key={s} type="button" className="chip" onClick={() => void send(s)} disabled={pending}>
                {s}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <Input
            label="Message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about limits, or: apply for a 0.05 ETH loan"
            disabled={pending && Boolean(agentConfirm)}
          />
          <Button type="submit" disabled={pending || !draft.trim() || Boolean(agentConfirm)}>
            Send
          </Button>
        </form>
      </Glass>
    </div>
  );
}

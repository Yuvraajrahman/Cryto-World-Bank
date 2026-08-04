import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import StateMessage from "../../components/ui/StateMessage";
import ChatMarkdown from "../../components/ui/ChatMarkdown";
import { useToast } from "../../components/ui/Toast";
import { confirmAgentAction, fetchAgentStatus, sendAgentMessage } from "@/lib/phase3";
import { getFeatureKeyFromPath, getRecommendedPrompts } from "@/lib/assistantPrompts";
import { useSession } from "@/lib/store";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

function formatToolLabel(name) {
  return String(name || "action").replaceAll("_", " ");
}

function buildConfirmMarkdown(tool, args = {}) {
  const rows = Object.entries(args).map(([k, v]) => {
    let label = k;
    let value = String(v ?? "—");
    if (k === "amountEth" || k === "amount") {
      label = "Amount";
      value = `${Number(v)} USDC`;
    } else if (k === "termMonths") {
      label = "Term";
      value = `${v} months`;
    } else if (k === "purpose") {
      label = "Purpose";
    } else if (k === "lenderBankId") {
      label = "Bank";
    }
    return `| ${label} | ${value} |`;
  });
  return [
    `### Confirm ${formatToolLabel(tool)}`,
    "",
    "Review the details, then tap **Confirm** to run this write action.",
    "",
    "| Field | Value |",
    "| --- | --- |",
    ...rows,
    "",
    "_Nothing is submitted until you confirm._",
  ].join("\n");
}

function formatToolResult(tool, result) {
  const data = result?.data ?? result;
  if (!data || typeof data !== "object") {
    return `### Done — ${formatToolLabel(tool)}\n\n${String(result ?? "ok")}`;
  }
  if (data.loanId || data.message) {
    const amount = data.amount != null ? formatUsdc(data.amount) : null;
    return [
      `### Loan request submitted`,
      "",
      data.message || "Your request was sent for bank approval.",
      "",
      "| Field | Value |",
      "| --- | --- |",
      data.loanId ? `| Loan ID | \`${data.loanId}\` |` : null,
      amount ? `| Amount | ${amount} |` : null,
      `| Status | Pending bank approval |`,
      "",
      "Funds are released only after the lending bank approves.",
    ]
      .filter(Boolean)
      .join("\n");
  }
  const rows = Object.entries(data).map(([k, v]) => {
    const val = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `| ${k} | ${val} |`;
  });
  return [
    `### Done — ${formatToolLabel(tool)}`,
    "",
    "| Field | Value |",
    "| --- | --- |",
    ...rows,
  ].join("\n");
}

/**
 * Route: `/app/assistant` — MCP banking agent (LM Studio tool-calling + confirmation gate)
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
  const [llmStatus, setLlmStatus] = useState(null);
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
        body: `Hi ${name}. I'm the MCP banking agent (LM Studio). I can check limits, loans, and passport via tools.\n\n**Loan applications need your Confirm** before they run.`,
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

  async function refreshStatus() {
    try {
      const s = await fetchAgentStatus();
      setLlmStatus(s);
    } catch {
      setLlmStatus(null);
    }
  }

  useEffect(() => {
    void refreshActions();
    void refreshStatus();
  }, []);

  async function send(text) {
    const body = (text ?? draft).trim();
    if (!body || pending) return;
    if (agentConfirm) {
      toast.show("Confirm or cancel the pending action first.", { variant: "error" });
      return;
    }
    setDraft("");
    const userId = uid();
    const botId = uid();
    const history = messages
      .filter((m) => m.body)
      .slice(-8)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.body,
      }));
    setMessages((m) => [
      ...m,
      { id: userId, role: "user", body },
      { id: botId, role: "assistant", body: "" },
    ]);
    setPending(true);

    try {
      const res = await sendAgentMessage(body, sessionId || undefined, {
        mode: "mcp",
        history,
      });
      if (res.sessionId) setSessionId(res.sessionId);

      if (res.type === "confirmation_required" && res.confirmationId) {
        const tool = res.tool ?? "tool";
        const args = res.args || {};
        const confirmBody = buildConfirmMarkdown(tool, args);
        setAgentConfirm({
          confirmationId: res.confirmationId,
          message: res.message ?? "Confirm this write action?",
          tool,
          args,
          messageId: botId,
        });
        setMessages((prev) =>
          prev.map((x) =>
            x.id === botId
              ? {
                  ...x,
                  body: confirmBody,
                  kind: "confirm",
                }
              : x,
          ),
        );
      } else if (res.type === "error") {
        setMessages((prev) =>
          prev.map((x) =>
            x.id === botId
              ? {
                  ...x,
                  body:
                    res.message ||
                    "LM Studio is not reachable. Keep the local server running on :1234.",
                }
              : x,
          ),
        );
      } else {
        const trace =
          Array.isArray(res.toolTrace) && res.toolTrace.length
            ? `\n\n_Tools used: ${res.toolTrace.join(", ")}_`
            : "";
        setMessages((prev) =>
          prev.map((x) =>
            x.id === botId
              ? {
                  ...x,
                  body: `${res.message ?? JSON.stringify(res.result ?? res, null, 2)}${trace}`,
                }
              : x,
          ),
        );
      }
      await refreshActions();
      await refreshStatus();
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
        ...m.map((x) =>
          x.id === agentConfirm.messageId ? { ...x, kind: undefined } : x,
        ),
        {
          id: uid(),
          role: "assistant",
          body: formatToolResult(agentConfirm.tool, res.result),
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
      ...m.map((x) => (x.kind === "confirm" ? { ...x, kind: undefined } : x)),
      { id: uid(), role: "assistant", body: "Cancelled. Nothing was submitted." },
    ]);
  }

  function newSession() {
    setSessionId(null);
    setAgentConfirm(null);
    setMessages([]);
    setDraft("");
  }

  const llmOk = llmStatus?.llm?.ok;
  const modelLabel = llmStatus?.llm?.model || "LM Studio";

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">MCP agent</p>
        <h1 className="client-title">Banking agent</h1>
        <p className="client-lede">
          Tool-calling agent via your local LM Studio server. Read tools run live; write tools need
          your Confirm.
        </p>
        <div className="client-hero-badges">
          <Badge icon={llmOk ? "check" : "alert"}>
            {llmOk ? `MCP · ${modelLabel}` : "LM Studio offline (:1234)"}
          </Badge>
          <Badge icon="passport">{llmStatus?.tools?.length ?? 4} tools</Badge>
        </div>
        <div className="quick-actions">
          <Button type="button" variant="ghost" showArrow={false} onClick={newSession}>
            New session
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            onClick={() => {
              void refreshStatus();
              void refreshActions();
            }}
          >
            Refresh status
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

      {!llmOk && llmStatus ? (
        <div className="notice warn" style={{ marginBottom: 16 }}>
          LM Studio is not reachable at <code>{llmStatus.llm?.baseUrl}</code>. Keep Developer →
          Local Server running with model loaded.
        </div>
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
          {messages.map((m) => {
            const isConfirmCard = m.kind === "confirm" && agentConfirm?.messageId === m.id;
            return (
              <div key={m.id} className={`chat-row${m.role === "user" ? " mine" : ""}`}>
                <div
                  className={`chat-bubble glass${m.role === "user" ? " mine" : ""}${
                    isConfirmCard ? " confirm-bubble" : ""
                  }`}
                >
                  {m.role === "user" ? (
                    m.body || ""
                  ) : m.body || (pending && m.role === "assistant" ? "…" : "") ? (
                    <ChatMarkdown text={m.body || (pending ? "…" : "")} />
                  ) : null}
                  {isConfirmCard ? (
                    <div className="chat-confirm-actions">
                      <Button type="button" disabled={pending} onClick={() => void onApprove()}>
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        showArrow={false}
                        disabled={pending}
                        onClick={onCancelConfirm}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          {pending ? <p className="chat-thinking">Thinking with LM Studio…</p> : null}
        </div>

        {agentConfirm ? (
          <div className="tool-confirm notice warn" role="alertdialog" aria-label="Confirm agent action">
            <p className="eyebrow">Action needs your confirmation</p>
            <strong>{formatToolLabel(agentConfirm.tool)}</strong>
            <p className="client-lede" style={{ margin: 0 }}>
              This write will not run until you confirm.
            </p>
            {agentConfirm.args ? (
              <pre className="tool-args">{JSON.stringify(agentConfirm.args, null, 2)}</pre>
            ) : null}
            <div className="quick-actions">
              <Button type="button" disabled={pending} onClick={() => void onApprove()}>
                Confirm
              </Button>
              <Button
                type="button"
                variant="ghost"
                showArrow={false}
                disabled={pending}
                onClick={onCancelConfirm}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {suggestions.length > 0 && !agentConfirm ? (
          <div className="chat-suggestions" role="group" aria-label="Suggested prompts">
            {suggestions.slice(0, 6).map((s) => (
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
            placeholder="e.g. What is my borrowing limit? / apply for a 1000 USDC loan"
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

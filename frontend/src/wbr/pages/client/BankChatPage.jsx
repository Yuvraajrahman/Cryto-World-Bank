import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Sheet from "../../components/ui/Sheet";
import StateMessage from "../../components/ui/StateMessage";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { shortAddress } from "@/lib/utils";

const STAFF_IDS = [
  "usr_lb_admin_dhaka",
  "usr_approver_dhaka",
  "usr_nb_admin_bd",
  "usr_governor",
];

/**
 * Route: `/app/chat` — plan H.28 Client–Bank Live Chat
 * Polling stand-in for Socket.IO; glass bubbles per design.md.
 */
export default function BankChatPage() {
  const toast = useToast();
  const user = useSession((s) => s.user);
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [subject, setSubject] = useState("Support request");
  const [participantId, setParticipantId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const fileRef = useRef(null);
  const scrollerRef = useRef(null);

  const loadThreads = useCallback(async () => {
    try {
      const r = await api.get("/api/chat/threads");
      setThreads(r.threads || []);
      setActiveId((id) => id || r.threads?.[0]?.id || null);
    } catch (err) {
      toast.show(err?.message || "Could not load threads", { variant: "error" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) return;
    try {
      const r = await api.get(`/api/chat/threads/${threadId}/messages`);
      setMessages(r.messages || []);
      void api.post(`/api/chat/threads/${threadId}/read`).catch(() => null);
    } catch {
      /* ignore poll errors */
    }
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!activeId) return;
    void loadMessages(activeId);
    const t = setInterval(() => void loadMessages(activeId), 5000);
    return () => clearInterval(t);
  }, [activeId, loadMessages]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    Promise.all(
      STAFF_IDS.map((id) => api.get(`/api/profile/users/${id}`).catch(() => null)),
    ).then((list) => setCandidates(list.filter(Boolean)));
  }, []);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const counterpart = active?.participants?.find((p) => p.id !== user?.id);

  const filtered = useMemo(() => {
    if (!search.trim()) return threads;
    const q = search.toLowerCase();
    return threads.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.participants.some((p) => p.displayName.toLowerCase().includes(q)),
    );
  }, [threads, search]);

  async function send(e) {
    e?.preventDefault?.();
    if (!activeId || (!draft.trim() && !attachment) || sending) return;
    setSending(true);
    try {
      const body = draft.trim() || (attachment ? `Attached: ${attachment.name}` : "");
      await api.post(`/api/chat/threads/${activeId}/messages`, {
        body,
        attachmentName: attachment?.name,
        attachmentMime: attachment?.type || undefined,
        attachmentSize: attachment?.size || undefined,
      });
      setDraft("");
      setAttachment(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadMessages(activeId);
      await loadThreads();
    } catch (err) {
      toast.show(err?.message || "Send failed — check connection and retry.", {
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  }

  async function createThread() {
    if (!subject.trim() || !participantId) {
      toast.show("Pick a bank contact and subject", { variant: "error" });
      return;
    }
    setSending(true);
    try {
      const r = await api.post("/api/chat/threads", {
        subject: subject.trim(),
        participantIds: [participantId],
      });
      setSheetOpen(false);
      await loadThreads();
      setActiveId(r.thread.id);
      toast.show("Conversation started", { variant: "success" });
    } catch (err) {
      toast.show(err?.message || "Could not create thread", { variant: "error" });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="client-page">
        <StateMessage variant="empty" title="Loading chat…" description="Fetching your threads." />
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Support</p>
        <h1 className="client-title">Bank chat</h1>
        <p className="client-lede">
          Message your local bank for human support. Product Q&amp;A is faster with the AI agent.
        </p>
        <div className="quick-actions">
          <Button type="button" showArrow={false} onClick={() => setSheetOpen(true)}>
            Start conversation
          </Button>
          <Button as={Link} to="/app/assistant" variant="ghost" showArrow={false}>
            AI agent
          </Button>
          <Button as={Link} to="/app/notifications" variant="ghost" showArrow={false}>
            Notifications
          </Button>
        </div>
      </header>

      <div className="chat-layout">
        <Glass className="chat-threads client-panel">
          <Input
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a thread…"
          />
          <ul className="thread-list">
            {filtered.length === 0 ? (
              <li className="client-lede" style={{ padding: "12px 0" }}>
                No threads yet. Start a conversation with your local bank.
              </li>
            ) : (
              filtered.map((t) => {
                const others = t.participants.filter((p) => p.id !== user?.id);
                const title = t.subject || others.map((p) => p.displayName).join(", ");
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={`thread-item${t.id === activeId ? " active" : ""}`}
                      onClick={() => setActiveId(t.id)}
                    >
                      <strong>{title}</strong>
                      <span>{t.lastMessage?.body || "No messages yet"}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </Glass>

        <Glass className="chat-shell client-panel">
          <div className="chat-shell-head">
            <div>
              <strong>{active?.subject || "Select a thread"}</strong>
              <p className="client-lede" style={{ margin: 0 }}>
                {counterpart
                  ? `${counterpart.displayName} · ${String(counterpart.role || "").replaceAll("_", " ")}`
                  : "Local bank support"}
                {counterpart ? (
                  <>
                    {" · "}
                    <Badge>{counterpart.role === "BORROWER" ? "peer" : "staff"}</Badge>
                    {" · "}
                    <span className="presence offline">Offline (poll every 5s)</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="chat-stream" ref={scrollerRef}>
            {!active ? (
              <StateMessage
                variant="empty"
                title="Start a conversation"
                description="Open a thread with your local bank approver or admin."
                action={{ label: "New thread", onClick: () => setSheetOpen(true) }}
              />
            ) : messages.length === 0 ? (
              <p className="client-lede">No messages yet. Say hello!</p>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === user?.id;
                const sender = active?.participants.find((p) => p.id === m.senderId);
                const othersRead =
                  mine &&
                  (m.readBy || []).some((id) => id !== user?.id);
                return (
                  <div key={m.id} className={`chat-row${mine ? " mine" : ""}`}>
                    <div className={`chat-bubble glass${mine ? " mine" : ""}`}>
                      {!mine && sender ? (
                        <span className="chat-sender">{sender.displayName}</span>
                      ) : null}
                      <div>{m.body}</div>
                      {m.attachmentName ? (
                        <div className="chat-attach">
                          Attachment: {m.attachmentName}
                          {m.attachmentSize
                            ? ` · ${(m.attachmentSize / 1024).toFixed(1)} KB`
                            : ""}
                        </div>
                      ) : null}
                      <time>
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {mine ? (othersRead ? " · Read" : " · Sent") : ""}
                      </time>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form className="chat-composer chat-composer-attach" onSubmit={(e) => void send(e)}>
            <div className="chat-composer-fields">
              <Input
                label="Message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={active ? "Write a message…" : "Select a thread first"}
                disabled={!active || sending}
              />
              <div className="chat-attach-row">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  disabled={!active || sending}
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAttachment(f);
                  }}
                  aria-label="Attach a document"
                />
                {attachment ? (
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => {
                      setAttachment(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    Remove {attachment.name}
                  </button>
                ) : (
                  <span className="client-lede">Optional document (name stored in demo)</span>
                )}
              </div>
            </div>
            <Button type="submit" disabled={!active || sending || (!draft.trim() && !attachment)}>
              {sending ? "Sending…" : "Send"}
            </Button>
          </form>
        </Glass>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Start a conversation">
        <div className="stack-form">
          <label className="field">
            <span className="field-label">Bank contact</span>
            <select
              className="field-input"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
            >
              <option value="">Select…</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName} · {String(c.role).replaceAll("_", " ")} ({shortAddress(c.wallet)})
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Loan follow-up"
          />
          <div className="quick-actions">
            <Button type="button" disabled={sending} onClick={() => void createThread()}>
              Create thread
            </Button>
            <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

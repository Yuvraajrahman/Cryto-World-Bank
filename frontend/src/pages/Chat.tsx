import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  MessageSquare,
  Send,
  Search,
  Shield,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  api,
  ChatMessageDTO,
  ChatThreadDTO,
  UserDTO,
} from "@/lib/api";
import { useSession } from "@/lib/store";
import { shortAddress } from "@/lib/utils";

export function Chat() {
  const user = useSession((s) => s.user);

  const [threads, setThreads] = useState<ChatThreadDTO[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  async function loadThreads() {
    setLoading(true);
    try {
      const r = await api.get<{ threads: ChatThreadDTO[] }>("/api/chat/threads");
      setThreads(r.threads);
      if (!activeId && r.threads[0]) setActiveId(r.threads[0].id);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(threadId: string) {
    try {
      const r = await api.get<{ messages: ChatMessageDTO[] }>(
        `/api/chat/threads/${threadId}/messages`,
      );
      setMessages(r.messages);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const t = setInterval(() => loadMessages(activeId), 5000);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const active = threads.find((t) => t.id === activeId) ?? null;

  const filteredThreads = useMemo(() => {
    if (!search.trim()) return threads;
    const q = search.toLowerCase();
    return threads.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.participants.some((p) => p.displayName.toLowerCase().includes(q)),
    );
  }, [threads, search]);

  async function send() {
    if (!activeId || !draft.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/api/chat/threads/${activeId}/messages`, { body: draft });
      setDraft("");
      await loadMessages(activeId);
      loadThreads();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Communication"
        title="Messages"
        description="Wallet-verified conversations with approvers, bank staff, and the governor. Every message is signed by the sender's identity."
        right={
          <>
            <button className="btn-ghost" onClick={loadThreads} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              className="btn-primary"
              onClick={() => setComposerOpen(true)}
              disabled={!user}
            >
              <Plus className="h-4 w-4" />
              New thread
            </button>
          </>
        }
      />

      <div className="card overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
          <div className="border-b border-ink-700/50 md:border-b-0 md:border-r md:border-ink-700/50">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
                <input
                  className="input pl-9"
                  placeholder="Search threads…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <ul className="max-h-[520px] overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <li className="p-6 text-center text-xs text-ink-200">
                  No threads yet. Start a conversation with your approver or bank staff.
                </li>
              ) : null}
              {filteredThreads.map((t) => {
                const others = t.participants.filter((p) => p.id !== user?.id);
                const title = t.subject || others.map((p) => p.displayName).join(", ");
                const preview = t.lastMessage?.body ?? "No messages yet";
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setActiveId(t.id)}
                      className={`flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors ${
                        activeId === t.id
                          ? "border-gold-500 bg-gold-900/10"
                          : "border-transparent hover:bg-ink-800/60"
                      }`}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-700/40 bg-gold-900/20 text-gold-300">
                        <MessageSquare className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm font-medium text-ink-100">
                            {title}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-ink-200">
                          {preview}
                        </div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-300">
                          {new Date(t.lastMessageAt).toLocaleString()}
                        </div>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex min-h-[520px] flex-col">
            <div className="flex items-center justify-between border-b border-ink-700/50 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-ink-100">
                  {active?.subject ?? "Select a thread"}
                </div>
                <div className="truncate text-xs text-ink-200">
                  {active
                    ? active.participants
                        .filter((p) => p.id !== user?.id)
                        .map(
                          (p) =>
                            `${p.displayName} (${p.role.replace(/_/g, " ")})`,
                        )
                        .join(" · ")
                    : "Wallet-verified · end-to-end signed"}
                </div>
              </div>
              <span className="badge-gold">
                <Shield className="h-3.5 w-3.5" />
                Secure
              </span>
            </div>
            <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {!active ? (
                <div className="flex h-full items-center justify-center text-xs text-ink-200">
                  Select a conversation to start messaging.
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-ink-200">
                  No messages yet. Say hello!
                </div>
              ) : null}
              {messages.map((m) => {
                const mine = m.senderId === user?.id;
                const sender = active?.participants.find((p) => p.id === m.senderId);
                return (
                  <div
                    key={m.id}
                    className={mine ? "flex justify-end" : "flex justify-start"}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        mine
                          ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                          : "border border-ink-600/60 bg-ink-900/60 text-ink-100"
                      }`}
                    >
                      {!mine && sender ? (
                        <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-gold-300">
                          {sender.displayName}
                        </div>
                      ) : null}
                      <div className="whitespace-pre-line">{m.body}</div>
                      <div
                        className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${
                          mine ? "text-ink-900/60" : "text-ink-200"
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-ink-700/50 p-4">
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder={active ? "Write a message…" : "Select a thread first"}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  disabled={!active || sending}
                />
                <button
                  className="btn-primary"
                  onClick={send}
                  disabled={!active || sending}
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {composerOpen ? (
        <NewThreadModal
          onClose={() => setComposerOpen(false)}
          onCreated={async (id) => {
            setComposerOpen(false);
            await loadThreads();
            setActiveId(id);
          }}
        />
      ) : null}
    </div>
  );
}

function NewThreadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (threadId: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<UserDTO[]>([]);

  // Seed candidates — the server exposes a thin lookup per id. We rely on the
  // known demo directory so users can jump into a new conversation quickly.
  useEffect(() => {
    const ids = [
      "usr_governor",
      "usr_nb_admin_bd",
      "usr_lb_admin_dhaka",
      "usr_approver_dhaka",
      "usr_borrower_demo",
      "usr_borrower_new",
    ];
    Promise.all(
      ids.map((id) =>
        api.get<UserDTO>(`/api/profile/users/${id}`).catch(() => null),
      ),
    ).then((list) => {
      setCandidates(list.filter((u): u is UserDTO => Boolean(u)));
    });
  }, []);

  async function create() {
    if (!subject.trim() || !participantId) {
      toast.error("Pick a participant and add a subject");
      return;
    }
    setSubmitting(true);
    try {
      const r = await api.post<{ thread: ChatThreadDTO }>("/api/chat/threads", {
        subject,
        participantIds: [participantId],
      });
      onCreated(r.thread.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[420px] max-w-[90vw] rounded-2xl border border-gold-700/40 bg-ink-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
          <Users className="h-4 w-4 text-gold-400" />
          Start a new thread
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">Recipient</label>
            <select
              className="input"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
            >
              <option value="">Select a contact…</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName} · {c.role.replace(/_/g, " ")} ({shortAddress(c.wallet)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <input
              className="input"
              placeholder="e.g. Loan #1024 — follow-up"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={create} disabled={submitting}>
            <Plus className="h-4 w-4" />
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

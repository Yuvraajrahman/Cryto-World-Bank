import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MessageSquare, Send, Search, Shield, Plus, RefreshCw, Users, } from "lucide-react";
import { api, } from "@/lib/api";
import { useSession } from "@/lib/store";
import { shortAddress } from "@/lib/utils";
export function Chat() {
    const user = useSession((s) => s.user);
    const [threads, setThreads] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [composerOpen, setComposerOpen] = useState(false);
    const scrollerRef = useRef(null);
    async function loadThreads() {
        setLoading(true);
        try {
            const r = await api.get("/api/chat/threads");
            setThreads(r.threads);
            if (!activeId && r.threads[0])
                setActiveId(r.threads[0].id);
        }
        finally {
            setLoading(false);
        }
    }
    async function loadMessages(threadId) {
        try {
            const r = await api.get(`/api/chat/threads/${threadId}/messages`);
            setMessages(r.messages);
        }
        catch {
            /* ignore */
        }
    }
    useEffect(() => {
        loadThreads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (!activeId)
            return;
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
        if (!search.trim())
            return threads;
        const q = search.toLowerCase();
        return threads.filter((t) => t.subject.toLowerCase().includes(q) ||
            t.participants.some((p) => p.displayName.toLowerCase().includes(q)));
    }, [threads, search]);
    async function send() {
        if (!activeId || !draft.trim() || sending)
            return;
        setSending(true);
        try {
            await api.post(`/api/chat/threads/${activeId}/messages`, { body: draft });
            setDraft("");
            await loadMessages(activeId);
            loadThreads();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Send failed");
        }
        finally {
            setSending(false);
        }
    }
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Communication", title: "Messages", description: "Wallet-verified conversations with approvers, bank staff, and the governor. Every message is signed by the sender's identity.", right: _jsxs(_Fragment, { children: [_jsxs("button", { className: "btn-ghost", onClick: loadThreads, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] }), _jsxs("button", { className: "btn-primary", onClick: () => setComposerOpen(true), disabled: !user, children: [_jsx(Plus, { className: "h-4 w-4" }), "New thread"] })] }) }), _jsx("div", { className: "card overflow-hidden p-0", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[300px_1fr]", children: [_jsxs("div", { className: "border-b border-ink-700/50 md:border-b-0 md:border-r md:border-ink-700/50", children: [_jsx("div", { className: "p-4", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" }), _jsx("input", { className: "input pl-9", placeholder: "Search threads\u2026", value: search, onChange: (e) => setSearch(e.target.value) })] }) }), _jsxs("ul", { className: "max-h-[520px] overflow-y-auto", children: [filteredThreads.length === 0 ? (_jsx("li", { className: "p-6 text-center text-xs text-ink-200", children: "No threads yet. Start a conversation with your approver or bank staff." })) : null, filteredThreads.map((t) => {
                                            const others = t.participants.filter((p) => p.id !== user?.id);
                                            const title = t.subject || others.map((p) => p.displayName).join(", ");
                                            const preview = t.lastMessage?.body ?? "No messages yet";
                                            return (_jsx("li", { children: _jsxs("button", { onClick: () => setActiveId(t.id), className: `flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors ${activeId === t.id
                                                        ? "border-gold-500 bg-gold-900/10"
                                                        : "border-transparent hover:bg-ink-800/60"}`, children: [_jsx("span", { className: "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-700/40 bg-gold-900/20 text-gold-300", children: _jsx(MessageSquare, { className: "h-4 w-4" }) }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("span", { className: "truncate text-sm font-medium text-ink-100", children: title }) }), _jsx("div", { className: "mt-0.5 truncate text-xs text-ink-200", children: preview }), _jsx("div", { className: "mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-300", children: new Date(t.lastMessageAt).toLocaleString() })] })] }) }, t.id));
                                        })] })] }), _jsxs("div", { className: "flex min-h-[520px] flex-col", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-ink-700/50 px-4 py-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "truncate text-sm font-medium text-ink-100", children: active?.subject ?? "Select a thread" }), _jsx("div", { className: "truncate text-xs text-ink-200", children: active
                                                        ? active.participants
                                                            .filter((p) => p.id !== user?.id)
                                                            .map((p) => `${p.displayName} (${p.role.replace(/_/g, " ")})`)
                                                            .join(" · ")
                                                        : "Wallet-verified · end-to-end signed" })] }), _jsxs("span", { className: "badge-gold", children: [_jsx(Shield, { className: "h-3.5 w-3.5" }), "Secure"] })] }), _jsxs("div", { ref: scrollerRef, className: "flex-1 space-y-3 overflow-y-auto p-4", children: [!active ? (_jsx("div", { className: "flex h-full items-center justify-center text-xs text-ink-200", children: "Select a conversation to start messaging." })) : messages.length === 0 ? (_jsx("div", { className: "flex h-full items-center justify-center text-xs text-ink-200", children: "No messages yet. Say hello!" })) : null, messages.map((m) => {
                                            const mine = m.senderId === user?.id;
                                            const sender = active?.participants.find((p) => p.id === m.senderId);
                                            return (_jsx("div", { className: mine ? "flex justify-end" : "flex justify-start", children: _jsxs("div", { className: `max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${mine
                                                        ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                                                        : "border border-ink-600/60 bg-ink-900/60 text-ink-100"}`, children: [!mine && sender ? (_jsx("div", { className: "mb-1 text-[10px] uppercase tracking-[0.22em] text-gold-300", children: sender.displayName })) : null, _jsx("div", { className: "whitespace-pre-line", children: m.body }), _jsx("div", { className: `mt-1 text-[10px] uppercase tracking-[0.18em] ${mine ? "text-ink-900/60" : "text-ink-200"}`, children: new Date(m.createdAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }) })] }) }, m.id));
                                        })] }), _jsx("div", { className: "border-t border-ink-700/50 p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input", placeholder: active ? "Write a message…" : "Select a thread first", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && send(), disabled: !active || sending }), _jsxs("button", { className: "btn-primary", onClick: send, disabled: !active || sending, children: [_jsx(Send, { className: "h-4 w-4" }), "Send"] })] }) })] })] }) }), composerOpen ? (_jsx(NewThreadModal, { onClose: () => setComposerOpen(false), onCreated: async (id) => {
                    setComposerOpen(false);
                    await loadThreads();
                    setActiveId(id);
                } })) : null] }));
}
function NewThreadModal({ onClose, onCreated, }) {
    const [subject, setSubject] = useState("");
    const [participantId, setParticipantId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [candidates, setCandidates] = useState([]);
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
        Promise.all(ids.map((id) => api.get(`/api/profile/users/${id}`).catch(() => null))).then((list) => {
            setCandidates(list.filter((u) => Boolean(u)));
        });
    }, []);
    async function create() {
        if (!subject.trim() || !participantId) {
            toast.error("Pick a participant and add a subject");
            return;
        }
        setSubmitting(true);
        try {
            const r = await api.post("/api/chat/threads", {
                subject,
                participantIds: [participantId],
            });
            onCreated(r.thread.id);
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Create failed");
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "w-[420px] max-w-[90vw] rounded-2xl border border-gold-700/40 bg-ink-900 p-6 shadow-2xl", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Users, { className: "h-4 w-4 text-gold-400" }), "Start a new thread"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Recipient" }), _jsxs("select", { className: "input", value: participantId, onChange: (e) => setParticipantId(e.target.value), children: [_jsx("option", { value: "", children: "Select a contact\u2026" }), candidates.map((c) => (_jsxs("option", { value: c.id, children: [c.displayName, " \u00B7 ", c.role.replace(/_/g, " "), " (", shortAddress(c.wallet), ")"] }, c.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Subject" }), _jsx("input", { className: "input", placeholder: "e.g. Loan #1024 \u2014 follow-up", value: subject, onChange: (e) => setSubject(e.target.value) })] })] }), _jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [_jsx("button", { className: "btn-ghost", onClick: onClose, children: "Cancel" }), _jsxs("button", { className: "btn-primary", onClick: create, disabled: submitting, children: [_jsx(Plus, { className: "h-4 w-4" }), submitting ? "Creating…" : "Create"] })] })] }) }));
}

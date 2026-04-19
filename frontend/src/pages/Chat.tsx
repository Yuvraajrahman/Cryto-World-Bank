import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MessageSquare, Send, Search, Shield } from "lucide-react";

interface Msg {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
}

const threads = [
  { id: "t1", name: "Dhaka Local Bank · Approver", last: "Please upload your income proof.", unread: 2 },
  { id: "t2", name: "World Bank Governor", last: "Allocation request acknowledged.", unread: 0 },
  { id: "t3", name: "Nigeria National Bank", last: "Thank you, loan disbursed.", unread: 0 },
];

const seed: Record<string, Msg[]> = {
  t1: [
    { id: "m1", from: "them", text: "Hi, we received your loan request. Could you upload your income proof for the last 3 months?", at: "10:12" },
    { id: "m2", from: "me", text: "Sure — uploading now through the Profile page.", at: "10:14" },
    { id: "m3", from: "them", text: "Please upload your income proof.", at: "10:15" },
  ],
  t2: [
    { id: "m1", from: "them", text: "Allocation request acknowledged.", at: "Yesterday" },
  ],
  t3: [
    { id: "m1", from: "them", text: "Thank you, loan disbursed.", at: "Mon" },
  ],
};

export function Chat() {
  const [activeId, setActiveId] = useState("t1");
  const [messages, setMessages] = useState<Record<string, Msg[]>>(seed);
  const [draft, setDraft] = useState("");

  function send() {
    if (!draft.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        { id: crypto.randomUUID(), from: "me", text: draft, at: "now" },
      ],
    }));
    setDraft("");
  }

  const active = threads.find((t) => t.id === activeId);
  const list = messages[activeId] ?? [];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Communication"
        title="Messages"
        description="Talk directly with the approver handling your loan. Every message is linked to your wallet identity."
      />

      <div className="card overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          <div className="border-b border-ink-700/50 md:border-b-0 md:border-r">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
                <input className="input pl-9" placeholder="Search threads…" />
              </div>
            </div>
            <ul className="max-h-[520px] overflow-y-auto">
              {threads.map((t) => (
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
                        <span className="truncate text-sm font-medium text-ink-100">{t.name}</span>
                        {t.unread ? <span className="badge-gold ml-2">{t.unread}</span> : null}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-ink-200">{t.last}</div>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-h-[520px] flex-col">
            <div className="flex items-center justify-between border-b border-ink-700/50 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-ink-100">{active?.name}</div>
                <div className="text-xs text-ink-200">Wallet-verified · end-to-end signed</div>
              </div>
              <span className="badge-gold">
                <Shield className="h-3.5 w-3.5" />
                Secure
              </span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {list.map((m) => (
                <div key={m.id} className={m.from === "me" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.from === "me"
                        ? "bg-gradient-to-b from-gold-500 to-gold-600 text-ink-900"
                        : "border border-ink-600/60 bg-ink-900/60 text-ink-100"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div
                      className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${
                        m.from === "me" ? "text-ink-900/60" : "text-ink-200"
                      }`}
                    >
                      {m.at}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-ink-700/50 p-4">
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Write a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <button className="btn-primary" onClick={send}>
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

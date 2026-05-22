import type { Role } from "@/lib/store";

export type FeatureKey =
  | "landing"
  | "dashboard"
  | "reserve"
  | "banks"
  | "loans"
  | "requestLoan"
  | "installments"
  | "approvals"
  | "market"
  | "messages"
  | "assistant"
  | "risk"
  | "profile"
  | "admin"
  | "unknown";

export function getFeatureKeyFromPath(pathname: string): FeatureKey {
  const p = pathname.toLowerCase();
  if (p === "/" || p.startsWith("/#")) return "landing";

  if (p.startsWith("/app/dashboard")) return "dashboard";
  if (p.startsWith("/app/reserve")) return "reserve";
  if (p.startsWith("/app/banks")) return "banks";
  if (p.startsWith("/app/loans/new")) return "requestLoan";
  if (p.startsWith("/app/loans")) return "loans";
  if (p.startsWith("/app/installments")) return "installments";
  if (p.startsWith("/app/approvals")) return "approvals";
  if (p.startsWith("/app/market")) return "market";
  if (p.startsWith("/app/chat")) return "messages";
  if (p.startsWith("/app/assistant")) return "assistant";
  if (p.startsWith("/app/risk")) return "risk";
  if (p.startsWith("/app/profile")) return "profile";
  if (p.startsWith("/app/admin")) return "admin";

  return "unknown";
}

function uniq(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const t = s.trim();
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function getRecommendedPrompts(featureKey: FeatureKey, role?: Role): string[] {
  const common = [
    "Explain the World → National → Local → Borrower hierarchy",
    "Where can I see reserves and allocations?",
  ];

  const byFeature: Record<FeatureKey, string[]> = {
    landing: [
      "What is Crypto World Bank in one minute?",
      "How does the 4-tier capital flow work?",
      "What are the APRs at each tier?",
      "How do I start using the platform?",
    ],
    dashboard: [
      "Summarize what I should do next",
      "Where do I find my recent activity?",
      "How do I switch roles or accounts?",
    ],
    reserve: [
      "What does the World Reserve balance represent?",
      "How are allocations to national banks enforced?",
      "What are the safety controls (Pausable, roles)?",
    ],
    banks: [
      "Show the bank tiers and what each can do",
      "How do I register a new bank?",
      "What does 'reserve' vs 'allocated' mean for a bank?",
    ],
    loans: [
      "What is my current borrowing limit?",
      "Show my most recent loan statuses",
      "What happens after a loan is approved?",
    ],
    requestLoan: [
      "How should I choose loan amount and term?",
      "What information improves approval odds?",
      "Why would a request be rejected?",
    ],
    installments: [
      "When is my next installment due?",
      "How do installment schedules work?",
      "What if I miss a payment?",
    ],
    approvals: [
      "What should I check before approving a loan?",
      "How do borrowing limits get computed?",
      "How should I interpret risk score outputs?",
    ],
    market: [
      "Summarize today's ETH and BTC move",
      "What is a safe way to interpret this chart?",
    ],
    messages: [
      "How do I start a new thread with an approver?",
      "What does wallet-verified messaging mean?",
    ],
    assistant: [
      "What can you help me with in this platform?",
      "Give me 3 useful things to try right now",
    ],
    risk: [
      "Explain the risk features used in scoring",
      "What does SHAP mean here?",
      "How should approvers use the risk console responsibly?",
    ],
    profile: [
      "What profile information affects borrowing limits?",
      "How do I update income information?",
    ],
    admin: [
      "How do I register a sub-bank safely?",
      "What admin actions require Governor vs bank admin?",
    ],
    unknown: ["What can you do here?", "Where should I go next?"],
  };

  const roleAddons: Partial<Record<Role, string[]>> = {
    BORROWER: [
      "Show my loan status",
      "What is my borrowing limit right now?",
      "Where do I pay installments?",
    ],
    APPROVER: ["Show pending loan requests", "What documents should I verify?"],
    LOCAL_BANK_ADMIN: ["Show pending approvals", "How do I manage local bank operations?"],
    NATIONAL_BANK_ADMIN: ["How do I register local banks?", "How do allocations flow to locals?"],
    OWNER: ["Show platform statistics", "How do I register a national bank?"],
  };

  return uniq([
    ...(byFeature[featureKey] ?? byFeature.unknown),
    ...(role ? roleAddons[role] ?? [] : []),
    ...common,
  ]).slice(0, 8);
}


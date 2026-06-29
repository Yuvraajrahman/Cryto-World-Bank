import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { computeBorrowingLimits, db, findBankById } from "../store/db";

export const chatbotRouter = Router();

// Intent taxonomy — keyword-based detection. Sprint 3 will swap this for a
// transformer-based classifier; the public response shape stays the same so
// the UI doesn't need any changes.
type Intent =
  | "loan_limit_query"
  | "payment_due_query"
  | "loan_status_query"
  | "bank_information"
  | "how_it_works"
  | "register_bank"
  | "greeting"
  | "general_question";

const INTENTS: Array<{ intent: Intent; keywords: string[]; confidence: number }> = [
  { intent: "greeting", keywords: ["hello", "hi ", "hey", "good morning", "good evening"], confidence: 0.95 },
  { intent: "loan_limit_query", keywords: ["limit", "how much can i borrow", "borrowing cap", "eligible"], confidence: 0.85 },
  { intent: "payment_due_query", keywords: ["next payment", "due", "installment", "when do i pay", "deadline"], confidence: 0.85 },
  { intent: "loan_status_query", keywords: ["status", "approved?", "my loan", "loan request"], confidence: 0.8 },
  { intent: "bank_information", keywords: ["bank", "national", "local", "hierarchy"], confidence: 0.7 },
  { intent: "how_it_works", keywords: ["how does", "what is", "explain", "how it works"], confidence: 0.7 },
  { intent: "register_bank", keywords: ["register", "onboard", "become a bank"], confidence: 0.8 },
];

function classify(q: string): { intent: Intent; confidence: number } {
  const t = q.toLowerCase();
  for (const row of INTENTS) {
    if (row.keywords.some((kw) => t.includes(kw))) {
      return { intent: row.intent, confidence: row.confidence };
    }
  }
  return { intent: "general_question", confidence: 0.4 };
}

const messageSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z
    .object({ loanId: z.string().optional(), bankId: z.string().optional() })
    .optional(),
});

chatbotRouter.post("/message", requireAuth, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = messageSchema.parse(req.body);
    const { intent, confidence } = classify(body.message);

    const reply = handleIntent(intent, confidence, body.message, user);

    res.json({
      reply: reply.text,
      intent,
      confidence,
      actions: reply.actions,
      suggestions: reply.suggestions,
      model: "cwb-intent-rules-v0",
    });
  } catch (err) {
    next(err);
  }
});

chatbotRouter.get("/welcome", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const suggestions =
    user.role === "BORROWER"
      ? [
          "What is my current borrowing limit?",
          "When is my next installment due?",
          "Show my loan status",
          "Explain how the 3-tier banking works",
        ]
      : user.role === "APPROVER" || user.role === "LOCAL_BANK_ADMIN"
        ? [
            "Show pending loan requests",
            "How do I review income proof?",
            "Explain borrowing limits policy",
          ]
        : [
            "Show bank hierarchy",
            "How do I register a new bank?",
            "Show platform statistics",
          ];
  res.json({
    greeting: `Hello ${user.displayName}! I'm your Crypto World Bank assistant. How can I help?`,
    suggestions,
  });
});

interface HandlerResult {
  text: string;
  actions: Array<{ label: string; href: string }>;
  suggestions: string[];
}

function handleIntent(
  intent: Intent,
  _confidence: number,
  raw: string,
  user: NonNullable<AuthedRequest["user"]>,
): HandlerResult {
  const base: HandlerResult = {
    text: "",
    actions: [],
    suggestions: [],
  };

  if (intent === "greeting") {
    return {
      text: `Hi ${user.displayName.split(" ")[0]}! Ask me about your borrowing limit, installments, or how Crypto World Bank works.`,
      actions: [],
      suggestions: [
        "What is my current borrowing limit?",
        "Show my active loans",
        "Explain the 3-tier banking",
      ],
    };
  }

  if (intent === "loan_limit_query" && user.role === "BORROWER") {
    const l = computeBorrowingLimits(user.id);
    return {
      text:
        `Your 6-month remaining limit is ${l.sixMonth.remaining.toFixed(2)} ETH ` +
        `(of ${l.sixMonth.limit.toFixed(2)} ETH). Your 1-year remaining limit is ` +
        `${l.oneYear.remaining.toFixed(2)} ETH. You have ${l.activeLoanCount} of ${l.maxActiveLoans} ` +
        `allowed active loans.` +
        (l.exceptionApplied ? " A good-history exception is currently active." : ""),
      actions: [
        { label: "Request a loan", href: "/app/loans/new" },
        { label: "See all loans", href: "/app/loans" },
      ],
      suggestions: ["When is my next installment due?", "Show my loan status"],
    };
  }

  if (intent === "payment_due_query" && user.role === "BORROWER") {
    const activeLoan = db.state.loans.find(
      (l) => l.borrowerId === user.id && (l.status === "ACTIVE" || l.status === "APPROVED"),
    );
    if (!activeLoan) {
      return {
        ...base,
        text: "You have no active loans, so there is nothing due right now.",
        suggestions: ["What is my current borrowing limit?"],
      };
    }
    const nextInst = activeLoan.installments.find((i) => !i.paid);
    if (!nextInst) {
      const d = activeLoan.deadline
        ? new Date(activeLoan.deadline).toLocaleDateString()
        : "N/A";
      return {
        ...base,
        text: `Your single-payment loan ${activeLoan.id} (${activeLoan.amount} ETH) is due on ${d}.`,
        actions: [{ label: "Pay loan", href: "/app/installments" }],
      };
    }
    const due = new Date(nextInst.dueDate);
    const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
    return {
      ...base,
      text:
        `Next installment #${nextInst.index} of ${nextInst.amount.toFixed(4)} ETH ` +
        `is due on ${due.toLocaleDateString()} (${days} days).`,
      actions: [{ label: "Pay installment", href: "/app/installments" }],
      suggestions: ["Show my loan status", "What is my borrowing limit?"],
    };
  }

  if (intent === "loan_status_query") {
    const loans = db.state.loans
      .filter((l) => l.borrowerId === user.id)
      .slice(0, 3);
    if (loans.length === 0) {
      return {
        ...base,
        text: "You haven't requested any loans yet. Would you like to start one?",
        actions: [{ label: "Request a loan", href: "/app/loans/new" }],
      };
    }
    const lines = loans
      .map((l) => `• ${l.id}: ${l.amount} ETH — ${l.status} (${new Date(l.createdAt).toLocaleDateString()})`)
      .join("\n");
    return {
      ...base,
      text: `Here are your most recent loans:\n${lines}`,
      actions: [{ label: "View all loans", href: "/app/loans" }],
    };
  }

  if (intent === "bank_information") {
    const world = db.state.banks.find((b) => b.tier === "WORLD");
    const nbs = db.state.banks.filter((b) => b.tier === "NATIONAL");
    const lbs = db.state.banks.filter((b) => b.tier === "LOCAL");
    return {
      ...base,
      text:
        `The network has 1 World Bank (${world?.reserve.toFixed(0)} ETH reserve), ` +
        `${nbs.length} National Banks, and ${lbs.length} Local Banks. ` +
        `Capital flows top-down: World → National → Local → Borrower.`,
      actions: [{ label: "Open bank network", href: "/app/banks" }],
      suggestions: ["How do I register a new bank?"],
    };
  }

  if (intent === "how_it_works") {
    return {
      ...base,
      text:
        "Crypto World Bank is a 3-tier decentralized lending platform. Deposits flow from the " +
        "World Reserve down to National Banks, then to Local Banks, then to Borrowers. Every " +
        "state change is a blockchain transaction, and a Random-Forest + SHAP risk model " +
        "surfaces explanations to approvers (Sprint 3 integration).",
      actions: [{ label: "Read more", href: "/#about" }],
    };
  }

  if (intent === "register_bank") {
    if (user.role === "OWNER" || user.role === "NATIONAL_BANK_ADMIN") {
      return {
        ...base,
        text: "You can register a sub-bank from the Admin page. Use 'Register National Bank' (OWNER) or 'Register Local Bank' (NB Admin).",
        actions: [{ label: "Admin", href: "/app/admin" }],
      };
    }
    return {
      ...base,
      text: "Bank registration requires a Governor (World) or National Bank Admin account. Institutions can contact the Crypto World Bank team to begin onboarding.",
    };
  }

  // Fallback — echo + ask for clarification.
  const userBank = user.bankId ? findBankById(user.bankId) : null;
  return {
    ...base,
    text:
      `I'm not fully sure what you meant by "${raw}". ` +
      (userBank ? `As the ${user.role} at ${userBank.name}, ` : "") +
      "you can ask about your borrowing limits, next installment, loan status, or how the platform works.",
    suggestions: [
      "What is my current borrowing limit?",
      "When is my next installment due?",
      "Explain how the 3-tier banking works",
    ],
  };
}

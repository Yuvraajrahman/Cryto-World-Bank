// In-memory domain store for the Crypto World Bank prototype.
// Encapsulates every Sprint-2 Sprint entity described in the CSE471 flow specs
// (loan requests, installments, income verification, chat, banking hierarchy).
// A persistent PostgreSQL/Prisma-backed repository can replace this module
// without changing the route handlers — all mutations go through helper
// functions defined here.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type UserRole =
  | "OWNER" // World-bank governor
  | "NATIONAL_BANK_ADMIN"
  | "LOCAL_BANK_ADMIN"
  | "APPROVER" // Loan approver at a local bank
  | "BORROWER";

export type BankTier = "WORLD" | "NATIONAL" | "LOCAL";

export type LoanKind = "BORROWER" | "LOCAL_FROM_NATIONAL" | "NATIONAL_FROM_WORLD";

export type LoanStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "REPAID"
  | "REJECTED"
  | "DEFAULTED";

export type TxType =
  | "LOAN_APPROVED"
  | "INSTALLMENT_PAID"
  | "LOAN_REPAID"
  | "ALLOCATION"
  | "DEPOSIT";

export type IncomeStatus = "UNSUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  wallet: string;
  displayName: string;
  email?: string;
  country?: string;
  role: UserRole;
  bankId?: string; // Present for bank staff
  consecutivePaidLoans: number;
  totalBorrowedLifetime: number; // ETH
  isFirstTime: boolean;
  monthlyIncomeUsd?: number;
  createdAt: string;
}

export interface Bank {
  id: string;
  tier: BankTier;
  name: string;
  walletAddress: string;
  jurisdiction?: string;
  city?: string;
  parentBankId?: string;
  // Capital position (ETH)
  reserve: number; // Funds on hand
  totalAllocated: number; // Sent to child banks
  totalLent: number; // Lent to borrowers (local) or national (world)
  totalRepaid: number;
  aprBps: number; // Rate charged to the tier below
  createdAt: string;
}

export interface Installment {
  index: number;
  amount: number; // ETH
  dueDate: string;
  paid: boolean;
  paidAt?: string;
  txHash?: string;
}

export interface Loan {
  id: string;
  kind: LoanKind;
  borrowerId?: string; // User id (kind === BORROWER)
  bankRequesterId?: string; // Bank id (LOCAL_FROM_NATIONAL / NATIONAL_FROM_WORLD)
  lenderBankId: string; // Bank that is funding
  amount: number; // ETH
  purpose: string;
  aprBps: number;
  termMonths: number;
  category?: string;
  status: LoanStatus;
  isInstallment: boolean;
  installments: Installment[];
  riskScore?: number;
  gasCostEth?: number;
  approvedBy?: string; // userId
  rejectedBy?: string;
  rejectionReason?: string;
  txHash?: string;
  deadline?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  repaidAt?: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  userId?: string;
  bankId?: string;
  loanId?: string;
  amount: number;
  note?: string;
  txHash?: string;
  at: string;
}

export interface IncomeProof {
  id: string;
  userId: string;
  fileName: string;
  mimeType: string;
  // Base64-encoded file content (<=10MB, enforced at the route layer).
  contentBase64: string;
  sha256: string;
  monthlyIncomeUsd?: number;
  status: IncomeStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  subject: string;
  participants: string[]; // userIds
  createdAt: string;
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

interface DB {
  users: User[];
  banks: Bank[];
  loans: Loan[];
  transactions: Transaction[];
  incomeProofs: IncomeProof[];
  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];
}

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function monthsFromNow(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString();
}

function seed(): DB {
  const worldBank: Bank = {
    id: "bank_world",
    tier: "WORLD",
    name: "Crypto World Bank Reserve",
    walletAddress: "0x0000000000000000000000000000000000000001",
    jurisdiction: "Global",
    reserve: 3000,
    totalAllocated: 1010,
    totalLent: 1010,
    totalRepaid: 120,
    aprBps: 300,
    createdAt: nowIso(),
  };

  const nationalBanks: Bank[] = [
    {
      id: "bank_nb_bd",
      tier: "NATIONAL",
      name: "Bangladesh National Bank",
      walletAddress: "0x00000000000000000000000000000000000000Bd",
      jurisdiction: "Bangladesh",
      parentBankId: worldBank.id,
      reserve: 420,
      totalAllocated: 160,
      totalLent: 160,
      totalRepaid: 42,
      aprBps: 500,
      createdAt: nowIso(),
    },
    {
      id: "bank_nb_ng",
      tier: "NATIONAL",
      name: "Nigeria National Bank",
      walletAddress: "0x00000000000000000000000000000000000000Ng",
      jurisdiction: "Nigeria",
      parentBankId: worldBank.id,
      reserve: 380,
      totalAllocated: 195,
      totalLent: 195,
      totalRepaid: 38,
      aprBps: 500,
      createdAt: nowIso(),
    },
    {
      id: "bank_nb_id",
      tier: "NATIONAL",
      name: "Indonesia National Bank",
      walletAddress: "0x00000000000000000000000000000000000000ID",
      jurisdiction: "Indonesia",
      parentBankId: worldBank.id,
      reserve: 310,
      totalAllocated: 95,
      totalLent: 95,
      totalRepaid: 12,
      aprBps: 500,
      createdAt: nowIso(),
    },
  ];

  const localBanks: Bank[] = [
    {
      id: "bank_lb_dhaka",
      tier: "LOCAL",
      name: "Dhaka Local Bank",
      walletAddress: "0x000000000000000000000000000000000000D4KA",
      jurisdiction: "Bangladesh",
      city: "Dhaka",
      parentBankId: "bank_nb_bd",
      reserve: 90,
      totalAllocated: 0,
      totalLent: 38,
      totalRepaid: 9,
      aprBps: 800,
      createdAt: nowIso(),
    },
    {
      id: "bank_lb_chittagong",
      tier: "LOCAL",
      name: "Chittagong Local Bank",
      walletAddress: "0x00000000000000000000000000000000000cht8",
      jurisdiction: "Bangladesh",
      city: "Chittagong",
      parentBankId: "bank_nb_bd",
      reserve: 70,
      totalAllocated: 0,
      totalLent: 24,
      totalRepaid: 6,
      aprBps: 800,
      createdAt: nowIso(),
    },
    {
      id: "bank_lb_lagos",
      tier: "LOCAL",
      name: "Lagos Local Bank",
      walletAddress: "0x00000000000000000000000000000000000L4G0",
      jurisdiction: "Nigeria",
      city: "Lagos",
      parentBankId: "bank_nb_ng",
      reserve: 110,
      totalAllocated: 0,
      totalLent: 42,
      totalRepaid: 9,
      aprBps: 800,
      createdAt: nowIso(),
    },
    {
      id: "bank_lb_abuja",
      tier: "LOCAL",
      name: "Abuja Local Bank",
      walletAddress: "0x00000000000000000000000000000000000Abuj",
      jurisdiction: "Nigeria",
      city: "Abuja",
      parentBankId: "bank_nb_ng",
      reserve: 85,
      totalAllocated: 0,
      totalLent: 18,
      totalRepaid: 3,
      aprBps: 800,
      createdAt: nowIso(),
    },
    {
      id: "bank_lb_jakarta",
      tier: "LOCAL",
      name: "Jakarta Local Bank",
      walletAddress: "0x0000000000000000000000000000000000JAKA1",
      jurisdiction: "Indonesia",
      city: "Jakarta",
      parentBankId: "bank_nb_id",
      reserve: 95,
      totalAllocated: 0,
      totalLent: 21,
      totalRepaid: 4,
      aprBps: 800,
      createdAt: nowIso(),
    },
  ];

  const users: User[] = [
    {
      id: "usr_governor",
      wallet: "0xDEa0000000000000000000000000000000000b17",
      displayName: "World Bank Governor",
      email: "governor@cwb.example",
      role: "OWNER",
      consecutivePaidLoans: 0,
      totalBorrowedLifetime: 0,
      isFirstTime: false,
      createdAt: nowIso(),
    },
    {
      id: "usr_nb_admin_bd",
      wallet: "0xBD00000000000000000000000000000000000Ad1",
      displayName: "Bangladesh NB Admin",
      role: "NATIONAL_BANK_ADMIN",
      bankId: "bank_nb_bd",
      consecutivePaidLoans: 0,
      totalBorrowedLifetime: 0,
      isFirstTime: false,
      createdAt: nowIso(),
    },
    {
      id: "usr_lb_admin_dhaka",
      wallet: "0xD4KA00000000000000000000000000000000000A",
      displayName: "Dhaka LB Admin",
      role: "LOCAL_BANK_ADMIN",
      bankId: "bank_lb_dhaka",
      consecutivePaidLoans: 0,
      totalBorrowedLifetime: 0,
      isFirstTime: false,
      createdAt: nowIso(),
    },
    {
      id: "usr_approver_dhaka",
      wallet: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1",
      displayName: "Fatima Khan",
      role: "APPROVER",
      bankId: "bank_lb_dhaka",
      consecutivePaidLoans: 0,
      totalBorrowedLifetime: 0,
      isFirstTime: false,
      createdAt: nowIso(),
    },
    {
      id: "usr_borrower_demo",
      wallet: "0xB0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0",
      displayName: "Md. Bokhtiar Rahman",
      email: "bokhtiar@example.com",
      country: "Bangladesh",
      role: "BORROWER",
      consecutivePaidLoans: 2,
      totalBorrowedLifetime: 8.5,
      isFirstTime: false,
      monthlyIncomeUsd: 1400,
      createdAt: nowIso(),
    },
    {
      id: "usr_borrower_new",
      wallet: "0xCA11FED0000000000000000000000000000000C5",
      displayName: "Aisha Adewale",
      email: "aisha@example.com",
      country: "Nigeria",
      role: "BORROWER",
      consecutivePaidLoans: 0,
      totalBorrowedLifetime: 0,
      isFirstTime: true,
      createdAt: nowIso(),
    },
  ];

  const demoLoan: Loan = {
    id: "loan_1024",
    kind: "BORROWER",
    borrowerId: "usr_borrower_demo",
    lenderBankId: "bank_lb_dhaka",
    amount: 5,
    purpose: "Inventory restock for grocery shop",
    aprBps: 800,
    termMonths: 12,
    category: "Small Business",
    status: "ACTIVE",
    isInstallment: false,
    installments: Array.from({ length: 12 }).map((_, i) => ({
      index: i + 1,
      amount: 0.45,
      dueDate: monthsFromNow(i + 1),
      paid: i < 4,
      paidAt: i < 4 ? monthsFromNow(i + 1 - 12) : undefined,
      txHash:
        i < 4
          ? `0x${crypto.randomBytes(8).toString("hex")}${crypto.randomBytes(8).toString("hex")}`
          : undefined,
    })),
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    deadline: monthsFromNow(8),
    approvedBy: "usr_approver_dhaka",
    txHash: `0x${crypto.randomBytes(16).toString("hex")}`,
    riskScore: 0.28,
  };

  const pendingLoan: Loan = {
    id: "loan_pending_1",
    kind: "BORROWER",
    borrowerId: "usr_borrower_new",
    lenderBankId: "bank_lb_lagos",
    amount: 1.2,
    purpose: "Working capital for textile microshop",
    aprBps: 800,
    termMonths: 6,
    category: "Working Capital",
    status: "PENDING",
    isInstallment: false,
    installments: [],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    gasCostEth: 0.0042,
  };

  const transactions: Transaction[] = [
    {
      id: uid("tx"),
      type: "LOAN_APPROVED",
      userId: "usr_borrower_demo",
      bankId: "bank_lb_dhaka",
      loanId: demoLoan.id,
      amount: 5,
      at: demoLoan.approvedAt!,
      txHash: demoLoan.txHash,
    },
    ...demoLoan.installments
      .filter((x) => x.paid)
      .map((x) => ({
        id: uid("tx"),
        type: "INSTALLMENT_PAID" as const,
        userId: "usr_borrower_demo",
        bankId: "bank_lb_dhaka",
        loanId: demoLoan.id,
        amount: x.amount,
        at: x.paidAt!,
        txHash: x.txHash,
      })),
  ];

  const thread1: ChatThread = {
    id: "thread_demo_dhaka",
    subject: "Loan #1024 — income proof",
    participants: ["usr_borrower_demo", "usr_approver_dhaka"],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    lastMessageAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  };

  const chatMessages: ChatMessage[] = [
    {
      id: uid("msg"),
      threadId: thread1.id,
      senderId: "usr_approver_dhaka",
      body: "Hi, we received your loan request. Could you upload your income proof for the last 3 months?",
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: uid("msg"),
      threadId: thread1.id,
      senderId: "usr_borrower_demo",
      body: "Sure — uploading now through the Profile page.",
      createdAt: new Date(Date.now() - 6 * 86400000 + 1800000).toISOString(),
    },
    {
      id: uid("msg"),
      threadId: thread1.id,
      senderId: "usr_approver_dhaka",
      body: "Thanks — we'll review and get back to you shortly.",
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
  ];

  return {
    users,
    banks: [worldBank, ...nationalBanks, ...localBanks],
    loans: [demoLoan, pendingLoan],
    transactions,
    incomeProofs: [],
    chatThreads: [thread1],
    chatMessages,
  };
}

// ---------- Persistence ----------
//
// The prototype's source of truth is this in-memory object tree. To close the
// Sprint-1 "database schema implemented" gap without pulling Postgres into the
// dev loop, we snapshot the tree to a JSON file and hydrate on boot. This is
// not Prisma — schema.prisma still captures the target model — but it keeps
// demo data intact across restarts.

const DATA_FILE =
  process.env.CWB_DATA_FILE ??
  path.resolve(process.cwd(), ".data", "state.json");

const PERSIST_DISABLED =
  process.env.CWB_PERSIST === "0" || process.env.NODE_ENV === "test";

function loadFromDisk(): DB | null {
  if (PERSIST_DISABLED) return null;
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DB;
    // Minimal shape check: every top-level collection must be an array.
    for (const key of [
      "users",
      "banks",
      "loans",
      "transactions",
      "incomeProofs",
      "chatThreads",
      "chatMessages",
    ] as const) {
      if (!Array.isArray(parsed[key])) return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveToDisk(): void {
  if (PERSIST_DISABLED) return;
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state));
    fs.renameSync(tmp, DATA_FILE);
  } catch {
    // Best-effort: never block the API on a snapshot failure.
  }
}

let state: DB = loadFromDisk() ?? seed();

// Periodic snapshot every 3s and on process shutdown so Sprint-2 flows survive
// a `tsx watch` restart or a crash.
if (!PERSIST_DISABLED) {
  const snapshotTimer = setInterval(saveToDisk, 3000);
  snapshotTimer.unref();
  for (const sig of ["SIGINT", "SIGTERM", "beforeExit"] as const) {
    process.once(sig, () => {
      saveToDisk();
    });
  }
}

export const db = {
  get state() {
    return state;
  },
  reset() {
    state = seed();
    saveToDisk();
  },
  save: saveToDisk,
  reload() {
    const hydrated = loadFromDisk();
    if (hydrated) state = hydrated;
  },
  uid,
  nowIso,
  dataFile: DATA_FILE,
};

// ---------- Generic helpers ----------

export function findUserByWallet(wallet: string): User | undefined {
  const w = wallet.toLowerCase();
  return state.users.find((u) => u.wallet.toLowerCase() === w);
}

export function findUserById(id: string): User | undefined {
  return state.users.find((u) => u.id === id);
}

export function findBankById(id: string): Bank | undefined {
  return state.banks.find((b) => b.id === id);
}

export function upsertUserByWallet(
  wallet: string,
  overrides: Partial<User> = {},
): User {
  const existing = findUserByWallet(wallet);
  if (existing) {
    Object.assign(existing, overrides);
    return existing;
  }
  const user: User = {
    id: uid("usr"),
    wallet,
    displayName: overrides.displayName ?? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`,
    role: overrides.role ?? "BORROWER",
    email: overrides.email,
    country: overrides.country,
    bankId: overrides.bankId,
    consecutivePaidLoans: 0,
    totalBorrowedLifetime: 0,
    isFirstTime: true,
    monthlyIncomeUsd: overrides.monthlyIncomeUsd,
    createdAt: nowIso(),
  };
  state.users.push(user);
  return user;
}

// ---------- Borrowing limit logic (mirrors CSE471_BORROWING_LIMIT_FLOW.md) ----------

export interface BorrowingLimits {
  sixMonth: {
    limit: number;
    borrowed: number;
    remaining: number;
  };
  oneYear: {
    limit: number;
    borrowed: number;
    remaining: number;
  };
  activeLoanCount: number;
  maxActiveLoans: number;
  exceptionApplied: boolean;
  baseCap: number;
}

export function computeBorrowingLimits(userId: string): BorrowingLimits {
  const u = findUserById(userId);
  if (!u) {
    throw new Error("user_not_found");
  }

  const now = Date.now();
  const sixMonthCutoff = now - 182 * 86400000;
  const yearCutoff = now - 365 * 86400000;

  const loans = state.loans.filter(
    (l) =>
      l.borrowerId === userId &&
      (l.status === "APPROVED" || l.status === "ACTIVE" || l.status === "REPAID"),
  );

  const sumSince = (cutoff: number) =>
    loans
      .filter((l) => l.approvedAt && new Date(l.approvedAt).getTime() >= cutoff)
      .reduce((acc, l) => acc + l.amount, 0);

  const borrowed6m = sumSince(sixMonthCutoff);
  const borrowed1y = sumSince(yearCutoff);

  // Base caps per the spec: 5 ETH (6-month), 10 ETH (1-year)
  let sixMonthCap = 5;
  let oneYearCap = 10;
  const baseCap = 5;

  // Multiplier: 1.5x after 3 consecutive paid loans, 1.2x when lifetime > 10 ETH
  if (u.consecutivePaidLoans >= 3) {
    sixMonthCap *= 1.5;
    oneYearCap *= 1.5;
  }
  if (u.totalBorrowedLifetime > 10) {
    sixMonthCap *= 1.2;
    oneYearCap *= 1.2;
  }

  // Hard safety cap
  sixMonthCap = Math.min(sixMonthCap, 50);
  oneYearCap = Math.min(oneYearCap, 100);

  const activeLoanCount = state.loans.filter(
    (l) =>
      l.borrowerId === userId && (l.status === "APPROVED" || l.status === "ACTIVE"),
  ).length;

  const exceptionApplied = u.consecutivePaidLoans >= 3;
  const maxActiveLoans = exceptionApplied ? 2 : 1;

  return {
    sixMonth: {
      limit: sixMonthCap,
      borrowed: borrowed6m,
      remaining: Math.max(0, sixMonthCap - borrowed6m),
    },
    oneYear: {
      limit: oneYearCap,
      borrowed: borrowed1y,
      remaining: Math.max(0, oneYearCap - borrowed1y),
    },
    activeLoanCount,
    maxActiveLoans,
    exceptionApplied,
    baseCap,
  };
}

// ---------- Installment schedule ----------

export function buildInstallmentSchedule(amount: number, termMonths: number): Installment[] {
  const installments: Installment[] = [];
  const perInstallment = amount / termMonths;
  for (let i = 0; i < termMonths; i += 1) {
    installments.push({
      index: i + 1,
      amount: Number(perInstallment.toFixed(6)),
      dueDate: monthsFromNow(i + 1),
      paid: false,
    });
  }
  return installments;
}

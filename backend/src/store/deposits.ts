import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type DepositLedgerEntry = {
  id: string;
  userId: string;
  kind: "VAULT_DEPOSIT" | "VAULT_WITHDRAW" | "FD_OPEN" | "FD_MATURE" | "FD_EARLY" | "CHECK_SEND" | "CHECK_RECV";
  amount: number;
  note?: string;
  counterparty?: string;
  txHash?: string;
  at: string;
};

export type FixedDeposit = {
  id: string;
  userId: string;
  principal: number;
  termDays: number;
  aprBps: number;
  openedAt: string;
  maturesAt: string;
  status: "ACTIVE" | "MATURED" | "WITHDRAWN" | "EARLY_WITHDRAWN";
  penaltyBps: number;
};

type DepositsState = {
  vaultBalances: Record<string, number>;
  checkingBalances: Record<string, number>;
  fixedDeposits: FixedDeposit[];
  ledger: DepositLedgerEntry[];
};

const DATA_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", ".data")
    : path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "deposits.json");

function uid(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

function load(): DepositsState {
  try {
    if (fs.existsSync(FILE)) {
      return JSON.parse(fs.readFileSync(FILE, "utf8")) as DepositsState;
    }
  } catch {
    /* fall through */
  }
  return { vaultBalances: {}, checkingBalances: {}, fixedDeposits: [], ledger: [] };
}

function save(state: DepositsState) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
}

let state = load();

export const depositsDb = {
  get state() {
    return state;
  },
  save() {
    save(state);
  },
  reload() {
    state = load();
  },
  uid,
  nowIso,
};

export const VAULT_APY_BPS = 420;
/** Interest split of variable vault yield (basis points of total yield). */
export const YIELD_SPLIT = {
  depositorBps: 7000,
  insuranceBps: 2000,
  protocolBps: 1000,
} as const;
export const FD_TERMS: Array<{ termDays: number; aprBps: number }> = [
  { termDays: 30, aprBps: 500 },
  { termDays: 90, aprBps: 650 },
  { termDays: 180, aprBps: 800 },
  { termDays: 365, aprBps: 950 },
];
export const EARLY_PENALTY_BPS = 200;
/** Demo system reserve ratio vs minimum (bps). Override with DEPOSITS_RESERVE_OK=false. */
export const RESERVE_RATIO_BPS = 2500;
export const RESERVE_MIN_BPS = 2000;
export const RESERVE_RATIO_OK =
  process.env.DEPOSITS_RESERVE_OK !== "false" && RESERVE_RATIO_BPS >= RESERVE_MIN_BPS;

/** Simple accrued yield projection: ~1 month of APY on current principal. */
export function estimateAccruedYield(principal: number): number {
  if (principal <= 0) return 0;
  return (principal * VAULT_APY_BPS) / (10_000 * 12);
}

export function ensureBalances(userId: string) {
  if (state.vaultBalances[userId] == null) state.vaultBalances[userId] = 0;
  if (state.checkingBalances[userId] == null) {
    // seed a small checking balance for demo UX
    state.checkingBalances[userId] = 2.5;
  }
}

export function pushLedger(entry: Omit<DepositLedgerEntry, "id" | "at"> & { at?: string }) {
  const row: DepositLedgerEntry = {
    id: uid("dep"),
    at: entry.at ?? nowIso(),
    userId: entry.userId,
    kind: entry.kind,
    amount: entry.amount,
    note: entry.note,
    counterparty: entry.counterparty,
    txHash: entry.txHash ?? `0x${crypto.randomBytes(16).toString("hex")}`,
  };
  state.ledger.unshift(row);
  return row;
}

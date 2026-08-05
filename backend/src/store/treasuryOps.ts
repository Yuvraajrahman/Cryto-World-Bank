/**
 * Off-chain treasury FX swap store (USDC ↔ ETH) between World / National / Local banks.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type TreasuryAsset = "USDC" | "ETH";

export type TreasurySwapStatus =
  | "PROPOSED"
  | "PENDING_MULTISIG"
  | "SETTLED"
  | "REJECTED"
  | "CANCELLED";

export type TreasurySwap = {
  id: string;
  initiatorBankId: string;
  counterpartyBankId: string;
  sellAsset: TreasuryAsset;
  buyAsset: TreasuryAsset;
  sellAmount: number;
  buyAmount: number;
  rateUsdcPerEth: number;
  spreadBps: number;
  status: TreasurySwapStatus;
  createdAt: string;
  createdBy: string;
  settledAt?: string;
  settledBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  note?: string;
  requiresMultisig: boolean;
};

type TreasuryState = {
  /** ETH treasury balances by bank id (USDC uses bank.reserve). */
  ethBalances: Record<string, number>;
  swaps: TreasurySwap[];
  oracleUsdcPerEth: number;
  spreadBps: number;
  largeSwapUsdcThreshold: number;
};

const DATA_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", ".data")
    : path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "treasury-ops.json");

function uid(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

function seed(): TreasuryState {
  return {
    ethBalances: {},
    swaps: [],
    oracleUsdcPerEth: 3200,
    spreadBps: 25,
    largeSwapUsdcThreshold: 1_000_000,
  };
}

function load(): TreasuryState {
  try {
    if (fs.existsSync(FILE)) {
      return { ...seed(), ...JSON.parse(fs.readFileSync(FILE, "utf8")) } as TreasuryState;
    }
  } catch {
    /* fall through */
  }
  return seed();
}

function save(state: TreasuryState) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
}

let state = load();

export const treasuryOpsDb = {
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
  ensureEth(bankId: string, seedAmount = 0) {
    if (state.ethBalances[bankId] == null) {
      state.ethBalances[bankId] = seedAmount;
    }
    return state.ethBalances[bankId]!;
  },
  getEth(bankId: string) {
    return state.ethBalances[bankId] ?? 0;
  },
  setEth(bankId: string, amount: number) {
    state.ethBalances[bankId] = Math.max(0, amount);
  },
};

/** Quote buy amount after spread (seller pays spread). */
export function quoteBuyAmount(
  sellAsset: TreasuryAsset,
  sellAmount: number,
  rateUsdcPerEth: number,
  spreadBps: number,
): number {
  const mult = 1 - spreadBps / 10_000;
  if (sellAsset === "USDC") {
    // sell USDC → buy ETH
    return (sellAmount / rateUsdcPerEth) * mult;
  }
  // sell ETH → buy USDC
  return sellAmount * rateUsdcPerEth * mult;
}

export function usdcNotional(
  sellAsset: TreasuryAsset,
  sellAmount: number,
  rateUsdcPerEth: number,
): number {
  return sellAsset === "USDC" ? sellAmount : sellAmount * rateUsdcPerEth;
}

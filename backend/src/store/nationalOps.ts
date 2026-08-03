import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type CapitalRequest = {
  id: string;
  fromBankId: string;
  fromBankName: string;
  toBankId: string;
  amount: number;
  reason: string;
  status: "OPEN" | "APPROVED" | "DENIED";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
};

export type SettingsChange = {
  id: string;
  bankId: string;
  field: "aprBps" | "minReserveRatio" | "kinkBps" | "kinkMultiplierBps";
  fromValue: number;
  toValue: number;
  changedBy: string;
  at: string;
  note?: string;
};

export type NationalParams = {
  bankId: string;
  aprBps: number;
  minReserveRatio: number;
  /** Utilization kink (bps of capacity) where rate steepens — demo parameter */
  kinkBps: number;
  kinkMultiplierBps: number;
};

type NationalOpsState = {
  capitalRequests: CapitalRequest[];
  settingsHistory: SettingsChange[];
  params: NationalParams[];
};

const DATA_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", ".data")
    : path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "national-ops.json");

function uid(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

function seed(): NationalOpsState {
  return {
    params: [
      {
        bankId: "bank_nb_bd",
        aprBps: 500,
        minReserveRatio: 0.15,
        kinkBps: 8000,
        kinkMultiplierBps: 15000,
      },
      {
        bankId: "bank_nb_ng",
        aprBps: 500,
        minReserveRatio: 0.15,
        kinkBps: 8000,
        kinkMultiplierBps: 15000,
      },
      {
        bankId: "bank_nb_id",
        aprBps: 500,
        minReserveRatio: 0.15,
        kinkBps: 8000,
        kinkMultiplierBps: 15000,
      },
    ],
    settingsHistory: [
      {
        id: "nset_seed_1",
        bankId: "bank_nb_bd",
        field: "aprBps",
        fromValue: 450,
        toValue: 500,
        changedBy: "usr_nb_admin_bd",
        at: "2026-03-01T10:00:00.000Z",
        note: "Baseline lending APR aligned to jurisdiction policy",
      },
    ],
    capitalRequests: [
      {
        id: "creq_demo_dhaka",
        fromBankId: "bank_lb_dhaka",
        fromBankName: "Dhaka Local Bank",
        toBankId: "bank_nb_bd",
        amount: 25,
        reason: "Seasonal lending demand — SME credit window",
        status: "OPEN",
        createdAt: nowIso(),
      },
      {
        id: "creq_demo_ctg",
        fromBankId: "bank_lb_chittagong",
        fromBankName: "Chittagong Local Bank",
        toBankId: "bank_nb_bd",
        amount: 12,
        reason: "Top-up after portfolio growth",
        status: "OPEN",
        createdAt: nowIso(),
      },
    ],
  };
}

function load(): NationalOpsState {
  try {
    if (fs.existsSync(FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as NationalOpsState;
      const base = seed();
      return {
        params: parsed.params?.length ? parsed.params : base.params,
        settingsHistory: parsed.settingsHistory ?? base.settingsHistory,
        capitalRequests: parsed.capitalRequests ?? base.capitalRequests,
      };
    }
  } catch {
    /* fall through */
  }
  const s = seed();
  save(s);
  return s;
}

function save(state: NationalOpsState) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
  } catch {
    // Best-effort: never block boot/requests on a snapshot failure.
  }
}

let state = load();

export const nationalOpsDb = {
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
  paramsFor(bankId: string): NationalParams {
    let row = state.params.find((p) => p.bankId === bankId);
    if (!row) {
      row = {
        bankId,
        aprBps: 500,
        minReserveRatio: 0.15,
        kinkBps: 8000,
        kinkMultiplierBps: 15000,
      };
      state.params.push(row);
      save(state);
    }
    return row;
  },
};

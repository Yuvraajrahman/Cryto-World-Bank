import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type AmlAlert = {
  id: string;
  bankId: string;
  clientUserId: string;
  clientName: string;
  clientWallet: string;
  anomalyScore: number;
  reason: string;
  txRef?: string;
  status: "OPEN" | "DISMISSED" | "ESCALATED" | "FROZEN" | "CLOSED" | "ESCALATED_WORLD";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  /** Present when escalated to National Bank SAR queue */
  sarRef?: string;
};

export type BankStaffRecord = {
  id: string;
  bankId: string;
  userId: string;
  displayName: string;
  wallet: string;
  role: "LOCAL_BANK_ADMIN" | "APPROVER";
  status: "ACTIVE" | "SUSPENDED";
  addedAt: string;
  suspendedAt?: string;
};

type LocalOpsState = {
  amlAlerts: AmlAlert[];
  staff: BankStaffRecord[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "local-ops.json");

function uid(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

function seed(): LocalOpsState {
  return {
    staff: [
      {
        id: "staff_lb_admin",
        bankId: "bank_lb_dhaka",
        userId: "usr_lb_admin_dhaka",
        displayName: "Dhaka LB Admin",
        wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        role: "LOCAL_BANK_ADMIN",
        status: "ACTIVE",
        addedAt: "2026-04-19T16:07:25.138Z",
      },
      {
        id: "staff_approver",
        bankId: "bank_lb_dhaka",
        userId: "usr_approver_dhaka",
        displayName: "Dhaka Approver",
        wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        role: "APPROVER",
        status: "ACTIVE",
        addedAt: "2026-04-19T16:07:25.138Z",
      },
    ],
    amlAlerts: [
      {
        id: "aml_demo_1",
        bankId: "bank_lb_dhaka",
        clientUserId: "usr_borrower_demo",
        clientName: "Md. Bokhtiar",
        clientWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        anomalyScore: 0.81,
        reason: "Isolation Forest: unusual repayment clustering vs peer cohort",
        txRef: "loan_1024",
        status: "OPEN",
        createdAt: nowIso(),
      },
      {
        id: "aml_demo_2",
        bankId: "bank_lb_dhaka",
        clientUserId: "usr_borrower_new",
        clientName: "Aisha",
        clientWallet: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        anomalyScore: 0.62,
        reason: "Rapid successive small transfers after first deposit",
        status: "OPEN",
        createdAt: nowIso(),
      },
      {
        id: "aml_sar_demo",
        bankId: "bank_lb_chittagong",
        clientUserId: "usr_borrower_demo",
        clientName: "Md. Bokhtiar",
        clientWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        anomalyScore: 0.88,
        reason: "Escalated SAR: structured repayments inconsistent with declared income",
        txRef: "loan_ctg_flag",
        status: "ESCALATED",
        sarRef: "SAR-AML_SAR_DEMO",
        resolutionNote: "SAR draft: Local approver escalated for NB review",
        resolvedAt: nowIso(),
        resolvedBy: "usr_approver_dhaka",
        createdAt: nowIso(),
      },
    ],
  };
}

function load(): LocalOpsState {
  try {
    if (fs.existsSync(FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as LocalOpsState;
      const seeded = seed();
      if (!parsed.staff?.length) parsed.staff = seeded.staff;
      if (!parsed.amlAlerts) parsed.amlAlerts = seeded.amlAlerts;
      const hasSar = parsed.amlAlerts.some((a) => a.id === "aml_sar_demo");
      if (!hasSar) {
        const demo = seeded.amlAlerts.find((a) => a.id === "aml_sar_demo");
        if (demo) parsed.amlAlerts.push(demo);
        save(parsed);
      }
      // Keep at least one open ESCALATED SAR for NB demo when queue empty
      const childBanks = new Set(["bank_lb_dhaka", "bank_lb_chittagong"]);
      const openSar = parsed.amlAlerts.some(
        (a) => childBanks.has(a.bankId) && a.status === "ESCALATED",
      );
      if (!openSar) {
        parsed.amlAlerts.unshift({
          id: uid("aml"),
          bankId: "bank_lb_dhaka",
          clientUserId: "usr_borrower_demo",
          clientName: "Md. Bokhtiar",
          clientWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
          anomalyScore: 0.79,
          reason: "Re-queued SAR: unusual inflow pattern vs income affidavit",
          status: "ESCALATED",
          sarRef: "SAR-REQUEUE-DEMO",
          resolutionNote: "SAR draft: Local desk re-escalated for NB review",
          resolvedAt: nowIso(),
          resolvedBy: "usr_approver_dhaka",
          createdAt: nowIso(),
        });
        save(parsed);
      }
      return parsed;
    }
  } catch {
    /* fall through */
  }
  const s = seed();
  save(s);
  return s;
}

function save(state: LocalOpsState) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
}

let state = load();

export const localOpsDb = {
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

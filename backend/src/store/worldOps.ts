import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/** MVT target: 2-of-3 Safe multisig for World Bank admin actions */
export const MULTISIG_THRESHOLD = 2;

export type MultisigSigner = {
  wallet: string;
  displayName: string;
  userId: string;
};

export type MultisigTx = {
  id: string;
  title: string;
  description: string;
  action:
    | "ALLOCATE_CAPITAL"
    | "REGISTER_NATIONAL"
    | "PAUSE_NATIONAL"
    | "SET_PARAM"
    | "CUSTOM";
  payload: Record<string, unknown>;
  status: "PENDING" | "EXECUTED" | "CANCELLED";
  createdAt: string;
  createdBy: string;
  signatures: string[]; // wallets
  executedAt?: string;
  executedBy?: string;
};

export type GovernanceProposal = {
  id: string;
  title: string;
  parameter: string;
  currentValue: string;
  proposedValue: string;
  justification: string;
  status: "VOTING" | "PASSED_TIMELOCK" | "EXECUTED" | "DEFEATED" | "EXPIRED";
  createdAt: string;
  createdBy: string;
  votingEndsAt: string;
  timelockEndsAt?: string;
  votesFor: string[];
  votesAgainst: string[];
  executedAt?: string;
};

type WorldOpsState = {
  signers: MultisigSigner[];
  threshold: number;
  multisigTxs: MultisigTx[];
  proposals: GovernanceProposal[];
  globalParams: {
    minReserveRatio: number;
    worldAprBps: number;
  };
};

const DATA_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", ".data")
    : path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "world-ops.json");

function uid(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function seed(): WorldOpsState {
  const signers: MultisigSigner[] = [
    {
      wallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      displayName: "Governor (signer 1)",
      userId: "usr_governor",
    },
    {
      wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      displayName: "NB Admin BD (signer 2)",
      userId: "usr_nb_admin_bd",
    },
    {
      wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      displayName: "LB Admin Dhaka (signer 3)",
      userId: "usr_lb_admin_dhaka",
    },
  ];

  return {
    signers,
    threshold: MULTISIG_THRESHOLD,
    globalParams: {
      minReserveRatio: 0.15,
      worldAprBps: 300,
    },
    multisigTxs: [
      {
        id: "msig_demo_alloc",
        title: "Allocate 40 ETH to Bangladesh NB",
        description: "Top-up jurisdiction reserve ahead of SME lending window",
        action: "ALLOCATE_CAPITAL",
        payload: { toBankId: "bank_nb_bd", amount: 40 },
        status: "PENDING",
        createdAt: nowIso(),
        createdBy: "usr_governor",
        signatures: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
      },
      {
        id: "msig_demo_done",
        title: "Set world APR to 300 bps",
        description: "Baseline rate confirmed",
        action: "SET_PARAM",
        payload: { field: "worldAprBps", value: 300 },
        status: "EXECUTED",
        createdAt: "2026-05-01T12:00:00.000Z",
        createdBy: "usr_governor",
        signatures: [
          "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        ],
        executedAt: "2026-05-01T14:00:00.000Z",
        executedBy: "usr_governor",
      },
    ],
    proposals: [
      {
        id: "gov_demo_1",
        title: "Raise global min reserve ratio to 18%",
        parameter: "minReserveRatio",
        currentValue: "0.15",
        proposedValue: "0.18",
        justification: "Strengthen solvency buffer across all tiers",
        status: "VOTING",
        createdAt: nowIso(),
        createdBy: "usr_governor",
        votingEndsAt: daysFromNow(5),
        votesFor: ["usr_governor"],
        votesAgainst: [],
      },
      {
        id: "gov_demo_2",
        title: "Lower world APR to 280 bps",
        parameter: "worldAprBps",
        currentValue: "300",
        proposedValue: "280",
        justification: "Pass through cheaper funding costs",
        status: "PASSED_TIMELOCK",
        createdAt: "2026-07-20T10:00:00.000Z",
        createdBy: "usr_governor",
        votingEndsAt: "2026-07-25T10:00:00.000Z",
        timelockEndsAt: daysFromNow(-0.01), // already elapsed for demo execute
        votesFor: ["usr_governor", "usr_nb_admin_bd"],
        votesAgainst: [],
      },
    ],
  };
}

function load(): WorldOpsState {
  try {
    if (fs.existsSync(FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as WorldOpsState;
      const base = seed();
      return {
        signers: parsed.signers?.length ? parsed.signers : base.signers,
        threshold: parsed.threshold || MULTISIG_THRESHOLD,
        multisigTxs: parsed.multisigTxs ?? base.multisigTxs,
        proposals: parsed.proposals ?? base.proposals,
        globalParams: parsed.globalParams ?? base.globalParams,
      };
    }
  } catch {
    /* fall through */
  }
  const s = seed();
  save(s);
  return s;
}

function save(state: WorldOpsState) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
  } catch {
    // Best-effort: never block boot/requests on a snapshot failure.
  }
}

let state = load();

export const worldOpsDb = {
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
  daysFromNow,
};

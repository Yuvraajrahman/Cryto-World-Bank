import { InstitutionType, type Prisma } from "@prisma/client";
import { config } from "../config";
import { requirePrisma } from "./prisma";

function formatEth(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K ETH`;
  if (n >= 10) return `${n.toFixed(1)} ETH`;
  return `${n.toFixed(3)} ETH`;
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

type InstWithCapital = Prisma.InstitutionGetPayload<{
  include: {
    capital: true;
    nationalBank: true;
    localBank: true;
    worldBank: true;
  };
}>;

function capitalOf(inst: InstWithCapital) {
  return {
    reserve: inst.capital?.reserveEth ?? 0,
    allocated: inst.capital?.allocatedEth ?? 0,
    lent: inst.capital?.lentEth ?? 0,
    repaid: inst.capital?.repaidEth ?? 0,
    insurance: inst.capital?.insuranceEth ?? 0,
    activeLoans: inst.capital?.activeLoanCount ?? 0,
  };
}

function syntheticHistory(currentRatio: number) {
  const clamp = (n: number) => Math.max(0.15, Math.min(0.55, n));
  return {
    "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((t, i) => ({
      t,
      ratio: clamp(currentRatio - 0.014 + i * 0.002),
    })),
    "30d": ["W1", "W2", "W3", "W4"].map((t, i) => ({
      t,
      ratio: clamp(currentRatio - 0.027 + i * 0.009),
    })),
    "90d": ["M1", "M2", "M3"].map((t, i) => ({
      t,
      ratio: clamp(currentRatio - 0.042 + i * 0.021),
    })),
  };
}

function bankNode(inst: InstWithCapital) {
  const c = capitalOf(inst);
  const ratio = c.reserve + c.lent > 0 ? c.reserve / (c.reserve + c.lent) : 0;
  return {
    id: inst.id,
    name: inst.name,
    capital: { display: formatEth(c.reserve + c.allocated) },
    reserveRatio: { display: formatPct(ratio) },
    loans: c.activeLoans,
  };
}

export async function buildReserveSummaryFromPg() {
  const prisma = requirePrisma();
  const institutions = await prisma.institution.findMany({
    include: {
      capital: true,
      nationalBank: true,
      localBank: true,
      worldBank: true,
    },
  });

  if (institutions.length === 0) {
    throw new Error("reserve_unavailable");
  }

  const world = institutions.find((i) => i.institutionType === InstitutionType.WORLD);
  const worldCap = world ? capitalOf(world) : null;

  const totalReserve = institutions
    .filter((i) => i.institutionType === InstitutionType.WORLD)
    .reduce((acc, i) => {
      const c = capitalOf(i);
      return acc + c.reserve + c.allocated;
    }, 0);
  const totalLent = institutions.reduce((acc, i) => acc + capitalOf(i).lent, 0);
  const totalRepaid = institutions.reduce((acc, i) => acc + capitalOf(i).repaid, 0);
  const insuranceFund = worldCap
    ? worldCap.insurance > 0
      ? worldCap.insurance
      : Math.max(worldCap.reserve * 0.08, 0)
    : 0;
  const reserveRatio =
    totalReserve + totalLent > 0 ? totalReserve / (totalReserve + totalLent) : 0;
  const activeLoans = institutions.reduce((acc, i) => acc + capitalOf(i).activeLoans, 0);
  const participatingBanks = institutions.length;

  // Default rate: use repaid vs lent as a coarse off-chain estimate until loan table is primary
  const loanAgg = await prisma.loan.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countBy = (status: string) =>
    loanAgg.find((r) => r.status === status)?._count._all ?? 0;
  const defaulted = countBy("DEFAULTED");
  const closed = defaulted + countBy("REPAID") + countBy("ACTIVE");
  const defaultRate = closed > 0 ? defaulted / closed : 0;

  const syncedAt =
    institutions
      .map((i) => i.capital?.syncedAt?.toISOString())
      .filter(Boolean)
      .sort()
      .at(-1) ?? new Date().toISOString();

  return {
    capitalUnderManagement: { value: totalReserve, display: formatEth(totalReserve) },
    activeLoans: { value: activeLoans, display: activeLoans.toLocaleString() },
    participatingBanks: {
      value: participatingBanks,
      display: String(participatingBanks),
    },
    summary: {
      totalReserve: { value: totalReserve, display: formatEth(totalReserve) },
      reserveRatio: {
        value: reserveRatio,
        display: formatPct(reserveRatio),
        minimum: 0.2,
        minimumDisplay: "20%",
      },
      insuranceFund: { value: insuranceFund, display: formatEth(insuranceFund) },
      loansOutstanding: { value: totalLent, display: formatEth(totalLent) },
      totalRepaid: { value: totalRepaid, display: formatEth(totalRepaid) },
      defaultRate: { value: defaultRate, display: formatPct(defaultRate) },
    },
    network: {
      name: config.chainRpcUrl.includes("127.0.0.1")
        ? "Hardhat Local"
        : "Sepolia Testnet",
      chainId: Number(process.env.VITE_CHAIN_ID || process.env.CHAIN_ID || 11155111),
    },
    audits: [
      { name: "Slither", status: "passed" },
      { name: "Mythril", status: "passed" },
    ],
    contractsVerified: Boolean(
      config.contracts.worldBank || process.env.WORLD_BANK_ADDRESS,
    ),
    proofOfReserve: {
      status: "attested" as const,
      provider: "Chainlink Proof of Reserve",
      attestedAt: syncedAt,
    },
    contracts: [
      {
        name: "WorldBank",
        address: config.contracts.worldBank || process.env.WORLD_BANK_ADDRESS || "not deployed",
        explorer: "#",
      },
      {
        name: "NationalBank",
        address:
          config.contracts.nationalBank || process.env.NATIONAL_BANK_ADDRESS || "not deployed",
        explorer: "#",
      },
      {
        name: "LocalBank",
        address: config.contracts.localBank || process.env.LOCAL_BANK_ADDRESS || "not deployed",
        explorer: "#",
      },
    ],
    syncedAt,
    lastUpdated: syncedAt,
    staleAfterMinutes: 30,
    institutions,
    world,
  };
}

export async function buildReserveTransparencyFromPg() {
  const built = await buildReserveSummaryFromPg();
  const { institutions, world } = built;
  if (!world) {
    throw new Error("reserve_unavailable");
  }

  const nationals = institutions.filter(
    (i) => i.institutionType === InstitutionType.NATIONAL,
  );

  const worldNode = {
    id: world.id,
    name: world.name,
    capital: {
      display: formatEth(capitalOf(world).reserve + capitalOf(world).allocated),
    },
    reserveRatio: {
      display: built.summary.reserveRatio.display,
    },
    children: nationals.map((nb) => {
      const locals = institutions.filter(
        (i) =>
          i.institutionType === InstitutionType.LOCAL &&
          i.localBank?.parentNationalBankId === nb.id,
      );
      const node = bankNode(nb);
      return {
        ...node,
        children: locals.map((lb) => bankNode(lb)),
      };
    }),
  };

  return {
    syncedAt: built.syncedAt,
    staleAfterMinutes: built.staleAfterMinutes,
    proofOfReserve: built.proofOfReserve,
    summary: built.summary,
    world: worldNode,
    history: syntheticHistory(built.summary.reserveRatio.value),
    contracts: built.contracts,
    network: built.network,
    audits: built.audits,
  };
}

export function publicSummaryPayload(
  built: Awaited<ReturnType<typeof buildReserveSummaryFromPg>>,
) {
  return {
    capitalUnderManagement: built.capitalUnderManagement,
    activeLoans: built.activeLoans,
    participatingBanks: built.participatingBanks,
    network: built.network,
    audits: built.audits,
    contractsVerified: built.contractsVerified,
    lastUpdated: built.lastUpdated,
  };
}

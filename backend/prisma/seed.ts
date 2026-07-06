import {
  PrismaClient,
  InstitutionType,
  AssetSymbol,
  BankUserRole,
  KycLevel,
} from "@prisma/client";
import { HARDHAT_ACCOUNTS } from "../../shared/hardhat-accounts";

const prisma = new PrismaClient();

async function main() {
  await prisma.country.upsert({
    where: { countryCode: "BGD" },
    update: { name: "Bangladesh" },
    create: { countryCode: "BGD", name: "Bangladesh" },
  });

  const worldAddr = process.env.WORLD_BANK_ADDRESS;
  const nationalAddr = process.env.NATIONAL_BANK_ADDRESS;
  const localAddr = process.env.LOCAL_BANK_ADDRESS;
  const mockUsdcAddr = process.env.MOCK_USDC_ADDRESS;

  if (worldAddr) {
    const world = await prisma.institution.upsert({
      where: { onChainAddress: worldAddr.toLowerCase() },
      update: { name: "World Bank Reserve" },
      create: {
        institutionType: InstitutionType.WORLD,
        name: "World Bank Reserve",
        onChainAddress: worldAddr.toLowerCase(),
        countryCode: "BGD",
        worldBank: { create: { lendingAprBps: 300 } },
      },
      include: { worldBank: true },
    });

    if (!world.worldBank) {
      await prisma.worldBank.create({
        data: { institutionId: world.id, lendingAprBps: 300 },
      });
    }
  }

  if (nationalAddr && worldAddr) {
    const world = await prisma.institution.findUnique({
      where: { onChainAddress: worldAddr.toLowerCase() },
    });
    if (world) {
      const national = await prisma.institution.upsert({
        where: { onChainAddress: nationalAddr.toLowerCase() },
        update: { name: "Bangladesh National Bank" },
        create: {
          institutionType: InstitutionType.NATIONAL,
          name: "Bangladesh National Bank",
          onChainAddress: nationalAddr.toLowerCase(),
          countryCode: "BGD",
          nationalBank: {
            create: {
              parentWorldBankId: world.id,
              lendingAprBps: 500,
              jurisdiction: "Bangladesh",
            },
          },
        },
      });
      if (!national) {
        /* upsert always returns */
      }
    }
  }

  if (localAddr && nationalAddr) {
    const national = await prisma.institution.findUnique({
      where: { onChainAddress: nationalAddr.toLowerCase() },
    });
    if (national) {
      await prisma.institution.upsert({
        where: { onChainAddress: localAddr.toLowerCase() },
        update: { name: "Dhaka Local Bank" },
        create: {
          institutionType: InstitutionType.LOCAL,
          name: "Dhaka Local Bank",
          onChainAddress: localAddr.toLowerCase(),
          countryCode: "BGD",
          localBank: {
            create: {
              parentNationalBankId: national.id,
              borrowAprBps: 800,
              region: "Dhaka Metropolitan",
            },
          },
        },
      });
    }
  }

  if (mockUsdcAddr) {
    await prisma.asset.upsert({
      where: { id: "asset-musdc" },
      update: { contractAddress: mockUsdcAddr.toLowerCase() },
      create: {
        id: "asset-musdc",
        symbol: AssetSymbol.MUSDC,
        contractAddress: mockUsdcAddr.toLowerCase(),
        decimals: 6,
      },
    });
  }

  await prisma.asset.upsert({
    where: { id: "asset-eth" },
    update: {},
    create: {
      id: "asset-eth",
      symbol: AssetSymbol.ETH,
      decimals: 18,
    },
  });

  const localInst = localAddr
    ? await prisma.institution.findUnique({
        where: { onChainAddress: localAddr.toLowerCase() },
      })
    : null;

  const roleMap: Array<{ account: (typeof HARDHAT_ACCOUNTS)[number]; bankRole: BankUserRole }> =
    [
      { account: HARDHAT_ACCOUNTS[0], bankRole: BankUserRole.WORLD_BANK_ADMIN },
      { account: HARDHAT_ACCOUNTS[1], bankRole: BankUserRole.NATIONAL_BANK_ADMIN },
      { account: HARDHAT_ACCOUNTS[2], bankRole: BankUserRole.LOCAL_BANK_ADMIN },
      { account: HARDHAT_ACCOUNTS[3], bankRole: BankUserRole.APPROVER },
    ];

  for (const { account, bankRole } of roleMap) {
    let institutionId: string | undefined;
    if (bankRole === BankUserRole.WORLD_BANK_ADMIN && worldAddr) {
      institutionId = (
        await prisma.institution.findUnique({
          where: { onChainAddress: worldAddr.toLowerCase() },
        })
      )?.id;
    } else if (bankRole === BankUserRole.NATIONAL_BANK_ADMIN && nationalAddr) {
      institutionId = (
        await prisma.institution.findUnique({
          where: { onChainAddress: nationalAddr.toLowerCase() },
        })
      )?.id;
    } else if (
      (bankRole === BankUserRole.LOCAL_BANK_ADMIN || bankRole === BankUserRole.APPROVER) &&
      localInst
    ) {
      institutionId = localInst.id;
    }
    if (!institutionId) continue;

    await prisma.bankUser.upsert({
      where: { walletAddress: account.address.toLowerCase() },
      update: { role: bankRole, displayName: account.label },
      create: {
        institutionId,
        walletAddress: account.address.toLowerCase(),
        displayName: account.label,
        role: bankRole,
      },
    });
  }

  const borrowers = HARDHAT_ACCOUNTS.filter((a) => a.role === "BORROWER");
  if (localInst) {
    for (const b of borrowers) {
      await prisma.borrower.upsert({
        where: { walletAddress: b.address.toLowerCase() },
        update: { registeredLocalBankId: localInst.id },
        create: {
          walletAddress: b.address.toLowerCase(),
          registeredLocalBankId: localInst.id,
          kycLevel: KycLevel.LEVEL_0,
        },
      });
    }
  }

  console.log("Phase I M1 seed complete (institutions + bank users + borrowers).");

  await prisma.interestRateTier.deleteMany();
  await prisma.interestRateTier.createMany({
    data: [
      { tierName: "BRONZE", minScore: 0, maxScore: 399, aprBps: 1200 },
      { tierName: "SILVER", minScore: 400, maxScore: 549, aprBps: 1000 },
      { tierName: "GOLD", minScore: 550, maxScore: 699, aprBps: 800 },
      { tierName: "PLATINUM", minScore: 700, maxScore: 799, aprBps: 600 },
      { tierName: "DIAMOND", minScore: 800, maxScore: 850, aprBps: 500 },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

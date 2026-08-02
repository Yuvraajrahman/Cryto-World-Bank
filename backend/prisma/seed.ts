import {
  PrismaClient,
  InstitutionType,
  AssetSymbol,
  BankUserRole,
  KycLevel,
  UserRole,
} from "@prisma/client";
import { HARDHAT_ACCOUNTS } from "../../shared/hardhat-accounts";

const prisma = new PrismaClient();

type CapitalSeed = {
  reserveEth: number;
  allocatedEth: number;
  lentEth: number;
  repaidEth: number;
  insuranceEth?: number;
  activeLoanCount?: number;
};

async function upsertInstitution(opts: {
  id: string;
  institutionType: InstitutionType;
  name: string;
  onChainAddress?: string | null;
  countryCode?: string | null;
  capital: CapitalSeed;
  world?: { lendingAprBps: number };
  national?: { parentWorldBankId: string; lendingAprBps: number; jurisdiction?: string };
  local?: { parentNationalBankId: string; borrowAprBps: number; region?: string };
}) {
  const existing = await prisma.institution.findUnique({ where: { id: opts.id } });
  if (!existing) {
    await prisma.institution.create({
      data: {
        id: opts.id,
        institutionType: opts.institutionType,
        name: opts.name,
        onChainAddress: opts.onChainAddress?.toLowerCase() ?? null,
        countryCode: opts.countryCode ?? null,
        ...(opts.world ? { worldBank: { create: opts.world } } : {}),
        ...(opts.national ? { nationalBank: { create: opts.national } } : {}),
        ...(opts.local ? { localBank: { create: opts.local } } : {}),
        capital: {
          create: {
            reserveEth: opts.capital.reserveEth,
            allocatedEth: opts.capital.allocatedEth,
            lentEth: opts.capital.lentEth,
            repaidEth: opts.capital.repaidEth,
            insuranceEth: opts.capital.insuranceEth ?? 0,
            activeLoanCount: opts.capital.activeLoanCount ?? 0,
            syncedAt: new Date(),
          },
        },
      },
    });
    return;
  }

  await prisma.institution.update({
    where: { id: opts.id },
    data: {
      name: opts.name,
      onChainAddress: opts.onChainAddress?.toLowerCase() ?? existing.onChainAddress,
      countryCode: opts.countryCode ?? existing.countryCode,
    },
  });

  await prisma.institutionCapital.upsert({
    where: { institutionId: opts.id },
    update: {
      reserveEth: opts.capital.reserveEth,
      allocatedEth: opts.capital.allocatedEth,
      lentEth: opts.capital.lentEth,
      repaidEth: opts.capital.repaidEth,
      insuranceEth: opts.capital.insuranceEth ?? 0,
      activeLoanCount: opts.capital.activeLoanCount ?? 0,
      syncedAt: new Date(),
    },
    create: {
      institutionId: opts.id,
      reserveEth: opts.capital.reserveEth,
      allocatedEth: opts.capital.allocatedEth,
      lentEth: opts.capital.lentEth,
      repaidEth: opts.capital.repaidEth,
      insuranceEth: opts.capital.insuranceEth ?? 0,
      activeLoanCount: opts.capital.activeLoanCount ?? 0,
      syncedAt: new Date(),
    },
  });
}

async function main() {
  await prisma.country.upsert({
    where: { countryCode: "BGD" },
    update: { name: "Bangladesh" },
    create: { countryCode: "BGD", name: "Bangladesh" },
  });
  await prisma.country.upsert({
    where: { countryCode: "NGA" },
    update: { name: "Nigeria" },
    create: { countryCode: "NGA", name: "Nigeria" },
  });
  await prisma.country.upsert({
    where: { countryCode: "IDN" },
    update: { name: "Indonesia" },
    create: { countryCode: "IDN", name: "Indonesia" },
  });

  const worldAddr = process.env.WORLD_BANK_ADDRESS?.toLowerCase() || null;
  const nationalAddr = process.env.NATIONAL_BANK_ADDRESS?.toLowerCase() || null;
  const localAddr = process.env.LOCAL_BANK_ADDRESS?.toLowerCase() || null;
  const mockUsdcAddr = process.env.MOCK_USDC_ADDRESS?.toLowerCase() || null;

  // Stable IDs align with the legacy in-memory store so JWT subjects and bankIds match.
  await upsertInstitution({
    id: "bank_world",
    institutionType: InstitutionType.WORLD,
    name: "Crypto World Bank Reserve",
    onChainAddress: worldAddr,
    countryCode: "BGD",
    capital: {
      reserveEth: 3000,
      allocatedEth: 1010,
      lentEth: 1010,
      repaidEth: 120,
      insuranceEth: 240,
      activeLoanCount: 0,
    },
    world: { lendingAprBps: 300 },
  });
  if (!(await prisma.worldBank.findUnique({ where: { institutionId: "bank_world" } }))) {
    await prisma.worldBank.create({
      data: { institutionId: "bank_world", lendingAprBps: 300 },
    });
  }

  await upsertInstitution({
    id: "bank_nb_bd",
    institutionType: InstitutionType.NATIONAL,
    name: "Bangladesh National Bank",
    onChainAddress: nationalAddr,
    countryCode: "BGD",
    capital: {
      reserveEth: 420,
      allocatedEth: 160,
      lentEth: 160,
      repaidEth: 42,
      activeLoanCount: 0,
    },
    national: {
      parentWorldBankId: "bank_world",
      lendingAprBps: 500,
      jurisdiction: "Bangladesh",
    },
  });
  if (!(await prisma.nationalBank.findUnique({ where: { institutionId: "bank_nb_bd" } }))) {
    await prisma.nationalBank.create({
      data: {
        institutionId: "bank_nb_bd",
        parentWorldBankId: "bank_world",
        lendingAprBps: 500,
        jurisdiction: "Bangladesh",
      },
    });
  }

  await upsertInstitution({
    id: "bank_nb_ng",
    institutionType: InstitutionType.NATIONAL,
    name: "Nigeria National Bank",
    countryCode: "NGA",
    capital: {
      reserveEth: 380,
      allocatedEth: 195,
      lentEth: 195,
      repaidEth: 38,
    },
    national: {
      parentWorldBankId: "bank_world",
      lendingAprBps: 500,
      jurisdiction: "Nigeria",
    },
  });
  if (!(await prisma.nationalBank.findUnique({ where: { institutionId: "bank_nb_ng" } }))) {
    await prisma.nationalBank.create({
      data: {
        institutionId: "bank_nb_ng",
        parentWorldBankId: "bank_world",
        lendingAprBps: 500,
        jurisdiction: "Nigeria",
      },
    });
  }

  await upsertInstitution({
    id: "bank_nb_id",
    institutionType: InstitutionType.NATIONAL,
    name: "Indonesia National Bank",
    countryCode: "IDN",
    capital: {
      reserveEth: 310,
      allocatedEth: 95,
      lentEth: 95,
      repaidEth: 12,
    },
    national: {
      parentWorldBankId: "bank_world",
      lendingAprBps: 500,
      jurisdiction: "Indonesia",
    },
  });
  if (!(await prisma.nationalBank.findUnique({ where: { institutionId: "bank_nb_id" } }))) {
    await prisma.nationalBank.create({
      data: {
        institutionId: "bank_nb_id",
        parentWorldBankId: "bank_world",
        lendingAprBps: 500,
        jurisdiction: "Indonesia",
      },
    });
  }

  const locals: Array<{
    id: string;
    name: string;
    parent: string;
    country: string;
    region: string;
    capital: CapitalSeed;
    onChain?: string | null;
  }> = [
    {
      id: "bank_lb_dhaka",
      name: "Dhaka Local Bank",
      parent: "bank_nb_bd",
      country: "BGD",
      region: "Dhaka Metropolitan",
      onChain: localAddr,
      capital: {
        reserveEth: 90,
        allocatedEth: 0,
        lentEth: 38,
        repaidEth: 9,
        activeLoanCount: 1,
      },
    },
    {
      id: "bank_lb_chittagong",
      name: "Chittagong Local Bank",
      parent: "bank_nb_bd",
      country: "BGD",
      region: "Chittagong",
      capital: { reserveEth: 70, allocatedEth: 0, lentEth: 24, repaidEth: 6, activeLoanCount: 0 },
    },
    {
      id: "bank_lb_lagos",
      name: "Lagos Local Bank",
      parent: "bank_nb_ng",
      country: "NGA",
      region: "Lagos",
      capital: { reserveEth: 110, allocatedEth: 0, lentEth: 42, repaidEth: 9, activeLoanCount: 0 },
    },
    {
      id: "bank_lb_abuja",
      name: "Abuja Local Bank",
      parent: "bank_nb_ng",
      country: "NGA",
      region: "Abuja",
      capital: { reserveEth: 85, allocatedEth: 0, lentEth: 18, repaidEth: 3, activeLoanCount: 0 },
    },
    {
      id: "bank_lb_jakarta",
      name: "Jakarta Local Bank",
      parent: "bank_nb_id",
      country: "IDN",
      region: "Jakarta",
      capital: { reserveEth: 95, allocatedEth: 0, lentEth: 21, repaidEth: 4, activeLoanCount: 0 },
    },
  ];

  for (const lb of locals) {
    await upsertInstitution({
      id: lb.id,
      institutionType: InstitutionType.LOCAL,
      name: lb.name,
      onChainAddress: lb.onChain ?? null,
      countryCode: lb.country,
      capital: lb.capital,
      local: {
        parentNationalBankId: lb.parent,
        borrowAprBps: 800,
        region: lb.region,
      },
    });
    if (!(await prisma.localBank.findUnique({ where: { institutionId: lb.id } }))) {
      await prisma.localBank.create({
        data: {
          institutionId: lb.id,
          parentNationalBankId: lb.parent,
          borrowAprBps: 800,
          region: lb.region,
        },
      });
    }
  }

  if (mockUsdcAddr) {
    await prisma.asset.upsert({
      where: { id: "asset-musdc" },
      update: { contractAddress: mockUsdcAddr },
      create: {
        id: "asset-musdc",
        symbol: AssetSymbol.MUSDC,
        contractAddress: mockUsdcAddr,
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

  const staff: Array<{
    id: string;
    wallet: string;
    displayName: string;
    role: UserRole;
    bankId?: string;
    bankRole?: BankUserRole;
    email?: string;
  }> = [
    {
      id: "usr_governor",
      wallet: HARDHAT_ACCOUNTS[0]!.address.toLowerCase(),
      displayName: "World Bank Governor",
      role: UserRole.OWNER,
      email: "governor@cwb.example",
      bankId: "bank_world",
      bankRole: BankUserRole.WORLD_BANK_ADMIN,
    },
    {
      id: "usr_nb_admin_bd",
      wallet: HARDHAT_ACCOUNTS[1]!.address.toLowerCase(),
      displayName: "Bangladesh NB Admin",
      role: UserRole.NATIONAL_BANK_ADMIN,
      bankId: "bank_nb_bd",
      bankRole: BankUserRole.NATIONAL_BANK_ADMIN,
    },
    {
      id: "usr_lb_admin_dhaka",
      wallet: HARDHAT_ACCOUNTS[2]!.address.toLowerCase(),
      displayName: "Dhaka LB Governor",
      role: UserRole.LOCAL_BANK_ADMIN,
      bankId: "bank_lb_dhaka",
      bankRole: BankUserRole.LOCAL_BANK_ADMIN,
    },
    {
      id: "usr_approver_dhaka",
      wallet: HARDHAT_ACCOUNTS[3]!.address.toLowerCase(),
      displayName: "Fatima Khan",
      role: UserRole.APPROVER,
      bankId: "bank_lb_dhaka",
      bankRole: BankUserRole.APPROVER,
    },
    {
      id: "usr_borrower_demo",
      wallet: HARDHAT_ACCOUNTS[4]!.address.toLowerCase(),
      displayName: "Md. Bokhtiar Rahman",
      role: UserRole.BORROWER,
      email: "bokhtiar@example.com",
    },
    {
      id: "usr_borrower_new",
      wallet: HARDHAT_ACCOUNTS[5]!.address.toLowerCase(),
      displayName: "Aisha Adewale",
      role: UserRole.BORROWER,
      email: "aisha@example.com",
    },
    {
      id: "usr_regulator",
      wallet: HARDHAT_ACCOUNTS[7]!.address.toLowerCase(),
      displayName: "Regulatory Authority",
      role: UserRole.REGULATOR,
      email: "regulator@cwb.example",
    },
    // TEMPORARY — remove DEV_ADMIN before production
    {
      id: "usr_dev_admin",
      wallet: HARDHAT_ACCOUNTS[8]!.address.toLowerCase(),
      displayName: "Dev Admin (temporary)",
      role: UserRole.DEV_ADMIN,
      email: "devadmin@cwb.example",
    },
  ];

  for (const s of staff) {
    const profile = {
      displayName: s.displayName,
      role: s.role,
      bankId: s.bankId,
      email: s.email,
      isFirstTime: s.id === "usr_borrower_new",
      onboardingComplete: s.id !== "usr_borrower_new",
      country:
        s.id === "usr_borrower_demo"
          ? "Bangladesh"
          : s.id === "usr_borrower_new"
            ? "Nigeria"
            : undefined,
      consecutivePaidLoans: s.id === "usr_borrower_demo" ? 2 : 0,
      totalBorrowedLifetime: s.id === "usr_borrower_demo" ? 8.5 : 0,
      monthlyIncomeUsd: s.id === "usr_borrower_demo" ? 1400 : undefined,
    };

    const byWallet = await prisma.user.findUnique({ where: { wallet: s.wallet } });
    if (byWallet) {
      await prisma.user.update({ where: { id: byWallet.id }, data: profile });
    } else {
      const byId = await prisma.user.findUnique({ where: { id: s.id } });
      if (byId) {
        await prisma.user.update({
          where: { id: s.id },
          data: { ...profile, wallet: s.wallet },
        });
      } else {
        await prisma.user.create({
          data: { id: s.id, wallet: s.wallet, ...profile },
        });
      }
    }

    if (s.bankRole && s.bankId) {
      await prisma.bankUser.upsert({
        where: { walletAddress: s.wallet },
        update: {
          role: s.bankRole,
          displayName: s.displayName,
          institutionId: s.bankId,
        },
        create: {
          institutionId: s.bankId,
          walletAddress: s.wallet,
          displayName: s.displayName,
          role: s.bankRole,
        },
      });
    }
  }

  for (const b of HARDHAT_ACCOUNTS.filter((a) => a.role === "BORROWER")) {
    await prisma.borrower.upsert({
      where: { walletAddress: b.address.toLowerCase() },
      update: { registeredLocalBankId: "bank_lb_dhaka" },
      create: {
        walletAddress: b.address.toLowerCase(),
        registeredLocalBankId: "bank_lb_dhaka",
        kycLevel: KycLevel.LEVEL_0,
      },
    });
  }

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

  const defaultPrefs = {
    email: true,
    push: false,
    inApp: true,
    categories: {
      loan: true,
      kyc: true,
      payment: true,
      agent: true,
      chat: true,
      system: true,
    },
  };

  for (const userId of ["usr_borrower_demo", "usr_borrower_new"]) {
    await prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: defaultPrefs },
    });
  }

  await prisma.notification.deleteMany({
    where: { userId: { in: ["usr_borrower_demo", "usr_borrower_new"] } },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: "usr_borrower_demo",
        category: "loan",
        title: "Loan disbursed",
        body: "Your 5 ETH inventory loan is active. Next installment is due soon.",
        href: "/app/loans",
      },
      {
        userId: "usr_borrower_demo",
        category: "payment",
        title: "Installment reminder",
        body: "Installment #5 (0.45 ETH) is due within 7 days.",
        href: "/app/installments",
      },
      {
        userId: "usr_borrower_demo",
        category: "kyc",
        title: "KYC Level 1 approved",
        body: "Identity verification cleared. Bronze/Silver loan caps are unlocked.",
        href: "/app/settings",
        readAt: new Date(Date.now() - 86400000),
      },
      {
        userId: "usr_borrower_new",
        category: "system",
        title: "Welcome to World Bank Reserve",
        body: "Complete onboarding to unlock lending, savings, and your Credit Passport.",
        href: "/onboarding/register",
      },
      {
        userId: "usr_borrower_new",
        category: "agent",
        title: "AI agent ready",
        body: "Ask the banking agent about limits, rates, or how to apply for a loan.",
        href: "/app/assistant",
      },
      {
        userId: "usr_governor",
        category: "capital",
        title: "Allocation request pending",
        body: "Bangladesh National Bank requested additional capital from the global reserve.",
        href: "/app/banks",
      },
      {
        userId: "usr_approver_dhaka",
        category: "loan",
        title: "New loan in approval queue",
        body: "A borrower at Dhaka Local Bank submitted a credit-based loan request.",
        href: "/app/approvals",
      },
    ],
  });

  // Third retail borrower for group demo (Hardhat account #6)
  const groupMember3Wallet = "0x976ea74026e726554db657fa54763abd0c3a0aa9";
  {
    const profile3 = {
      displayName: "Karim Hossain",
      role: UserRole.BORROWER,
      email: "karim@example.com",
      onboardingComplete: true,
      isFirstTime: false,
      country: "Bangladesh",
      monthlyIncomeUsd: 900,
      consecutivePaidLoans: 0,
      totalBorrowedLifetime: 0,
    };
    const byWallet = await prisma.user.findUnique({ where: { wallet: groupMember3Wallet } });
    if (byWallet) {
      await prisma.user.update({ where: { id: byWallet.id }, data: profile3 });
    } else {
      const byId = await prisma.user.findUnique({ where: { id: "usr_borrower_group3" } });
      if (byId) {
        await prisma.user.update({
          where: { id: "usr_borrower_group3" },
          data: { ...profile3, wallet: groupMember3Wallet },
        });
      } else {
        await prisma.user.create({
          data: { id: "usr_borrower_group3", wallet: groupMember3Wallet, ...profile3 },
        });
      }
    }
    await prisma.borrower.upsert({
      where: { walletAddress: groupMember3Wallet },
      update: { registeredLocalBankId: "bank_lb_dhaka" },
      create: {
        walletAddress: groupMember3Wallet,
        registeredLocalBankId: "bank_lb_dhaka",
        kycLevel: KycLevel.LEVEL_0,
      },
    });
  }

  // Demo lending group (invite WBR-DEMO)
  await prisma.groupLoanConsent.deleteMany({});
  await prisma.groupLoanRequest.deleteMany({});
  await prisma.groupMember.deleteMany({ where: { group: { inviteCode: "WBR-DEMO" } } });
  await prisma.loanGroup.deleteMany({ where: { inviteCode: "WBR-DEMO" } });

  const demoOrganizer =
    (await prisma.user.findUnique({ where: { id: "usr_borrower_demo" } })) ??
    (await prisma.user.findFirst({
      where: { wallet: HARDHAT_ACCOUNTS[4]!.address.toLowerCase() },
    }));
  const demoMember2 =
    (await prisma.user.findUnique({ where: { id: "usr_borrower_new" } })) ??
    (await prisma.user.findFirst({
      where: { wallet: HARDHAT_ACCOUNTS[5]!.address.toLowerCase() },
    }));
  const demoMember3 =
    (await prisma.user.findUnique({ where: { id: "usr_borrower_group3" } })) ??
    (await prisma.user.findFirst({ where: { wallet: groupMember3Wallet } }));

  if (demoOrganizer && demoMember2 && demoMember3) {
    const demoGroup = await prisma.loanGroup.create({
      data: {
        id: "grp_demo_wbr",
        name: "Dhaka Traders Circle",
        inviteCode: "WBR-DEMO",
        organizerUserId: demoOrganizer.id,
        localBankId: "bank_lb_dhaka",
        status: "ACTIVE",
        minMembers: 3,
        maxMembers: 20,
        members: {
          create: [
            {
              userId: demoOrganizer.id,
              walletAddress: demoOrganizer.wallet,
              role: "ORGANIZER",
              borrowerId: "",
              consented: true,
            },
            {
              userId: demoMember2.id,
              walletAddress: demoMember2.wallet,
              role: "MEMBER",
              borrowerId: "",
              consented: true,
            },
            {
              userId: demoMember3.id,
              walletAddress: demoMember3.wallet,
              role: "MEMBER",
              borrowerId: "",
              consented: true,
            },
          ],
        },
      },
    });
    console.log(`Demo group seeded: ${demoGroup.inviteCode} (${demoGroup.id})`);
  }

  console.log(
    "Seed complete: institutions + InstitutionCapital + users + bank users + borrowers + rate tiers + notifications + groups.",
  );

  // Sample audit rows for regulator portal (Section L)
  const auditSamples = [
    {
      eventType: "LOAN_RISK_ASSESSMENT",
      actorId: "usr_approver_dhaka",
      actorType: "USER",
      payload: {
        loanId: "demo",
        score: 0.42,
        recommendation: "APPROVE_WITH_CONDITIONS",
      },
    },
    {
      eventType: "RBAC_STAFF_ADDED",
      actorId: "usr_lb_admin_dhaka",
      actorType: "USER",
      payload: { role: "APPROVER", wallet: HARDHAT_ACCOUNTS[3]!.address.toLowerCase() },
    },
    {
      eventType: "SAR_ESCALATED",
      actorId: "usr_approver_dhaka",
      actorType: "USER",
      payload: { alertId: "aml_sar_demo", to: "NATIONAL" },
    },
    {
      eventType: "ONBOARDING_COMPLETE",
      actorId: "usr_borrower_demo",
      actorType: "USER",
      payload: {},
    },
  ];
  for (const row of auditSamples) {
    const exists = await prisma.auditLog.findFirst({
      where: { eventType: row.eventType, actorId: row.actorId },
    });
    if (!exists) {
      await prisma.auditLog.create({ data: row });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

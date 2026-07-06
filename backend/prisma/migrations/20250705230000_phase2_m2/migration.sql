-- Phase II M2 tables migration

CREATE TYPE "RiskTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

ALTER TABLE "LoanRequest" ADD COLUMN IF NOT EXISTS "docHash" TEXT;
ALTER TABLE "LoanRequest" ADD COLUMN IF NOT EXISTS "nidDocHash" TEXT;
ALTER TABLE "LoanRequest" ADD COLUMN IF NOT EXISTS "photoDocHash" TEXT;

CREATE TABLE IF NOT EXISTS "CreditPassportRecord" (
  "id" TEXT NOT NULL,
  "borrowerId" TEXT NOT NULL,
  "creditScore" INTEGER NOT NULL DEFAULT 300,
  "riskTier" "RiskTier" NOT NULL DEFAULT 'SILVER',
  "openLoans" INTEGER NOT NULL DEFAULT 0,
  "completedCycles" INTEGER NOT NULL DEFAULT 0,
  "onChainAddress" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditPassportRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CreditPassportRecord_borrowerId_key" ON "CreditPassportRecord"("borrowerId");

CREATE TABLE IF NOT EXISTS "BorrowingLimit" (
  "id" TEXT NOT NULL,
  "borrowerId" TEXT NOT NULL,
  "maxPrincipalWei" TEXT NOT NULL,
  "windowMonths" INTEGER NOT NULL DEFAULT 6,
  "usedWei" TEXT NOT NULL DEFAULT '0',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BorrowingLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BorrowingLimit_borrowerId_key" ON "BorrowingLimit"("borrowerId");

CREATE TABLE IF NOT EXISTS "IncomeProof" (
  "id" TEXT NOT NULL,
  "borrowerId" TEXT NOT NULL,
  "documentHash" TEXT NOT NULL,
  "monthlyUsd" DOUBLE PRECISION,
  "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IncomeProof_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InterestRateTier" (
  "id" TEXT NOT NULL,
  "tierName" TEXT NOT NULL,
  "minScore" INTEGER NOT NULL,
  "maxScore" INTEGER NOT NULL,
  "aprBps" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterestRateTier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LoanGroup" (
  "id" TEXT NOT NULL,
  "localBankId" TEXT NOT NULL,
  "onChainId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'FORMING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoanGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GroupMember" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "borrowerId" TEXT NOT NULL,
  "consented" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UpwardDepositRecord" (
  "id" TEXT NOT NULL,
  "depositorId" TEXT NOT NULL,
  "parentId" TEXT NOT NULL,
  "amountWei" TEXT NOT NULL,
  "onChainTxHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UpwardDepositRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InterbankLoanRecord" (
  "id" TEXT NOT NULL,
  "lenderId" TEXT NOT NULL,
  "borrowerId" TEXT NOT NULL,
  "principalWei" TEXT NOT NULL,
  "tenorDays" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "onChainLoanId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterbankLoanRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SavingsAccount" (
  "id" TEXT NOT NULL,
  "borrowerId" TEXT NOT NULL,
  "vaultAddress" TEXT NOT NULL,
  "sharesWei" TEXT NOT NULL DEFAULT '0',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavingsAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AgentSession" (
  "id" TEXT NOT NULL,
  "wallet" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  CONSTRAINT "AgentSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AgentActionLog" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "toolName" TEXT NOT NULL,
  "payload" JSONB,
  "confirmed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentActionLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CreditPassportRecord" ADD CONSTRAINT "CreditPassportRecord_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BorrowingLimit" ADD CONSTRAINT "BorrowingLimit_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IncomeProof" ADD CONSTRAINT "IncomeProof_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "LoanGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgentActionLog" ADD CONSTRAINT "AgentActionLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

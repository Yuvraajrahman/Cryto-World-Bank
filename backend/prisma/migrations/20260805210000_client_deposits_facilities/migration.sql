-- Retail client deposits + bank liquidity facilities (Postgres source of truth)

CREATE TABLE "ClientDepositAccount" (
    "userId" TEXT NOT NULL,
    "vaultUsdc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checkingUsdc" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "ethBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "fiatUsd" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientDepositAccount_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "ClientDepositLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "counterparty" TEXT,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientDepositLedger_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientFixedDeposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "principal" DOUBLE PRECISION NOT NULL,
    "termDays" INTEGER NOT NULL,
    "aprBps" INTEGER NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturesAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "penaltyBps" INTEGER NOT NULL DEFAULT 200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientFixedDeposit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OpsInterbankLoan" (
    "id" TEXT NOT NULL,
    "borrowerBankId" TEXT NOT NULL,
    "lenderBankId" TEXT NOT NULL,
    "amountUsdc" DOUBLE PRECISION NOT NULL,
    "tenorDays" INTEGER NOT NULL,
    "aprBps" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "createdBy" TEXT NOT NULL,
    "note" TEXT,
    "fundedAt" TIMESTAMP(3),
    "repaidAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsInterbankLoan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OpsUpwardDeposit" (
    "id" TEXT NOT NULL,
    "fromBankId" TEXT NOT NULL,
    "toBankId" TEXT NOT NULL,
    "amountUsdc" DOUBLE PRECISION NOT NULL,
    "createdBy" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsUpwardDeposit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClientDepositLedger_userId_createdAt_idx" ON "ClientDepositLedger"("userId", "createdAt");
CREATE INDEX "ClientDepositLedger_kind_idx" ON "ClientDepositLedger"("kind");
CREATE INDEX "ClientFixedDeposit_userId_status_idx" ON "ClientFixedDeposit"("userId", "status");
CREATE INDEX "OpsInterbankLoan_borrowerBankId_status_idx" ON "OpsInterbankLoan"("borrowerBankId", "status");
CREATE INDEX "OpsInterbankLoan_lenderBankId_status_idx" ON "OpsInterbankLoan"("lenderBankId", "status");
CREATE INDEX "OpsInterbankLoan_createdAt_idx" ON "OpsInterbankLoan"("createdAt");
CREATE INDEX "OpsUpwardDeposit_fromBankId_createdAt_idx" ON "OpsUpwardDeposit"("fromBankId", "createdAt");
CREATE INDEX "OpsUpwardDeposit_toBankId_createdAt_idx" ON "OpsUpwardDeposit"("toBankId", "createdAt");

ALTER TABLE "ClientDepositAccount" ADD CONSTRAINT "ClientDepositAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientDepositLedger" ADD CONSTRAINT "ClientDepositLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientFixedDeposit" ADD CONSTRAINT "ClientFixedDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

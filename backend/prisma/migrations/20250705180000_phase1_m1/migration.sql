-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('WORLD', 'NATIONAL', 'LOCAL');

-- CreateEnum
CREATE TYPE "BankUserRole" AS ENUM ('WORLD_BANK_ADMIN', 'NATIONAL_BANK_ADMIN', 'LOCAL_BANK_ADMIN', 'APPROVER');

-- CreateEnum
CREATE TYPE "KycLevel" AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- CreateEnum
CREATE TYPE "LoanRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'REPAID', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "AssetSymbol" AS ENUM ('ETH', 'MUSDC');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'NATIONAL_BANK_ADMIN', 'LOCAL_BANK_ADMIN', 'APPROVER', 'BORROWER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNSUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Country" (
    "countryCode" VARCHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("countryCode")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "institutionType" "InstitutionType" NOT NULL,
    "name" TEXT NOT NULL,
    "onChainAddress" TEXT,
    "countryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldBank" (
    "institutionId" TEXT NOT NULL,
    "lendingAprBps" INTEGER NOT NULL DEFAULT 300,

    CONSTRAINT "WorldBank_pkey" PRIMARY KEY ("institutionId")
);

-- CreateTable
CREATE TABLE "NationalBank" (
    "institutionId" TEXT NOT NULL,
    "parentWorldBankId" TEXT NOT NULL,
    "lendingAprBps" INTEGER NOT NULL DEFAULT 500,
    "jurisdiction" TEXT,

    CONSTRAINT "NationalBank_pkey" PRIMARY KEY ("institutionId")
);

-- CreateTable
CREATE TABLE "LocalBank" (
    "institutionId" TEXT NOT NULL,
    "parentNationalBankId" TEXT NOT NULL,
    "borrowAprBps" INTEGER NOT NULL DEFAULT 800,
    "region" TEXT,

    CONSTRAINT "LocalBank_pkey" PRIMARY KEY ("institutionId")
);

-- CreateTable
CREATE TABLE "BankUser" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "displayName" TEXT,
    "role" "BankUserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borrower" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "registeredLocalBankId" TEXT NOT NULL,
    "kycLevel" "KycLevel" NOT NULL DEFAULT 'LEVEL_0',
    "kycDocumentHash" TEXT,
    "kycVerifiedAt" TIMESTAMP(3),
    "kycExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Borrower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanRequest" (
    "id" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "localBankId" TEXT NOT NULL,
    "principalWei" TEXT NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "purpose" TEXT,
    "status" "LoanRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "onChainRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "localBankId" TEXT NOT NULL,
    "onChainLoanId" TEXT,
    "principalWei" TEXT NOT NULL,
    "aprBps" INTEGER NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installment" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "amountWei" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "txHash" TEXT,

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BLOCKCHAIN_EVENT_LOG" (
    "id" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BLOCKCHAIN_EVENT_LOG_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "symbol" "AssetSymbol" NOT NULL,
    "contractAddress" TEXT,
    "decimals" INTEGER NOT NULL DEFAULT 18,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AUDIT_LOGS" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AUDIT_LOGS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BORROWER',
    "bankId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentUrl" TEXT,
    "monthlyUsd" DOUBLE PRECISION,
    "status" "VerificationStatus" NOT NULL DEFAULT 'UNSUBMITTED',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_onChainAddress_key" ON "Institution"("onChainAddress");

-- CreateIndex
CREATE INDEX "Institution_institutionType_idx" ON "Institution"("institutionType");

-- CreateIndex
CREATE UNIQUE INDEX "BankUser_walletAddress_key" ON "BankUser"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Borrower_walletAddress_key" ON "Borrower"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_requestId_key" ON "Loan"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_onChainLoanId_key" ON "Loan"("onChainLoanId");

-- CreateIndex
CREATE UNIQUE INDEX "Installment_loanId_index_key" ON "Installment"("loanId", "index");

-- CreateIndex
CREATE INDEX "BLOCKCHAIN_EVENT_LOG_contract_eventName_idx" ON "BLOCKCHAIN_EVENT_LOG"("contract", "eventName");

-- CreateIndex
CREATE UNIQUE INDEX "BLOCKCHAIN_EVENT_LOG_txHash_logIndex_key" ON "BLOCKCHAIN_EVENT_LOG"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "Asset_symbol_idx" ON "Asset"("symbol");

-- CreateIndex
CREATE INDEX "AUDIT_LOGS_eventType_idx" ON "AUDIT_LOGS"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IncomeVerification_userId_key" ON "IncomeVerification"("userId");

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("countryCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldBank" ADD CONSTRAINT "WorldBank_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NationalBank" ADD CONSTRAINT "NationalBank_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalBank" ADD CONSTRAINT "LocalBank_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankUser" ADD CONSTRAINT "BankUser_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrower" ADD CONSTRAINT "Borrower_registeredLocalBankId_fkey" FOREIGN KEY ("registeredLocalBankId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRequest" ADD CONSTRAINT "LoanRequest_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRequest" ADD CONSTRAINT "LoanRequest_localBankId_fkey" FOREIGN KEY ("localBankId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "LoanRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_localBankId_fkey" FOREIGN KEY ("localBankId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeVerification" ADD CONSTRAINT "IncomeVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

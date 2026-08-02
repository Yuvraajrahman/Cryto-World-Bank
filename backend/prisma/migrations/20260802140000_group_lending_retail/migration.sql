-- Section E: retail group lending (extend LoanGroup / GroupMember + request/consent)

-- LoanGroup extensions
ALTER TABLE "LoanGroup" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT 'Unnamed group';
ALTER TABLE "LoanGroup" ADD COLUMN IF NOT EXISTS "inviteCode" TEXT;
ALTER TABLE "LoanGroup" ADD COLUMN IF NOT EXISTS "organizerUserId" TEXT;
ALTER TABLE "LoanGroup" ADD COLUMN IF NOT EXISTS "minMembers" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "LoanGroup" ADD COLUMN IF NOT EXISTS "maxMembers" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "LoanGroup" ADD COLUMN IF NOT EXISTS "termsJson" JSONB;
ALTER TABLE "LoanGroup" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill invite codes for any existing rows
UPDATE "LoanGroup"
SET "inviteCode" = 'LEGACY-' || substr(md5(random()::text || id), 1, 10)
WHERE "inviteCode" IS NULL;

ALTER TABLE "LoanGroup" ALTER COLUMN "inviteCode" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "LoanGroup_inviteCode_key" ON "LoanGroup"("inviteCode");
CREATE INDEX IF NOT EXISTS "LoanGroup_organizerUserId_idx" ON "LoanGroup"("organizerUserId");
CREATE INDEX IF NOT EXISTS "LoanGroup_status_idx" ON "LoanGroup"("status");

-- GroupMember extensions
ALTER TABLE "GroupMember" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "GroupMember" ADD COLUMN IF NOT EXISTS "walletAddress" TEXT;
ALTER TABLE "GroupMember" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'MEMBER';
ALTER TABLE "GroupMember" ADD COLUMN IF NOT EXISTS "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- borrowerId was required; allow empty for retail-only rows that use userId
ALTER TABLE "GroupMember" ALTER COLUMN "borrowerId" SET DEFAULT '';
UPDATE "GroupMember" SET "borrowerId" = '' WHERE "borrowerId" IS NULL;

-- Drop old FK restrict and re-add cascade
ALTER TABLE "GroupMember" DROP CONSTRAINT IF EXISTS "GroupMember_groupId_fkey";
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "LoanGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");
CREATE INDEX IF NOT EXISTS "GroupMember_walletAddress_idx" ON "GroupMember"("walletAddress");
CREATE INDEX IF NOT EXISTS "GroupMember_userId_idx" ON "GroupMember"("userId");

-- GroupLoanRequest
CREATE TABLE IF NOT EXISTS "GroupLoanRequest" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "requestedBy" TEXT NOT NULL,
  "totalAmountEth" DOUBLE PRECISION NOT NULL,
  "termMonths" INTEGER NOT NULL,
  "purpose" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'AWAITING_CONSENT',
  "retailLoanId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activatedAt" TIMESTAMP(3),
  CONSTRAINT "GroupLoanRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GroupLoanRequest_groupId_status_idx" ON "GroupLoanRequest"("groupId", "status");

ALTER TABLE "GroupLoanRequest" DROP CONSTRAINT IF EXISTS "GroupLoanRequest_groupId_fkey";
ALTER TABLE "GroupLoanRequest" ADD CONSTRAINT "GroupLoanRequest_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "LoanGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- GroupLoanConsent
CREATE TABLE IF NOT EXISTS "GroupLoanConsent" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "consentedAt" TIMESTAMP(3),
  CONSTRAINT "GroupLoanConsent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GroupLoanConsent_requestId_userId_key" ON "GroupLoanConsent"("requestId", "userId");
CREATE INDEX IF NOT EXISTS "GroupLoanConsent_userId_idx" ON "GroupLoanConsent"("userId");

ALTER TABLE "GroupLoanConsent" DROP CONSTRAINT IF EXISTS "GroupLoanConsent_requestId_fkey";
ALTER TABLE "GroupLoanConsent" ADD CONSTRAINT "GroupLoanConsent_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "GroupLoanRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Group loan consent: wallet signature + decline timestamp
ALTER TABLE "GroupLoanConsent" ADD COLUMN IF NOT EXISTS "signature" TEXT;
ALTER TABLE "GroupLoanConsent" ADD COLUMN IF NOT EXISTS "declinedAt" TIMESTAMP(3);

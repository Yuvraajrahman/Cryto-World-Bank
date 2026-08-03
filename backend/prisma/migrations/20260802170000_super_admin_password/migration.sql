-- Permanent Super Admin: optional password for email login
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

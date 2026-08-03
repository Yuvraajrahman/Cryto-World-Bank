-- User ID login + optional confirmed personal email
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailConfirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pendingEmail" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailConfirmToken" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_loginId_key" ON "User"("loginId");

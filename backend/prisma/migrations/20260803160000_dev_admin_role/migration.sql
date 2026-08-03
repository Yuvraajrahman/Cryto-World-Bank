-- Add permanent Super Admin role (schema had DEV_ADMIN without migration on fresh DBs).
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DEV_ADMIN';

-- Section L: Regulatory Authority (A6) read-only audit portal
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'REGULATOR';

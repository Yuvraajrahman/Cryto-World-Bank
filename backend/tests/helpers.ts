import request from "supertest";
import type { Express } from "express";
import { createApp } from "../src/app";
import { db, findUserById } from "../src/store/db";

// NOTE: tests import helpers.ts which imports db.ts. db.ts detects
// NODE_ENV === "test" at module-init and disables disk persistence, so every
// test run starts from a clean seeded in-memory store.

export function buildApp(): Express {
  return createApp();
}

export function resetDb(): void {
  db.reset();
}

// Many tests want a clean slate for the borrower flow. The seed creates a
// pre-existing ACTIVE loan for usr_borrower_demo which would trip the
// "active-loan cap" check on any new request. This helper flips that loan
// to REPAID so request/approve flows can be exercised from scratch. Also
// resets the demo borrower's totals so borrowing-limit math is predictable.
export function primeBorrowerForFreshLoan(userId = "usr_borrower_demo"): void {
  // Remove every loan tied to this borrower so they start each test with a
  // clean borrowing-limits calculation (no 6-month carry-over).
  db.state.loans = db.state.loans.filter((l) => l.borrowerId !== userId);
  db.state.transactions = db.state.transactions.filter((t) => t.userId !== userId);
  const u = findUserById(userId);
  if (u) {
    u.consecutivePaidLoans = 0;
    u.totalBorrowedLifetime = 0;
    u.isFirstTime = false;
  }
}

export interface DevLoginResult {
  token: string;
  user: { id: string; wallet: string; role: string; bankId?: string };
}

// dev-login accepts either { wallet, role } to create a new user or
// { wallet, userId } to impersonate an existing seed user. All seed user ids
// are stable: usr_governor, usr_nb_admin_bd, usr_lb_admin_dhaka,
// usr_approver_dhaka, usr_borrower_demo, usr_borrower_new.
export async function loginAs(
  app: Express,
  seedUserId: string,
): Promise<DevLoginResult> {
  const res = await request(app)
    .post("/api/auth/dev-login")
    .send({
      // The schema requires a hex wallet regardless of userId; use a dummy.
      wallet: "0x0000000000000000000000000000000000000000",
      userId: seedUserId,
    });
  if (res.status !== 200) {
    throw new Error(`dev-login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body as DevLoginResult;
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

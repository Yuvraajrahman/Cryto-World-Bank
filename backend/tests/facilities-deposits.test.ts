import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { buildApp, resetDb, loginAs, authHeader } from "./helpers";
import { resetFacilitiesPg } from "../src/db/facilitiesOpsPg";
import { resetClientDepositsPg } from "../src/db/clientDeposits";
import { db } from "../src/store/db";

describe("facilities — interbank + upward (Postgres)", () => {
  const app = buildApp();

  beforeEach(async () => {
    resetDb();
    await resetFacilitiesPg();
  });

  it("local admin can overview peers and parent", async () => {
    const { token } = await loginAs(app, "usr_lb_admin_dhaka");
    const res = await request(app)
      .get("/api/facilities/overview")
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.me.tier).toBe("LOCAL");
    expect(res.body.parent?.tier).toBe("NATIONAL");
    expect(res.body.peers.length).toBeGreaterThanOrEqual(1);
    expect(res.body.tenors).toHaveLength(3);
  });

  it("same-tier interbank request → fund → repay", async () => {
    const borrower = await loginAs(app, "usr_lb_admin_dhaka");
    const funder = await loginAs(app, "usr_dev_admin");

    const ov = await request(app)
      .get("/api/facilities/overview")
      .set(authHeader(borrower.token));
    const peer = ov.body.peers.find((p: { id: string }) => p.id === "bank_lb_chittagong");
    expect(peer).toBeDefined();

    const amount = 10;
    const reqLoan = await request(app)
      .post("/api/facilities/interbank/request")
      .set(authHeader(borrower.token))
      .send({
        lenderBankId: peer.id,
        amountUsdc: amount,
        tenorDays: 7,
        note: "test iblp",
      });
    expect(reqLoan.status).toBe(201);
    expect(reqLoan.body.loan.status).toBe("REQUESTED");
    const loanId = reqLoan.body.loan.id as string;

    const beforeLender = db.state.banks.find((b) => b.id === "bank_lb_chittagong")!.reserve;
    const beforeBorrower = db.state.banks.find((b) => b.id === "bank_lb_dhaka")!.reserve;

    const fund = await request(app)
      .post(`/api/facilities/interbank/${loanId}/fund`)
      .set(authHeader(funder.token));
    expect(fund.status).toBe(200);
    expect(fund.body.loan.status).toBe("ACTIVE");

    expect(db.state.banks.find((b) => b.id === "bank_lb_chittagong")!.reserve).toBeCloseTo(
      beforeLender - amount,
    );
    expect(db.state.banks.find((b) => b.id === "bank_lb_dhaka")!.reserve).toBeCloseTo(
      beforeBorrower + amount,
    );

    const repay = await request(app)
      .post(`/api/facilities/interbank/${loanId}/repay`)
      .set(authHeader(borrower.token));
    expect(repay.status).toBe(200);
    expect(repay.body.loan.status).toBe("REPAID");
    expect(repay.body.interestUsdc).toBeGreaterThan(0);
  });

  it("national can park upward deposit with World", async () => {
    const { token } = await loginAs(app, "usr_nb_admin_bd");
    const ov = await request(app)
      .get("/api/facilities/overview")
      .set(authHeader(token));
    expect(ov.status).toBe(200);
    const nbBefore = ov.body.me.reserveUsdc as number;

    const res = await request(app)
      .post("/api/facilities/upward/deposit")
      .set(authHeader(token))
      .send({ amountUsdc: 40, note: "surplus park" });
    expect(res.status).toBe(201);
    expect(res.body.deposit.toBankId).toBe("bank_world");
    expect(res.body.deposit.amountUsdc).toBe(40);

    const ov2 = await request(app)
      .get("/api/facilities/overview")
      .set(authHeader(token));
    expect(ov2.body.me.reserveUsdc).toBeCloseTo(nbBefore - 40);

    const prisma = (await import("../src/db/prisma")).requirePrisma();
    const rows = await prisma.opsUpwardDeposit.findMany({
      where: { fromBankId: "bank_nb_bd", toBankId: "bank_world", amountUsdc: 40 },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    expect(rows.length).toBe(1);
  });

  it("world cannot request interbank borrow", async () => {
    const { token } = await loginAs(app, "usr_governor");
    const res = await request(app)
      .post("/api/facilities/interbank/request")
      .set(authHeader(token))
      .send({ lenderBankId: "bank_nb_bd", amountUsdc: 10, tenorDays: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("world_not_borrower");
  });
});

describe("deposits — USD→USDC convert + retail FX + statement (Postgres)", () => {
  const app = buildApp();

  beforeEach(async () => {
    resetDb();
    await resetClientDepositsPg();
  });

  it("converts fiat USD to checking USDC 1:1", async () => {
    const { token } = await loginAs(app, "usr_borrower_demo");
    const sum0 = await request(app).get("/api/deposits/summary").set(authHeader(token));
    expect(sum0.status).toBe(200);
    expect(sum0.body.fiatUsd).toBeGreaterThanOrEqual(500);
    const checking0 = sum0.body.checkingUsdc as number;
    const fiat0 = sum0.body.fiatUsd as number;

    const conv = await request(app)
      .post("/api/deposits/convert/usd-to-usdc")
      .set(authHeader(token))
      .send({ amountUsd: 100 });
    expect(conv.status).toBe(201);
    expect(conv.body.usdcCredited).toBe(100);
    expect(conv.body.fiatUsd).toBeCloseTo(fiat0 - 100);
    expect(conv.body.checkingUsdc).toBeCloseTo(checking0 + 100);
  });

  it("swaps USDC → ETH and ETH → USDC with spread", async () => {
    const { token } = await loginAs(app, "usr_borrower_demo");
    await request(app)
      .post("/api/deposits/convert/usd-to-usdc")
      .set(authHeader(token))
      .send({ amountUsd: 200 });

    const sell = await request(app)
      .post("/api/deposits/fx/swap")
      .set(authHeader(token))
      .send({ side: "USDC_TO_ETH", amount: 160 });
    expect(sell.status).toBe(201);
    expect(sell.body.ethReceived).toBeGreaterThan(0);

    const buy = await request(app)
      .post("/api/deposits/fx/swap")
      .set(authHeader(token))
      .send({ side: "ETH_TO_USDC", amount: sell.body.ethReceived });
    expect(buy.status).toBe(201);
    expect(buy.body.usdcReceived).toBeGreaterThan(0);
    expect(buy.body.usdcReceived).toBeLessThan(160);
  });

  it("statement includes convert and fx entries", async () => {
    const { token } = await loginAs(app, "usr_borrower_demo");
    await request(app)
      .post("/api/deposits/convert/usd-to-usdc")
      .set(authHeader(token))
      .send({ amountUsd: 25 });
    await request(app)
      .post("/api/deposits/fx/swap")
      .set(authHeader(token))
      .send({ side: "USDC_TO_ETH", amount: 10 });

    const st = await request(app).get("/api/deposits/statement").set(authHeader(token));
    expect(st.status).toBe(200);
    const kinds = (st.body.entries as Array<{ kind: string }>).map((e) => e.kind);
    expect(kinds).toContain("USD_TO_USDC");
    expect(kinds).toContain("FX_USDC_TO_ETH");
    expect(st.body.balances.checkingUsdc).toBeGreaterThanOrEqual(0);
  });

  it("persists balances across requests (Postgres)", async () => {
    const { token } = await loginAs(app, "usr_borrower_demo");
    await request(app)
      .post("/api/deposits/convert/usd-to-usdc")
      .set(authHeader(token))
      .send({ amountUsd: 50 });
    const a = await request(app).get("/api/deposits/summary").set(authHeader(token));
    const b = await request(app).get("/api/deposits/summary").set(authHeader(token));
    expect(a.body.checkingUsdc).toBeCloseTo(b.body.checkingUsdc);
    expect(a.body.fiatUsd).toBeCloseTo(b.body.fiatUsd);
  });
});

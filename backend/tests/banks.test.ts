import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { buildApp, resetDb, loginAs, authHeader } from "./helpers";

describe("banks hierarchy", () => {
  const app = buildApp();
  beforeEach(() => resetDb());

  it("GET /api/banks returns the seeded three-tier hierarchy", async () => {
    const res = await request(app).get("/api/banks");
    expect(res.status).toBe(200);
    expect(res.body.worldBank.tier).toBe("WORLD");
    expect(res.body.nationalBanks.length).toBeGreaterThanOrEqual(3);
    expect(res.body.localBanks.length).toBeGreaterThanOrEqual(5);
  });

  it("GET /api/banks/tree nests children under the world bank", async () => {
    const res = await request(app).get("/api/banks/tree");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.children)).toBe(true);
    const bd = res.body.children.find((c: { jurisdiction?: string }) => c.jurisdiction === "Bangladesh");
    expect(bd).toBeDefined();
    expect(bd.children.length).toBeGreaterThanOrEqual(1);
  });

  it("OWNER can register a new national bank", async () => {
    const { token } = await loginAs(app, "usr_governor");
    const res = await request(app)
      .post("/api/banks/register-national")
      .set(authHeader(token))
      .send({
        name: "Kenya National Bank",
        walletAddress: "0x1111111111111111111111111111111111111111",
        jurisdiction: "Kenya",
        reserve: 100,
      });
    expect(res.status).toBe(201);
    expect(res.body.bank.tier).toBe("NATIONAL");
    expect(res.body.bank.jurisdiction).toBe("Kenya");
  });

  it("NATIONAL_BANK_ADMIN cannot register a national bank (forbidden)", async () => {
    const { token } = await loginAs(app, "usr_nb_admin_bd");
    const res = await request(app)
      .post("/api/banks/register-national")
      .set(authHeader(token))
      .send({
        name: "X",
        walletAddress: "0x1111111111111111111111111111111111111111",
        jurisdiction: "Kenya",
      });
    expect(res.status).toBe(403);
  });

  it("NATIONAL admin can register a local bank under their own NB only", async () => {
    const { token } = await loginAs(app, "usr_nb_admin_bd");
    const ok = await request(app)
      .post("/api/banks/register-local")
      .set(authHeader(token))
      .send({
        name: "Sylhet Local Bank",
        walletAddress: "0x2222222222222222222222222222222222222222",
        jurisdiction: "Bangladesh",
        city: "Sylhet",
        parentBankId: "bank_nb_bd",
      });
    expect(ok.status).toBe(201);
    expect(ok.body.bank.parentBankId).toBe("bank_nb_bd");

    const forbidden = await request(app)
      .post("/api/banks/register-local")
      .set(authHeader(token))
      .send({
        name: "Lagos 2 LB",
        walletAddress: "0x2222222222222222222222222222222222222223",
        jurisdiction: "Nigeria",
        city: "Lagos",
        parentBankId: "bank_nb_ng",
      });
    expect(forbidden.status).toBe(403);
  });

  it("OWNER can allocate capital from world bank → national bank and balances update", async () => {
    const { token } = await loginAs(app, "usr_governor");
    const before = await request(app).get("/api/banks");
    const worldBefore = before.body.worldBank.reserve as number;
    const bdBefore = before.body.nationalBanks.find((b: { id: string; reserve: number }) => b.id === "bank_nb_bd").reserve;

    const res = await request(app)
      .post("/api/banks/allocate")
      .set(authHeader(token))
      .send({ fromBankId: "bank_world", toBankId: "bank_nb_bd", amount: 25 });
    expect(res.status).toBe(200);

    const after = await request(app).get("/api/banks");
    expect(after.body.worldBank.reserve).toBeCloseTo(worldBefore - 25);
    const bdAfter = after.body.nationalBanks.find((b: { id: string; reserve: number }) => b.id === "bank_nb_bd").reserve;
    expect(bdAfter).toBeCloseTo(bdBefore + 25);
  });

  it("allocate rejects over-reserve transfers", async () => {
    const { token } = await loginAs(app, "usr_governor");
    const res = await request(app)
      .post("/api/banks/allocate")
      .set(authHeader(token))
      .send({ fromBankId: "bank_world", toBankId: "bank_nb_bd", amount: 999999 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("insufficient_reserve");
  });

  it("audit-log records allocation transactions", async () => {
    const { token } = await loginAs(app, "usr_governor");
    await request(app)
      .post("/api/banks/allocate")
      .set(authHeader(token))
      .send({ fromBankId: "bank_world", toBankId: "bank_nb_bd", amount: 10 });
    const log = await request(app).get("/api/banks/audit-log").set(authHeader(token));
    expect(log.status).toBe(200);
    expect(log.body.entries.some((e: { type: string }) => e.type === "ALLOCATION")).toBe(true);
  });
});

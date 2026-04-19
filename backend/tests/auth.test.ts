import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { buildApp, resetDb, loginAs, authHeader } from "./helpers";

describe("auth", () => {
  const app = buildApp();
  beforeEach(() => resetDb());

  it("GET /health is public and returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /api/auth/nonce returns a SIWE nonce", async () => {
    const res = await request(app).get("/api/auth/nonce");
    expect(res.status).toBe(200);
    expect(typeof res.body.nonce).toBe("string");
    expect(res.body.nonce.length).toBeGreaterThan(8);
  });

  it("dev-login mints a JWT for a seed user and /me validates it", async () => {
    const { token, user } = await loginAs(app, "usr_borrower_demo");
    expect(token).toBeTruthy();
    expect(user.id).toBe("usr_borrower_demo");
    expect(user.role).toBe("BORROWER");

    const me = await request(app).get("/api/auth/me").set(authHeader(token));
    expect(me.status).toBe(200);
    expect(me.body.user.id).toBe(user.id);
  });

  it("/me rejects missing or bogus tokens", async () => {
    const noAuth = await request(app).get("/api/auth/me");
    expect(noAuth.status).toBe(401);

    const bad = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: "Bearer not-a-real-token" });
    expect(bad.status).toBe(401);
  });

  it("dev-login rejects malformed wallet addresses", async () => {
    const res = await request(app)
      .post("/api/auth/dev-login")
      .send({ wallet: "not-hex" });
    expect(res.status).toBe(400);
  });
});

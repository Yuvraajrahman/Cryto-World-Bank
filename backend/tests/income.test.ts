import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { buildApp, resetDb, loginAs, authHeader } from "./helpers";

const tinyPng =
  // 1x1 transparent PNG, base64
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAE/AL+8F0k4AAAAABJRU5ErkJggg==";

describe("income verification", () => {
  const app = buildApp();
  beforeEach(() => resetDb());

  it("borrower can upload a PNG income proof and see it in /mine", async () => {
    const { token } = await loginAs(app, "usr_borrower_new");
    const up = await request(app)
      .post("/api/income/upload")
      .set(authHeader(token))
      .send({
        fileName: "payslip.png",
        mimeType: "image/png",
        contentBase64: tinyPng,
        monthlyIncomeUsd: 950,
      });
    expect(up.status).toBe(201);
    expect(up.body.proof.status).toBe("PENDING");

    const mine = await request(app).get("/api/income/mine").set(authHeader(token));
    expect(mine.body.proofs.length).toBe(1);
    expect(mine.body.proofs[0].fileName).toBe("payslip.png");
  });

  it("rejects unsupported mime types", async () => {
    const { token } = await loginAs(app, "usr_borrower_new");
    const res = await request(app)
      .post("/api/income/upload")
      .set(authHeader(token))
      .send({
        fileName: "proof.exe",
        mimeType: "application/x-msdownload",
        contentBase64: tinyPng,
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("unsupported_mime_type");
  });

  it("queue is visible to approver and approval flips isFirstTime off", async () => {
    const borrower = await loginAs(app, "usr_borrower_new");
    const up = await request(app)
      .post("/api/income/upload")
      .set(authHeader(borrower.token))
      .send({
        fileName: "payslip.png",
        mimeType: "image/png",
        contentBase64: tinyPng,
        monthlyIncomeUsd: 1200,
      });
    const proofId = up.body.proof.id;

    const approver = await loginAs(app, "usr_approver_dhaka");
    const queue = await request(app).get("/api/income/queue").set(authHeader(approver.token));
    expect(queue.status).toBe(200);
    expect(queue.body.proofs.some((p: { id: string }) => p.id === proofId)).toBe(true);

    const review = await request(app)
      .post(`/api/income/${proofId}/review`)
      .set(authHeader(approver.token))
      .send({ decision: "APPROVED", notes: "looks authentic" });
    expect(review.status).toBe(200);
    expect(review.body.proof.status).toBe("APPROVED");

    const me = await request(app).get("/api/auth/me").set(authHeader(borrower.token));
    expect(me.body.user.isFirstTime).toBe(false);
  });

  it("borrower cannot see another borrower's file", async () => {
    const owner = await loginAs(app, "usr_borrower_demo");
    const up = await request(app)
      .post("/api/income/upload")
      .set(authHeader(owner.token))
      .send({
        fileName: "payslip.png",
        mimeType: "image/png",
        contentBase64: tinyPng,
      });
    const proofId = up.body.proof.id;

    const other = await loginAs(app, "usr_borrower_new");
    const res = await request(app)
      .get(`/api/income/${proofId}/file`)
      .set(authHeader(other.token));
    expect(res.status).toBe(403);
  });
});

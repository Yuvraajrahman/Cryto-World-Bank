import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { buildApp, resetDb, loginAs, authHeader } from "./helpers";

describe("chat threads and messages", () => {
  const app = buildApp();
  beforeEach(() => resetDb());

  it("borrower sees their seeded thread and can post a message", async () => {
    const { token, user } = await loginAs(app, "usr_borrower_demo");
    const list = await request(app).get("/api/chat/threads").set(authHeader(token));
    expect(list.status).toBe(200);
    expect(list.body.threads.length).toBeGreaterThan(0);

    const threadId = list.body.threads[0].id;
    const send = await request(app)
      .post(`/api/chat/threads/${threadId}/messages`)
      .set(authHeader(token))
      .send({ body: "Any update on my application?" });
    expect(send.status).toBe(201);
    expect(send.body.message.senderId).toBe(user.id);

    const msgs = await request(app)
      .get(`/api/chat/threads/${threadId}/messages`)
      .set(authHeader(token));
    expect(msgs.status).toBe(200);
    expect(
      msgs.body.messages.some((m: { body: string }) => m.body === "Any update on my application?"),
    ).toBe(true);
  });

  it("non-participants get a 404 for the thread's messages", async () => {
    const owner = await loginAs(app, "usr_borrower_demo");
    const list = await request(app).get("/api/chat/threads").set(authHeader(owner.token));
    const threadId = list.body.threads[0].id;

    const other = await loginAs(app, "usr_borrower_new");
    const res = await request(app)
      .get(`/api/chat/threads/${threadId}/messages`)
      .set(authHeader(other.token));
    expect(res.status).toBe(404);
  });

  it("creating a thread always adds the creator to participants", async () => {
    const { token, user } = await loginAs(app, "usr_borrower_demo");
    const res = await request(app)
      .post("/api/chat/threads")
      .set(authHeader(token))
      .send({
        subject: "Question about APR",
        participantIds: ["usr_approver_dhaka"],
      });
    expect(res.status).toBe(201);
    const participantIds = res.body.thread.participants.map(
      (p: { id: string }) => p.id,
    );
    expect(participantIds).toContain(user.id);
    expect(participantIds).toContain("usr_approver_dhaka");
  });
});

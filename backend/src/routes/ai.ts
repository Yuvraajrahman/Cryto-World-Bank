import { Router, type Response as ExpressResponse } from "express";
import { z } from "zod";
import { config } from "../config";
import { AuthedRequest, optionalAuth } from "../middleware/auth";

export const aiRouter = Router();

type ChatRole = "system" | "user" | "assistant";

const msgSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const streamSchema = z.object({
  messages: z.array(msgSchema).min(1).max(80),
  featureKey: z.string().optional(),
  route: z.string().optional(),
});

function sseWrite(res: ExpressResponse, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  for (const line of payload.split("\n")) {
    res.write(`data: ${line}\n`);
  }
  res.write("\n");
}

function buildSystemPrompt(opts: {
  featureKey?: string;
  route?: string;
  user?: NonNullable<AuthedRequest["user"]>;
}) {
  const { featureKey, route, user } = opts;

  const context: string[] = [
    "You are the Crypto World Bank (CWB) in-product assistant.",
    "The platform models a 4-tier hierarchy: World Bank Reserve → National Bank → Local Bank → Borrower.",
    "Be concise, action-oriented, and use the product's terminology and routes when relevant.",
    "If a request requires privileged access, explain what role is needed and where to navigate in the app.",
    "Never claim to have executed blockchain transactions; you can only guide the user.",
  ];

  if (featureKey || route) {
    context.push(
      `Current feature context: ${featureKey ?? "unknown"}${route ? ` (route: ${route})` : ""}.`,
    );
  }

  if (user) {
    context.push(
      `User context: displayName=${user.displayName}, role=${user.role}${user.bankId ? `, bankId=${user.bankId}` : ""}.`,
    );
  }

  return context.join("\n");
}

function normalizeMessages(input: Array<{ role: ChatRole; content: string }>): Array<{ role: ChatRole; content: string }> {
  // Ensure no accidental empty content and trim aggressively.
  return input
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content.length > 0);
}

aiRouter.post("/chat/stream", optionalAuth, async (req, res) => {
  res.setHeader("content-type", "text/event-stream; charset=utf-8");
  res.setHeader("cache-control", "no-cache, no-transform");
  res.setHeader("connection", "keep-alive");
  // If behind a proxy (nginx), this disables buffering.
  res.setHeader("x-accel-buffering", "no");

  // Best effort: flush headers immediately (Express on Node supports this).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res as any).flushHeaders?.();

  let upstream: globalThis.Response | null = null;
  try {
    const parsed = streamSchema.parse(req.body ?? {});
    const user = (req as AuthedRequest).user;
    const sys = buildSystemPrompt({
      featureKey: parsed.featureKey,
      route: parsed.route,
      user,
    });

    const messages = normalizeMessages(parsed.messages);
    const finalMessages = [{ role: "system" as const, content: sys }, ...messages];

    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 120_000);

    upstream = await fetch(`${config.llmBaseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: config.llmModel,
        stream: true,
        messages: finalMessages,
        temperature: 0.4,
      }),
      signal: ctl.signal,
    });

    clearTimeout(t);

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      sseWrite(res, "error", {
        message: `Upstream error (${upstream.status}). ${text}`.trim(),
      });
      sseWrite(res, "done", { model: config.llmModel });
      res.end();
      return;
    }

    // Tell client we're live.
    sseWrite(res, "meta", { model: config.llmModel });

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      // Upstream is SSE-ish: lines like "data: {...}\n\n"
      while (true) {
        const sep = buf.indexOf("\n\n");
        if (sep === -1) break;
        const chunk = buf.slice(0, sep);
        buf = buf.slice(sep + 2);

        for (const rawLine of chunk.split("\n")) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice("data:".length).trim();
          if (!data) continue;
          if (data === "[DONE]") {
            sseWrite(res, "done", { model: config.llmModel });
            res.end();
            return;
          }
          try {
            const json = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const token = json.choices?.[0]?.delta?.content;
            if (typeof token === "string" && token.length > 0) {
              sseWrite(res, "token", token);
            }
          } catch {
            // ignore malformed upstream lines
          }
        }
      }
    }

    sseWrite(res, "done", { model: config.llmModel });
    res.end();
  } catch (err: unknown) {
    sseWrite(res, "error", {
      message: err instanceof Error ? err.message : "Unknown error",
    });
    sseWrite(res, "done", { model: config.llmModel });
    res.end();
  } finally {
    // No-op: attempting to cancel a locked Web stream can throw asynchronously
    // (unhandled rejection) on some Node versions. We rely on normal stream end.
  }
});


import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  AGENT_TOOLS,
  invokeAgentTool,
  type AgentToolDef,
} from "../agent/tools";
import { probeLlm, runMcpAgentTurn } from "../agent/mcpAgent";
import { getPrisma } from "../db/prisma";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { scanForInjection } from "../middleware/injectionScan";
import { buildThreeTierPrompt } from "../prompt/threeTier";
import { config } from "../config";

export const agentRouter = Router();

const pendingConfirmations = new Map<
  string,
  { userId: string; toolName: string; args: Record<string, unknown>; expiresAt: number }
>();

const messageSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
  /** mcp = LM Studio tool-calling agent; keywords = legacy intent router */
  mode: z.enum(["mcp", "keywords", "auto"]).optional().default("auto"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(16)
    .optional(),
});

const confirmSchema = z.object({
  confirmationId: z.string().uuid(),
});

const invokeSchema = z.object({
  toolName: z.string(),
  args: z.record(z.unknown()).default({}),
  confirmed: z.boolean().default(false),
  confirmationId: z.string().uuid().optional(),
});

function detectToolIntent(message: string): { tool: AgentToolDef; args: Record<string, unknown> } | null {
  const t = message.toLowerCase();
  if (t.includes("borrowing limit") || t.includes("how much can i borrow")) {
    return { tool: AGENT_TOOLS[0], args: {} };
  }
  if (t.includes("loan status") || t.includes("my loan")) {
    return { tool: AGENT_TOOLS[1], args: {} };
  }
  if (t.includes("credit passport") || t.includes("credit tier")) {
    return { tool: AGENT_TOOLS[2], args: {} };
  }
  const apply =
    /apply.*loan|loan.*apply|borrow\s+(\d+(\.\d+)?)\s*(eth|usdc)?/i.exec(message) ??
    /(\d+(\.\d+)?)\s*(eth|usdc).*loan/i.exec(message);
  if (apply || t.includes("apply for a loan") || t.includes("loan_apply")) {
    const amount = apply?.[1] ? Number(apply[1]) : 1000;
    return {
      tool: AGENT_TOOLS[3],
      args: { amountEth: amount, termMonths: 12, purpose: "Agent-assisted loan request" },
    };
  }
  return null;
}

async function logAction(
  sessionId: string,
  toolName: string,
  payload: unknown,
  confirmed: boolean,
  wallet = "unknown",
) {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    let session = await prisma.agentSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      session = await prisma.agentSession.create({
        data: { id: sessionId, wallet: wallet.toLowerCase() },
      });
    }
    await prisma.agentActionLog.create({
      data: {
        sessionId: session.id,
        toolName,
        payload: payload as object,
        confirmed,
      },
    });
  } catch {
    /* optional DB */
  }
}

agentRouter.get("/tools", requireAuth, (_req, res) => {
  res.json({ tools: AGENT_TOOLS, unit: "USDC" });
});

/** LM Studio / MCP agent readiness for the assistant UI. */
agentRouter.get("/status", requireAuth, async (_req, res) => {
  const probe = await probeLlm();
  res.json({
    mode: "mcp",
    llm: probe,
    tools: AGENT_TOOLS.map((t) => ({ name: t.name, write: t.write })),
    confirmationGate: true,
  });
});

agentRouter.post("/invoke", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = invokeSchema.parse(req.body ?? {});
    const tool = AGENT_TOOLS.find((t) => t.name === body.toolName);
    if (!tool) {
      res.status(404).json({ error: "Unknown tool" });
      return;
    }

    if (tool.write && !body.confirmed) {
      res.status(403).json({
        error: "Write tool requires confirmation",
        confirmationRequired: true,
        toolName: tool.name,
      });
      return;
    }

    if (tool.write && body.confirmationId) {
      const pending = pendingConfirmations.get(body.confirmationId);
      if (!pending || pending.userId !== user.id || pending.toolName !== tool.name) {
        res.status(403).json({ error: "Invalid or expired confirmation" });
        return;
      }
      if (Date.now() > pending.expiresAt) {
        pendingConfirmations.delete(body.confirmationId);
        res.status(403).json({ error: "Confirmation expired" });
        return;
      }
      pendingConfirmations.delete(body.confirmationId);
    }

    const result = await invokeAgentTool(tool.name, body.args, {
      id: user.id,
      role: user.role,
      wallet: user.wallet,
    });
    await logAction(body.confirmationId ?? randomUUID(), tool.name, body.args, body.confirmed, user.wallet);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

agentRouter.post("/message", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = messageSchema.parse(req.body ?? {});
    const scan = scanForInjection(body.message);
    if (scan.blocked) {
      res.status(403).json({ error: "Prompt blocked", reason: scan.reason });
      return;
    }

    const sessionId = body.sessionId ?? randomUUID();
    const wantMcp = body.mode === "mcp" || body.mode === "auto";

    if (wantMcp) {
      const mcp = await runMcpAgentTurn({
        userMessage: body.message,
        history: body.history,
        user: {
          id: user.id,
          role: user.role,
          wallet: user.wallet,
          displayName: user.displayName,
        },
      });

      if (mcp.type === "confirmation_required") {
        const confirmationId = randomUUID();
        pendingConfirmations.set(confirmationId, {
          userId: user.id,
          toolName: mcp.tool,
          args: mcp.args,
          expiresAt: Date.now() + 5 * 60_000,
        });
        await logAction(sessionId, mcp.tool, mcp.args, false, user.wallet);
        res.json({
          type: "confirmation_required",
          mode: "mcp",
          sessionId,
          confirmationId,
          tool: mcp.tool,
          args: mcp.args,
          message: mcp.message,
          model: mcp.model,
          toolTrace: mcp.toolTrace,
        });
        return;
      }

      if (mcp.type === "message") {
        if (mcp.toolTrace.length) {
          await logAction(sessionId, mcp.toolTrace.join(","), { tools: mcp.toolTrace }, true, user.wallet);
        }
        res.json({
          type: "mcp_reply",
          mode: "mcp",
          sessionId,
          message: mcp.message,
          model: mcp.model,
          toolTrace: mcp.toolTrace,
        });
        return;
      }

      // LLM down — fall through to keywords unless mode forced mcp
      if (body.mode === "mcp") {
        res.json({
          type: "error",
          mode: "mcp",
          sessionId,
          message: mcp.message,
          model: config.llmModel,
        });
        return;
      }
    }

    const intent = detectToolIntent(body.message);

    if (intent) {
      if (intent.tool.write) {
        const confirmationId = randomUUID();
        pendingConfirmations.set(confirmationId, {
          userId: user.id,
          toolName: intent.tool.name,
          args: intent.args,
          expiresAt: Date.now() + 5 * 60_000,
        });
        await logAction(sessionId, intent.tool.name, intent.args, false, user.wallet);
        res.json({
          type: "confirmation_required",
          mode: "keywords",
          sessionId,
          confirmationId,
          tool: intent.tool.name,
          args: intent.args,
          message:
            `I can submit a loan for ${intent.args.amountEth} USDC over ${intent.args.termMonths} months. ` +
            "Confirm to proceed.",
        });
        return;
      }

      const result = await invokeAgentTool(intent.tool.name, intent.args, {
        id: user.id,
        role: user.role,
        wallet: user.wallet,
      });
      await logAction(sessionId, intent.tool.name, intent.args, true, user.wallet);
      res.json({
        type: "tool_result",
        mode: "keywords",
        sessionId,
        tool: intent.tool.name,
        result,
        message: JSON.stringify(result.data, null, 2),
      });
      return;
    }

    const prompt = buildThreeTierPrompt({
      featureKey: "agent",
      role: user.role,
      displayName: user.displayName,
      wallet: user.wallet,
    });

    res.json({
      type: "guidance",
      mode: "keywords",
      sessionId,
      message:
        "I can check your borrowing limit, loan status, or credit passport. " +
        "Say 'apply for a 1000 USDC loan' to start a confirmed application. " +
        `(LLM at ${config.llmBaseUrl} unavailable — keyword mode.)`,
      systemPromptPreview: prompt.slice(0, 200),
    });
  } catch (err) {
    next(err);
  }
});

agentRouter.post("/confirm", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = confirmSchema.parse(req.body ?? {});
    const pending = pendingConfirmations.get(body.confirmationId);
    if (!pending || pending.userId !== user.id) {
      res.status(403).json({ error: "Invalid confirmation" });
      return;
    }
    if (Date.now() > pending.expiresAt) {
      pendingConfirmations.delete(body.confirmationId);
      res.status(403).json({ error: "Confirmation expired" });
      return;
    }

    const result = await invokeAgentTool(pending.toolName, pending.args, {
      id: user.id,
      role: user.role,
      wallet: user.wallet,
    });
    await logAction(body.confirmationId, pending.toolName, pending.args, true, user.wallet);
    pendingConfirmations.delete(body.confirmationId);
    res.json({ type: "tool_result", tool: pending.toolName, result });
  } catch (err) {
    next(err);
  }
});

/** Recent agent tool audit trail for the signed-in user (plan H.27). */
agentRouter.get("/actions", requireAuth, async (req, res) => {
  const user = (req as AuthedRequest).user!;
  const prisma = getPrisma();
  if (!prisma) {
    res.json({ actions: [] });
    return;
  }
  try {
    const sessions = await prisma.agentSession.findMany({
      where: { wallet: user.wallet.toLowerCase() },
      orderBy: { startedAt: "desc" },
      take: 5,
      include: {
        turns: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    const actions = sessions.flatMap((s) =>
      s.turns.map((a) => ({
        id: a.id,
        sessionId: s.id,
        toolName: a.toolName,
        confirmed: a.confirmed,
        createdAt: a.createdAt,
        payload: a.payload,
      })),
    );
    res.json({ actions: actions.slice(0, 40) });
  } catch {
    res.json({ actions: [] });
  }
});

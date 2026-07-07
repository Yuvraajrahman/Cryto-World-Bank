import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  AGENT_TOOLS,
  invokeAgentTool,
  type AgentToolDef,
} from "../agent/tools";
import { getPrisma } from "../db/prisma";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { scanForInjection } from "../middleware/injectionScan";
import { buildThreeTierPrompt } from "../prompt/threeTier";

export const agentRouter = Router();

const pendingConfirmations = new Map<
  string,
  { userId: string; toolName: string; args: Record<string, unknown>; expiresAt: number }
>();

const messageSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
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
    /apply.*loan|loan.*apply|borrow\s+(\d+(\.\d+)?)\s*eth/i.exec(message) ??
    /(\d+(\.\d+)?)\s*eth.*loan/i.exec(message);
  if (apply || t.includes("apply for a loan") || t.includes("loan_apply")) {
    const amount = apply?.[1] ? Number(apply[1]) : 0.05;
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
) {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    let session = await prisma.agentSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      session = await prisma.agentSession.create({
        data: { id: sessionId, wallet: "unknown" },
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
  res.json({ tools: AGENT_TOOLS });
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
    await logAction(body.confirmationId ?? randomUUID(), tool.name, body.args, body.confirmed);
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
        await logAction(sessionId, intent.tool.name, intent.args, false);
        res.json({
          type: "confirmation_required",
          sessionId,
          confirmationId,
          tool: intent.tool.name,
          args: intent.args,
          message:
            `I can submit a loan for ${intent.args.amountEth} ETH over ${intent.args.termMonths} months. ` +
            "Confirm to proceed.",
        });
        return;
      }

      const result = await invokeAgentTool(intent.tool.name, intent.args, {
        id: user.id,
        role: user.role,
        wallet: user.wallet,
      });
      await logAction(sessionId, intent.tool.name, intent.args, true);
      res.json({
        type: "tool_result",
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
      sessionId,
      message:
        "I can check your borrowing limit, loan status, or credit passport. " +
        "Say 'apply for a 0.05 ETH loan' to start a confirmed application.",
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
    await logAction(body.confirmationId, pending.toolName, pending.args, true);
    pendingConfirmations.delete(body.confirmationId);
    res.json({ type: "tool_result", tool: pending.toolName, result });
  } catch (err) {
    next(err);
  }
});

/**
 * OpenAI-compatible tool schemas + LM Studio / local LLM tool loop.
 * Write tools never execute here — they return confirmation_required.
 */
import { config } from "../config";
import { AGENT_TOOLS, invokeAgentTool } from "./tools";

export type ChatMsg = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  name?: string;
};

export function openAiToolDefinitions() {
  return AGENT_TOOLS.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description + (t.write ? " (requires human confirmation before execution)" : ""),
      parameters: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(t.parameters).map(([k, typ]) => [
            k,
            { type: typ === "number" ? "number" : "string", description: k },
          ]),
        ),
        required: Object.keys(t.parameters),
      },
    },
  }));
}

export async function llmChatCompletions(body: Record<string, unknown>): Promise<{
  ok: boolean;
  status: number;
  json?: {
    choices?: Array<{
      message?: ChatMsg;
      finish_reason?: string;
    }>;
    error?: { message?: string };
  };
  errorText?: string;
}> {
  try {
    const res = await fetch(`${config.llmBaseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: config.llmModel,
        temperature: 0.3,
        ...body,
      }),
      signal: AbortSignal.timeout(120_000),
    });
    const text = await res.text();
    let json: Awaited<ReturnType<typeof llmChatCompletions>>["json"];
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      return { ok: false, status: res.status, errorText: text.slice(0, 500) };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        json,
        errorText: json?.error?.message || text.slice(0, 500),
      };
    }
    return { ok: true, status: res.status, json };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      errorText: err instanceof Error ? err.message : "llm_unreachable",
    };
  }
}

export type McpAgentResult =
  | {
      type: "message";
      message: string;
      model: string;
      toolTrace: string[];
    }
  | {
      type: "confirmation_required";
      message: string;
      tool: string;
      args: Record<string, unknown>;
      model: string;
      toolTrace: string[];
    }
  | {
      type: "error";
      message: string;
      model: string;
    };

/**
 * One-shot / short tool loop against LM Studio (OpenAI tools API).
 * Max 4 model turns. Write tools stop the loop for human gate.
 */
export async function runMcpAgentTurn(opts: {
  userMessage: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  user: { id: string; role: string; wallet?: string; displayName?: string };
}): Promise<McpAgentResult> {
  const model = config.llmModel;
  const system = [
    "You are the Crypto World Bank MCP banking agent for retail clients.",
    "Balances and loan amounts are in USDC (testing phase), not ETH — prefer USDC wording.",
    "Use tools for account facts. Never invent balances, loan IDs, or transaction hashes.",
    "For submit_loan_application, call the tool with amountEth as the numeric USDC amount the user asked for.",
    "Never claim a write/loan/blockchain action succeeded until the user confirms and the tool runs.",
    "Do not invent markdown tables saying 'Blockchain Write Confirmed' — the UI handles confirmation.",
    "Keep answers concise. Prefer short plain sentences; light markdown (bold, lists) is fine.",
    "If a write tool is proposed, the system will ask the user to Confirm — do not pretend it already ran.",
    `Client: ${opts.user.displayName || opts.user.id} (${opts.user.role}).`,
  ].join(" ");

  const messages: ChatMsg[] = [
    { role: "system", content: system },
    ...(opts.history || [])
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }) as ChatMsg),
    { role: "user", content: opts.userMessage },
  ];

  const tools = openAiToolDefinitions();
  const toolTrace: string[] = [];

  for (let step = 0; step < 4; step++) {
    const upstream = await llmChatCompletions({
      messages,
      tools,
      tool_choice: "auto",
      stream: false,
    });

    if (!upstream.ok || !upstream.json?.choices?.[0]?.message) {
      return {
        type: "error",
        model,
        message:
          upstream.errorText ||
          `LM Studio unreachable at ${config.llmBaseUrl}. Start the local server and load the model.`,
      };
    }

    const msg = upstream.json.choices[0].message;
    const toolCalls = msg.tool_calls || [];

    if (!toolCalls.length) {
      const text = (msg.content || "").trim() || "How can I help with your account?";
      return { type: "message", message: text, model, toolTrace };
    }

    messages.push({
      role: "assistant",
      content: msg.content ?? null,
      tool_calls: toolCalls,
    });

    for (const call of toolCalls) {
      const name = call.function?.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function?.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      const def = AGENT_TOOLS.find((t) => t.name === name);
      toolTrace.push(name);

      if (!def) {
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name,
          content: JSON.stringify({ ok: false, error: "unknown_tool" }),
        });
        continue;
      }

      if (def.write) {
        const amount = args.amountEth ?? args.amount;
        const purpose = args.purpose;
        const term = args.termMonths;
        const bits = [
          `Ready to run **${def.name.replaceAll("_", " ")}**.`,
          amount != null ? `Amount: **${amount} USDC**.` : null,
          term != null ? `Term: **${term} months**.` : null,
          purpose ? `Purpose: ${purpose}.` : null,
          "Tap **Confirm** to submit — nothing runs until you confirm.",
        ].filter(Boolean);
        return {
          type: "confirmation_required",
          tool: def.name,
          args,
          model,
          toolTrace,
          message: bits.join(" "),
        };
      }

      const result = await invokeAgentTool(def.name, args, opts.user);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name,
        content: JSON.stringify(result),
      });
    }
  }

  return {
    type: "message",
    model,
    toolTrace,
    message: "I gathered tool results but hit the step limit. Ask a more specific question.",
  };
}

export async function probeLlm(): Promise<{ ok: boolean; model: string; baseUrl: string; detail?: string }> {
  const baseUrl = config.llmBaseUrl;
  const model = config.llmModel;
  try {
    const res = await fetch(`${baseUrl}/v1/models`, { signal: AbortSignal.timeout(5_000) });
    if (!res.ok) return { ok: false, model, baseUrl, detail: `HTTP ${res.status}` };
    return { ok: true, model, baseUrl };
  } catch (err) {
    return {
      ok: false,
      model,
      baseUrl,
      detail: err instanceof Error ? err.message : "unreachable",
    };
  }
}

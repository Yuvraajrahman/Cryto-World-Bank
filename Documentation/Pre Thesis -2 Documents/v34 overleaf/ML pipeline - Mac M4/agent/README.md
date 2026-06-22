# Agent demo (partial MVT item 11)

Keyword intent router with **human confirmation gate** — not full MCP + Qwen yet.

## Automated check

After `./run.sh`, see `artifacts/agent_status.json` for whether `backend/src/routes/chatbot.ts` exists.

## Manual wiring (~30 min)

Edit `backend/src/routes/chatbot.ts`:

1. Add to `Intent` type: `| "loan_apply"`
2. Add to `INTENTS` array:
   ```ts
   { intent: "loan_apply", keywords: ["apply for loan", "request loan", "borrow", "want a loan"], confidence: 0.88 },
   ```
3. In `handleIntent`, before fallback:
   ```ts
   if (intent === "loan_apply" && user.role === "BORROWER") {
     return {
       text: "I can help you start a loan application. Please confirm before we open the form.",
       actions: [{ label: "Confirm loan application", href: "/app/loans/new?confirm=1&source=agent" }],
       suggestions: ["What is my borrowing limit?"],
     };
   }
   ```
4. Log turns to `agent/agent_action_log.jsonl` (append JSON lines).

## Demo script

1. `npm run dev` from repo root
2. Log in as borrower → Chat → *"I want to apply for a 500 USDC loan"*
3. Show confirmation CTA (no auto-submit)
4. Screen record 30 s → `../evidence/screenshots/`

## Full agent (later)

See parent folder README — Phase III: MCP + Qwen3-8B, 3–5 tools, red-team eval.

/** Three-tier prompt assembly: Stable / Context / Volatile (DT-III.06). */

export type PromptContext = {
  featureKey?: string;
  route?: string;
  wallet?: string;
  role?: string;
  bankId?: string;
  displayName?: string;
  onChainSnapshot?: Record<string, unknown>;
};

const STABLE = [
  "You are the Crypto World Bank (CWB) assistant.",
  "The platform has four tiers: World Bank Reserve → National Bank → Local Bank → Borrower.",
  "Never execute blockchain writes without explicit user confirmation.",
  "Read-only guidance is allowed; write actions require the confirmation gate.",
].join("\n");

export function buildThreeTierPrompt(ctx: PromptContext): string {
  const contextLines: string[] = [
    "## Context tier",
    `Role: ${ctx.role ?? "guest"}`,
    ctx.displayName ? `User: ${ctx.displayName}` : "",
    ctx.wallet ? `Wallet: ${ctx.wallet}` : "",
    ctx.bankId ? `Bank: ${ctx.bankId}` : "",
    ctx.featureKey ? `Feature: ${ctx.featureKey}` : "",
    ctx.route ? `Route: ${ctx.route}` : "",
  ].filter(Boolean);

  if (ctx.onChainSnapshot && Object.keys(ctx.onChainSnapshot).length > 0) {
    contextLines.push(`On-chain snapshot: ${JSON.stringify(ctx.onChainSnapshot)}`);
  }

  const volatile = [
    "## Volatile tier",
    "Respond concisely. If a tool can answer, propose the tool instead of guessing balances.",
    "For loan applications, collect amount and purpose, then propose submit_loan_application.",
  ].join("\n");

  return [`## Stable tier`, STABLE, contextLines.join("\n"), volatile].join("\n\n");
}

# Crypto World Bank — Stabilization & Simulation Prompt (for Cursor, Sonnet 5)

> Usage: paste this into Cursor with the project paper (v38.tex or its PDF) attached.
> Run PHASE 0 by itself first and stop. Read the output before authorizing PHASE 1+.
> Budget is limited — do not try to do everything in one shot.

---

## Context

This repo implements the "Crypto World Bank" (CWB) thesis project: a four-tier
blockchain banking system (World Bank Reserve → National Bank → Local Bank →
Client) with on-chain lending, tiered credit passports, and off-chain
backend/frontend/ML services. The attached paper is the authoritative spec —
use it to know what a feature is *supposed* to do; do not invent behavior it
doesn't describe.

**Scope — only inspect/modify these directories:**
`contracts/`, `backend/`, `frontend/`, `ml-service/`, `shared/`, `scripts/`, `test/`, `hardhat.config.ts`, `docker-compose.yml`, `package.json`, `.env.example`

**Explicitly out of scope — do not read into context or edit:**
`Documentation/`, `Coursework files/`, `Previous Dev/`, `Examples/`,
`All current frontend designs/` (reference-only mockups, not live code),
`node_modules/`, `dist/`, `.next/`, `.git/`, any `.md` files that are pure
documentation rather than code comments. If you need design intent from
`All current frontend designs/`, look at it, but never edit it.

**Known existing infrastructure — build on these, do not duplicate them:**
- `backend/scripts/seed-testing-world.ts` — creates the World Bank, ~196
  national banks, local banks, and 20 clients per local bank. This is entity
  seeding only; it does not move money or generate loans.
- `scripts/build_world_simulation.py` — builds the country/city dataset the
  seed script consumes.
- `scripts/verify-phase1.ts`, `verify-phase2.ts`, `verify-phase3.ts`,
  `backend/scripts/verify-testing-seed.ts` — existing verification scripts.
  Check what they already assert before writing new checks.
- `scripts/phase1-local.sh` / `phase2-local.sh` / `phase3-local.sh` /
  `local-hybrid-demo.sh` — existing local run scripts.

---

## PHASE 0 — Audit only. No edits.

Cross-reference the paper's feature inventory (Section: "List of Features",
~105 items) and its banking-module specs (kinked interest rate, credit-tier
schedule, InterBankLendingPool, UpwardDepositFacility, Credit Passport/SBT,
reserve-ratio enforcement) against what's actually implemented in
`contracts/`, `backend/`, and `frontend/`.

For each Must/Should feature, output one line: `WORKING | BROKEN | PARTIAL |
MISSING — <file(s)> — <one-line reason>`. Group by the paper's feature
categories (core hierarchy, retail lending lifecycle, deposits, group
lending, multi-entity/cross-tier, credit passport, AI/ML, conversational
agent, frontend/API, security, evaluation).

Specifically verify:
- The kinked interest rate model actually kinks at U*=80% utilization where
  it's implemented (contract and/or backend), not just referenced in a
  comment.
- The Bronze→Diamond tier schedule (score ranges, max loan, rate modifier
  from the paper's table) matches what `CreditPassport.sol` and any backend
  tier logic actually enforce.
- Reserve-ratio enforcement is real (a call that should be blocked below the
  ratio is actually blocked) rather than checked only in the UI.
- Whether `InterBankLendingPool` and `UpwardDepositFacility` have working
  end-to-end paths (contract function → backend route → frontend UI), or
  whether any layer is missing.

End PHASE 0 with a short prioritized list: what's safe to build the
simulation on top of right now, and what needs fixing first because the
simulation would otherwise just exercise broken code. Stop here and wait for
me to say which items to act on.

---

## PHASE 1 — Fix what PHASE 0 flagged (only the items I approve)

For each approved item: make the minimal correct fix, note which file(s)
changed and why, and re-run the relevant existing test/verify script
(Foundry/Hardhat tests in `test/`, or `scripts/verify-phase*.ts`) to confirm
it didn't regress anything else. Don't refactor unrelated code while you're
in a file.

Also, if not already present and the paper calls for it:
- Confirm the installment interest-rate calculation and the per-tier rate
  modifier are read from one shared source of truth (not duplicated/drifted
  between contract and backend).
- Add tier-appropriate authority actions where the paper implies them but
  the UI doesn't expose them yet — e.g. a National Bank authority view to
  approve/adjust downward allocation to a Local Bank, a Local Bank authority
  view to approve loans and adjust local reserve parameters within the
  bounds the contracts allow, and client-facing buttons for actions that
  exist on-chain/in the API but aren't reachable from the UI yet. Don't
  invent new financial mechanics beyond what the paper specifies — only wire
  up what already exists on the backend/contract side but is missing a UI
  entry point, plus small, clearly-labeled admin controls for adjusting
  rates/tiers within existing bounds.

---

## PHASE 2 — Build the capital-flow + loan/installment simulator

Extend (don't replace) `backend/scripts/seed-testing-world.ts` and the
existing verify scripts with a new simulation script
(`backend/scripts/simulate-economy.ts` or similar) that, using the entities
the seed script already created. Build this as a callable function/service
(not just a CLI script) from the start, because PHASE 2B wires a Super Admin
UI on top of it — the UI and the CLI script should call the same underlying
code, not duplicate the logic.

Parameterize total capital, not just as a CLI flag but as an argument the
service accepts, and make sure nothing is hardcoded to 100M — the admin
panel in PHASE 2B needs to run this at anywhere from a small test amount up
to 1,000,000,000 (1B) mock USDC without code changes.

1. Distributes an aggregate total (default 100,000,000, admin-configurable)
   mock USDC from the World Bank Reserve down to National Banks in
   randomized (but reserve-ratio-legal) amounts, using the real
   `allocateCapital` path — not a database write that bypasses the contract
   logic.
2. Each National Bank distributes its allocated/reserved amount down to its
   Local Banks, again randomized within whatever caps the contracts enforce.
3. Local Banks originate a randomized number of loans to randomly selected
   clients, with randomized principal/term within each client's credit-tier
   limits, and generate the installment schedule for each loan.
4. Randomly mark a subset of installments as paid (some on-time, some late)
   spread across a simulated time period, and leave the rest pending/future
   — so the resulting dataset has a realistic mix of active, delinquent, and
   completed loans.
5. Generate a randomized volume of same-tier flows (`InterBankLendingPool`)
   and upward surplus flows (`UpwardDepositFacility`: Local→National,
   National→World), using the real contract paths.
6. Accrue and distribute interest/surplus at each tier per the paper's
   formulas (kinked rate, NetInterest split across depositor/InsuranceFund/
   protocol where that module exists). The rate parameters (base rate, kink
   utilization, slope1/slope2, per-tier modifier) must be read from a single
   config/service the admin panel can override at runtime — not constants
   buried in the simulation script.
7. Make the whole run idempotent/re-runnable and parameterized (total
   capital, client count multiplier, time period, random seed, and the rate
   parameters from point 6) the way `seed-testing-world.ts` already is.

---

## PHASE 2B — World Bank Super Admin control panel

Build a UI, gated to the World Bank super admin role only, that turns
PHASE 2's simulator and PHASE 1's rate/tier config into something the admin
can drive interactively instead of only via script:

- **Run a simulation**: form to set total capital (default 100M, up to 1B),
  client-count multiplier, time period, and random seed, then trigger the
  PHASE 2 service and show progress/results (reuse whatever real-time
  update mechanism the app already has — e.g. the existing WebSocket/
  notifications layer — rather than adding a new one).
- **Adjust rates live**: editable fields for the kinked-rate parameters
  (base rate, kink utilization, slope1, slope2) and the per-tier modifier
  table (Bronze→Diamond), so the admin can experiment. Every change writes
  to the same config source PHASE 2 reads from, is logged with old value →
  new value → admin identity → timestamp, and can be reverted to the
  previous value with one click.
- **"Optimize" action**: given the current total reserve target (e.g. 1B
  USDC) and the existing reserve-ratio / tier-limit / kink-model
  constraints from the paper, calculate a rate and allocation configuration
  that keeps the system stable at that scale — i.e. an alternative to
  whatever ad-hoc values the admin landed on after manual experimentation.
  You (Claude) determine the actual optimization approach and the concrete
  numbers; do not hardcode a guessed "optimized" table. At minimum, the
  calculation should account for: utilization staying under the kink point
  under expected loan demand at that capital scale, reserve ratios holding
  at every tier under the randomized flow volumes PHASE 2 generates, and
  interest income covering the InsuranceFund/protocol split without
  starving depositor yield. Show the admin a before/after comparison (their
  current values vs. the optimized ones) and let them apply or discard it —
  never auto-apply silently.
- Document the optimization logic in code comments and in your PHASE 3
  report in plain terms (what it optimizes for, what it assumes, what its
  limits are) so it isn't a black box — this is a thesis project and the
  admin needs to be able to explain the math, not just trust a button.
- This panel is powerful (it can move simulated large sums and change live
  rates) — every action it triggers must go through existing RBAC and be
  written to whatever audit-log table/route the backend already has
  (`backend/src/routes/audit.ts` if that's where it belongs), not a new
  parallel logging mechanism.

---

## PHASE 3 — Verify stability, don't just assert it

After a simulation run, compute and report (script output, not just a
claim):
- Capital conservation: sum of balances across every tier equals what was
  injected plus net interest, with no leaked or duplicated funds.
- No institution or client account goes negative at any point.
- Reserve ratios stayed within the contract-enforced minimum at every tier
  throughout the run, not just at the end.
- No un-liquidated position breaches whatever health-factor/solvency rule
  the paper defines, if `LiquidationEngine`-equivalent logic exists; if it
  doesn't exist yet, say so rather than skipping the check.
- A summary suitable for the paper's "reserve transparency dashboard" idea —
  even a JSON/console report is fine if the dashboard UI isn't built yet.

Run this verification at least twice: once at the default 100M scale with
random rate experimentation (to show the admin panel's "randomize" path
doesn't need to be stable), and once at 1B scale using the "optimize"
output from PHASE 2B (to show the optimized config is the one that actually
holds up under load). The contrast between the two runs is itself useful
evidence for the paper — a random configuration is allowed to wobble or
fail, the optimized one shouldn't.

If any invariant fails, report it as a finding, not a bug to silently patch
— then propose the fix and wait for approval before changing contract logic.

---

## Token usage — work economically, this budget is small

- Never dump whole directories or large files into context "to be safe."
  Use targeted search/grep for the specific symbol, route, or component
  you need before opening a full file.
- Once you've read a file in this session, don't re-read it unless you've
  since edited it or someone else's diff touched it — track what you
  already know instead of re-fetching.
- Don't paste full file contents back to me in chat; show diffs or a
  short summary of what changed and why. Full paste-backs cost output
  tokens for no benefit.
- Batch related edits into as few tool calls as reasonably possible rather
  than one tiny edit per turn.
- Keep the PHASE 0 audit output structured and terse (the table format
  specified above) rather than prose explanations per feature — save the
  prose for the final findings/recommendations, where it earns its keep.
- Don't re-run the full test suite after every micro-edit; batch a
  logical set of related changes, then run the relevant tests once.
- If a phase is going to need substantially more context than expected
  (e.g. PHASE 0 discovers the codebase is more tangled than the directory
  structure suggested), say so and ask before burning budget on it, rather
  than pushing through silently.

---

## Final step — improvement recommendations (after PHASE 3, or wherever the budget runs out)

Once you've audited, fixed, built, and verified what the budget allows,
write a short recommendations list — this doesn't need code, just a plain
write-up:

1. **Financial-stability improvements**: concrete ideas to make the fund/
   loan/surplus/downward/upward flow more robust than what exists now —
   e.g. gaps in the reserve-ratio logic under stress, missing circuit
   breakers, better handling of cascading defaults across tiers, anything
   PHASE 3's stability checks exposed as a near-miss even if it didn't
   technically fail.
2. **UI/UX improvements**: what would make the tier-authority views and the
   new Super Admin panel more usable or informative — e.g. better
   visualizations of capital flow, clearer approval workflows, alerts when
   a bank approaches its reserve-ratio floor.
3. Note explicitly in this write-up that MCP-based agent tooling for
   automating these actions (e.g. an agent that runs simulations, approves
   loans, or adjusts rates on schedule) is planned for a later phase — not
   now. Where relevant, flag which of the actions you built in PHASE 1/2B
   would be good candidates for that future MCP tool surface (i.e. which
   ones are already clean, single-purpose backend calls that an agent could
   call directly), so that work is easier to start later, but do not build
   any MCP server, tool definitions, or agent wiring in this session.

---

## Working rules for the whole session

- After each phase, give a short status: what's verified working, what
  changed, what's still open, and what you'd do next — so I can decide
  whether to continue in this session or pick it up in a new one.
- If a task would require rewriting a core contract already marked `Must`
  and working, flag that before doing it — don't silently redesign settled
  parts of the system.
- Never touch `Documentation/`, `Coursework files/`, `Previous Dev/`,
  `Examples/`, or `All current frontend designs/`.
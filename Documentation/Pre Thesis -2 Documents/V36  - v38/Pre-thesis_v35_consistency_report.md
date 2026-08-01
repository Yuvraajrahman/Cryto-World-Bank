# Consistency Check — Pre-thesis_v35.tex

Scope: cross-checked Chapter 3 (System Architecture and Design) against Chapter 4 (Methodology / phase plan) and the Conclusion/Appendices, focused on your ask — planning of phases, architecture specifications, and whether the full document agrees with itself. All line numbers refer to the uploaded `.tex` file. Findings are grouped by severity; each includes exact quotes so you can locate them with `grep`.

---

## A. High severity — contradicts the project's own headline numbers

### A1. "13 + 8 + 5 = 21 tables physically migrated" does not match the table it summarizes
Line 1660 (repeated at line 4019):
> "Approximately **13 + 8 + 5 = 21 tables** are physically migrated across Phases I–III"

But `Table~\ref{tab:db-implementation-tiers}` (lines ~1715–1790), the table this sentence is summarizing, actually tags:
- **M1 (Phase I): 13 entities** ✅ matches
- **M2 (Phase II): 12 entities**, not 8 — it includes `GROUP_CONSENT, LOAN_GROUP, GROUP_MEMBER, INTERBANK_LOAN, UPWARD_DEPOSIT, SAVINGS_ACCOUNT` in addition to the 6 you'd get to 8
- **M3 (Phase III): 7 entities**, not 5 — it includes `SESSION_ANCESTOR` and `SECURITY_EVENT_LOG` in addition

Real total per the table's own tags: **13 + 12 + 7 = 32**, not 21. This is cited as a key scope-control claim ("the graded prototype does not require 51 physical tables") in two places, so the undercount understates real Phase II–III database work by roughly 50%.

### A2. "Fifteen modular contracts" excludes two contracts that are independently specified, phased, and deployed
The "fifteen contracts" claim is stated three times as the complete inventory:
- Line 1276: "a smart-contract layer (**fifteen modular EVM contracts**...)"
- Line 1660: "...architectural consistency with the **fifteen-contract inventory**"
- Line 5637: "The complete banking architecture is designed around **fifteen modular contracts**"

Both canonical listings (the Ch.3 table at line ~1296–1319, and the "Smart Contract Capabilities" chapter at line ~5637) enumerate exactly 15 names and stop there. But two other contracts are treated throughout the rest of the document as independent, separately-built modules:

- **`LoanController`** — has its own on-chain state machine description (lines 1392, 2482, 3162), its own DT tasks (DT-II.01–03), its own row in the Appendix C deployment manifest with its own address file (line 5695), and its own cell in the two-developer workstream table (line 3618: "LoanController, SBT limits, IBLP/Group pool"). Yet in the "fifteen contracts" chapter it is only mentioned parenthetically as something the Local Bank Contract "owns" (line 5645) — not listed as a contract in its own right.
- **`LiquidationEngine`** — has its own dedicated section (§3.x, line 2167) with its own HF-monitoring mechanics and its own figure (line 2205), and is explicitly assigned a phase in two different places (see A3 below). It does not appear as a row in either 15-contract list.

If these are genuinely separate deployable contracts (which their task IDs, deployment addresses, and effort estimates imply), the real inventory is **~17 contracts**, not 15. If they are meant to be sub-components of `LocalBank`/another contract, that should be stated once, consistently, and they should stop getting independent phase assignments and effort estimates.

### A3. The same contract is assigned to different phases in different tables
| Contract | Says Phase II | Says Phase III |
|---|---|---|
| `FXModule` | Ch.3 contract table, line 1313: "Specified (Phase II)" | §4 Phase II scope note, line 3355: "...FXModule...are Phase III"; also line 3057 |
| `TreasurySwap` | Ch.3 contract table, line 1316: "Specified (Phase II)" | Line 3057: "Syndicated / Tranched / TreasurySwap in Phase III" |
| `LiquidationEngine` | Conclusion, line 5161: "Liquidation Engine, SavingsVault, FixedDeposit, GroupLendingPool. **Phase II** deposit-and-credit suite" | §4 Phase II scope note, line 3355: "...and LiquidationEngine are **Phase III**" |
| `InsuranceFund` | Ch.3 contract table, line 1309: "Specified (**Phase II**)" | Phase I task register, line 3318: `DT-I.06`, Should, "**InsuranceFund** contract — 5% interest capture..." scheduled **in Phase I** (Weeks 1–4) |

These aren't just wording drift — they change which Gate (G1/G2/G3) a reader should expect the contract to be demoed at, and they change the Phase I vs Phase II effort totals depending on which table you trust.

### A4. Chapter 3's "Prototype Scope" table disagrees with Chapter 4 on what counts as "Future Work" vs. an actively-budgeted task
Three rows in `Table~\ref{tab:prototype-scope}` (Ch.3, ~line 1120–1145) say **"Future Work"**, meaning (by the document's own definition at line 1660) "specified; no MVT migration/implementation" — but Chapter 4 gives each of them a task ID, a priority, and a person-day budget inside the 16-week plan:

- **EIP-7702 session keys** — Ch.3 table: "Future Work". Ch.4: `DT-III.05`, Should, **5 person-days**, explicitly scheduled for Week 13 (line 3593: "DT-III.05 (EIP-7702 session keys) is a Should extension").
- **ZKP KYC compliance layer** — Ch.3 table: "Future Work". Ch.4: `DT-IV.06`, Could, **5 person-days**, "Groth16 zkKYC circuit... Circom 2.0", scheduled Week 16.
- **Oracle (Chainlink Functions)** — Ch.3 table: "Stretch (Ph. III)" (implying it might be attempted). Ch.4 flips this the other way: `DT-III.01` is explicitly labeled **Future Work** (not Must/Should/Could), and the Phase III objective paragraph (line 3390) says "Chainlink Functions... remain specified Future Work."

Pick one meaning for "Future Work" and apply it consistently — right now a reader can't tell whether these three items get person-days allocated in the 16-week plan or not.

### A5. Cross-tier fund transfer's phase contradicts the Gate G1 exit criteria
`Table~\ref{tab:prototype-scope}` (Ch.3, line 1130): "Cross-tier fund transfer & Planned (**Ph. II**)".

But Gate G1 — the end-of-Phase-I checkpoint — explicitly requires this to already be working:
- Line 3499 (Gate table): "G1 & End Week 4 & ...**≤5 min screen recording of `allocateCapital`**"
- Line 3972: "The G1 demonstration package comprises: ...(ii) **capital-flow demo (`allocateCapital` chain)**..."

`allocateCapital` *is* the cross-tier fund transfer function. If it must be demoed at G1 (end of Phase I), the feature can't simultaneously be "Planned (Ph. II)" in the scope table.

---

## B. Medium severity — internal arithmetic doesn't check out

I re-summed every `DT-*` task row against the "total estimated effort" lines printed under each phase table. Phase I is fine; the other three are not:

| Phase | Stated Must-have total | Sum of rows tagged Must | Stated all-priority total | Sum of all rows |
|---|---|---|---|---|
| I | 30 days | **30** ✅ | 48 days | **50** (off by 2) |
| II | 33 days | **28** (off by 5) | 36 days | **68** (off by 32) |
| III | 44 days | **29** (off by 15) | 69 days | **77** (off by 8) |
| IV | 21 days | **14** (off by 7) | 38 days | **36** (off by 2) |

Phase II and III are the largest discrepancies — the printed "36 days all-priority" for Phase II is barely more than half the actual sum of the 16 listed tasks (68 days), and Phase III's printed Must-have total (44) is *higher* than the real Must-only sum (29), which is the opposite direction of error from Phase II. These read like leftover numbers from an earlier task list that wasn't recomputed after tasks were added/re-prioritized.

Separately, line 3823 (Implementation Feasibility section) states "**Phase I originally estimated 29** Must-have person-days," which doesn't match the Phase I table's own printed 30-day Must total two sections earlier — a small but avoidable contradiction between two mentions of the same figure. The same sentence also calls 48 person-days "**all Should tasks**," but 48 is actually the table's *all-priorities* total (Must+Should+Could); the real Should-only total is about 19–20 days. That's a mislabeling that makes Phase I look far more schedule-constrained by "Should" work than it actually is.

---

## C. Medium severity — task IDs referenced that don't exist

- Line ~3609 (four-phase summary table): Phase II tasks listed as **"DT-II.01--19"** — but the Phase II task register (line 3351–3373) only defines tasks through `DT-II.16`. There is no DT-II.17, .18, or .19 anywhere in the document.
- Line ~3599 (Phase IV, Week 16 build order): "**DT-IV.10** equivalent: README with step-by-step reproduction..." — the Phase IV task register only goes up to `DT-IV.08`. DT-IV.09 and DT-IV.10 are never defined.
- `DT-I.11` is given two different definitions:
  - In the Phase I task table (line 3329): "Could — **Polygon zkEVM Cardona migration** (design-preference target) — update RPC endpoints, chain IDs, factory addresses"
  - In the Weeks 1–2 build-order paragraph (line 3518, Track C): "DT-I.11 (**Sepolia primary RPC via Alchemy**, chain IDs, faucet script)"
  
  These describe two unrelated pieces of work (comparison-chain migration vs. primary-chain RPC setup) under the same task ID.

---

## D. Medium severity — graded MVT items with no corresponding task or budget

Three items in the MVT deliverable checklist (`Table~\ref{tab:mvt-checklist}`, line ~3075–3090) are Must/Should graded deliverables with a stated phase, but none of the four DT-* task registers contains a matching task, so no person-days are budgeted for them anywhere:

- **MVT #13** — "Slither + Mythril audit reports on World/National/Local Bank contracts," Phase IV. No `DT-IV.*` task covers this (DT-IV.01–08 cover simulation, LLM eval, Certora, fuzzing, consistency pass, and red-teaming — not the static/symbolic-analysis audit itself).
- **MVT #15** — "2-of-3 Safe multisig holding `WorldBankAdmin` before first inspectable testnet deployment," Phase I. No `DT-I.*` task covers multisig setup.
- **MVT #16** — "Tenderly alert rules live for 3 demo-critical triggers," Phase III–IV. Tenderly is discussed narratively in §4.6 ("Real-Time Dashboard Pipeline," line 3282–3283) but never receives a task ID or effort estimate in either Phase III or Phase IV's register.

Since these are graded (Must or Should) per the checklist, the Phase I and Phase IV effort totals in section B above are missing whatever time these actually take — which also means the arithmetic gaps in section B are probably worse than shown, not better.

---

## E. Lower severity — worth a cleanup pass

- **FixedDeposit's phase is asserted but never scheduled.** It's "Specified (Phase II)" in the Ch.3 contract table (line 1307) and appears in the Prototype Scope table as "Planned (Ph. II)" (line 1136), but the Phase II scope note's explicit list of core Phase II contracts (line 3355: "SavingsVault, LoanController, GroupLendingPool, InterBankLendingPool, and UpwardDepositFacility") omits it, and no `DT-II.*` task builds it. It's also tagged **Stub** (not M2) in the DB implementation-tiers table (line 1770), which by the document's own definition means "ERD only until the matching contract ships" — i.e., no defined ship date. Three different confidence levels for the same feature.
- **CurrentAccount** has the identical problem: "Specified (Phase II)" in the Ch.3 table, but tagged **Stub** in the DB tiers table and absent from every Phase II task list.
- **Tenderly trigger count drifts between 3 and 6** depending on the section. Line 2700 (L4 defense-in-depth layer) and MVT item #16 both say **3** demo-critical triggers are the graded item. Line 3283 (§4.6) says "**Six** critical alerts are planned" and lists all six without flagging which 3 are MVT-graded vs. which 3 are the optional stretch set mentioned separately at line 3089. Readable if you cross-reference three sections, but not stated once, clearly, in one place.
- **Appendix C's "consolidated Phase IV template"** (line 5677 caption) only has 4 rows (WorldBankReserve, NationalBank, LocalBank, LoanController) — none of the Phase II/III contracts (SavingsVault, GroupLendingPool, InterBankLendingPool, MCP-related config, etc.) that the plan says will be deployed by Phase IV have a row. If it's meant to be filled in later, say so explicitly next to the caption; right now "consolidated" oversells what's actually a Phase-I-only stub.

---

## Recommended Fixes

For each item I picked a specific resolution (not just "make them agree") based on which version is corroborated by the most other passages, which requires the least collateral rewriting, and which matches the technical logic of the system. Use these as a starting point — you know the intended scope better than a document audit can.

### Fix 1 — Contract count: go to 17, don't fold LoanController/LiquidationEngine away
`LoanController` and `LiquidationEngine` already have independent deployment addresses (Appendix C), independent task IDs, and independent effort estimates — collapsing them into `LocalBank` would mean rewriting the deployment manifest, the workstream table, and several DT tasks. Cheaper and truer to what's actually specified: keep them separate and fix the count.
- Change "fifteen modular contracts" → "**seventeen** modular contracts" in all three places (lines 1276, 1660, 5637).
- Add two rows to the Ch.3 contract table (line ~1296) and to the "Smart Contract Capabilities" chapter (line ~5637):
  - `LoanController` — Module: "Lending state machine"; Status: **"Specified Phase I (deployed as shell by `LocalBank`), functional Phase II"** — matches DT-I.03 (Local Bank contract, Phase I) plus DT-II.01–03 (loan request/approval/installment logic, Phase II).
  - `LiquidationEngine` — Module: "Risk / liquidation"; Status: **"Planned (Phase III)"** — two of the three mentions already say Phase III (line 3355), and it fits thematically with the other advanced-risk modules built after the core lending loop is stable. Fix the one outlier (Conclusion, line 5161) to move it out of the "Phase II deposit-and-credit suite" bullet.
- Update line 5637's "three-contract lending core... remaining twelve modules" → "**four**-contract lending core... remaining **thirteen** modules" to absorb `LoanController` into the Phase I core group.

### Fix 2 — Database migration count: report 32, not 21
The table's own tier tags are the source of truth (they're per-entity, harder to get wrong than a summary sentence). Change both instances of "13 + 8 + 5 = 21 tables" (lines 1660 and 4019) to **"13 + 12 + 7 = 32 tables."** If 21 was actually the *target* and some M2/M3 rows are mistagged, go the other direction: move `GROUP_CONSENT`, `LOAN_GROUP`, `GROUP_MEMBER`, `INTERBANK_LOAN`, `UPWARD_DEPOSIT`, `SAVINGS_ACCOUNT` from M2 to Stub (they're already marked "If GroupLendingPool demo chosen" / "one multi-entity PoC" — conditional language that reads more like Stub than a committed M2 migration), which brings M2 down to 6 and gets you close to the original 8+5=13 for M2+M3. I'd lean toward the first option (relabel the sentence) since it's a one-line fix vs. re-scoping six database entities.

### Fix 3 — Contested contract phases: resolve each one specifically
| Contract | Recommended phase | Why |
|---|---|---|
| `FXModule` | **Phase III** | Explicitly named Phase III at line 3355 and grouped with the other "Phase III stretch" multi-entity contracts at line 3057. Only one outlier (line 1313) says Phase II — fix that cell. |
| `TreasurySwap` | **Phase III** | Same reasoning — line 3057 groups it with `SyndicatedLoan`/`TranchedPool` as Phase III stretch goals; it depends on the same oracle-pricing maturity. Fix line 1316. |
| `LiquidationEngine` | **Phase III** | See Fix 1. |
| `InsuranceFund` | **Phase I (Should), documented fallback to Phase II** | This isn't a clean contradiction once you read line 3523: DT-I.06 is explicitly a Phase I Should item "deferred to Phase II+ per Table phaseI-deferred; not blocking G1." Rather than picking one phase, change the Ch.3 table cell (line 1309) from a flat "Specified (Phase II)" to **"Specified (Ph. I, Should — commonly deferred to Ph. II, see Table~\ref{tab:phaseI-deferred})"** so both mentions tell the same story. |
| `FixedDeposit` / `CurrentAccount` | **Stub (no committed phase)** | Neither has a DT task in any phase, and both are already tagged Stub in the DB-tiers table. Change the Ch.3 table and Prototype Scope table entries from "Specified (Phase II)" / "Planned (Ph. II)" to **"Specified; Stub — migrates when contract ships"** to match. Lower-risk direction since it doesn't add work to an already-tight Phase II (see Fix 4). |

### Fix 4 — Recompute the printed effort totals from the task rows
Trust the individual DT-* rows (they encode the actual per-task scope decisions) and mechanically regenerate the summary line under each phase table:

| Phase | Must-have → | All-priority → |
|---|---|---|
| I | 30 (no change) | 48 → **50** |
| II | 33 → **28** | 36 → **68** |
| III | 44 → **29** | 69 → **77** |
| IV | 21 → **14** | 38 → **36** |

The Phase III Must-have gap (44 stated vs. 29 actual) is the largest and points the other direction from the rest — worth checking whether some Should-tagged tasks (e.g., `DT-III.08`, `DT-III.09`) were originally meant to be Must before a re-prioritization pass, in which case fix the **Priority column**, not just the total. If no such re-prioritization was intended, just reprint 29.

Also reword line 3823: change "originally estimated 29 Must-have person-days" → "30" to match the table, and replace "(48 total person-days)" for "all Should tasks" with the correct Should-only figure (~19–20 days), or relabel it "all-priority total" if 48/50 was the intended meaning.

### Fix 5 — Give MVT items 13, 15, 16 real tasks
Add three new task rows rather than leaving them un-budgeted:
- **`DT-I.18`** (new), Must, "Safe 2-of-3 multisig setup and `WorldBankAdmin` role transfer" — ~1 day. Covers MVT #15.
- **`DT-IV.09`** (new), Must, "Slither + Mythril audit run on World/National/Local Bank contracts; triage and archive report" — ~2 days. Covers MVT #13.
- **`DT-IV.10`** (new — also legitimately fills the dangling reference from Fix 6), Should, "Tenderly alert configuration: 3 demo-critical triggers + README reproduction pass" — ~1–2 days. Covers MVT #16 and gives the README task (MVT #10, currently also task-less) a real ID.

Add their effort to the relevant phase totals once Fix 4 is applied.

### Fix 6 — Dangling and conflicting task IDs
- `DT-II.01--19` (line ~3609) → **`DT-II.01--16`**.
- `DT-IV.10` (line ~3599, currently "equivalent") → resolved by Fix 5 (make it a real task), or if you'd rather not add new tasks, cite `DT-IV.07` (the consistency-pass task) instead, since the README reproduction fits naturally there.
- `DT-I.11` — keep the Phase I table definition ("Polygon zkEVM Cardona migration, Could") and give the Sepolia RPC/faucet-script work in the Weeks 1–2 build order its own ID, e.g. **`DT-I.00`**, or fold that sentence into `DT-I.14`/`DT-I.15` (React shell + WalletConnect), since RPC/chain config is naturally part of standing up the frontend's network connection anyway.

### Fix 7 — Cross-tier fund transfer: split by granularity instead of picking one phase
The contradiction dissolves if you split the single Prototype Scope Table row into two, which also matches what the rest of the document already implies (a basic transfer demoed at G1, full cascading logic finished later):
- "Cross-tier fund transfer — single-hop `allocateCapital`" → **Planned (Ph. I)**, matches the G1 exit criteria.
- "Cross-tier fund transfer — cascading repayment / interest accrual across tiers" → **Planned (Ph. II)**, matches the "Complete hierarchical lending implementation" future-work item (line 5157).

### Fix 8 — Tenderly trigger count
In §4.6 (line 3283), replace the flat "six critical alerts are planned" list with an explicit split: state the **3 MVT-graded** triggers (large disbursement, reserve-ratio drop, governance pause — matching line 2700 and MVT item 16) first, then the **3 optional/stretch** triggers (repeated loan requests, failed `disburseLoan` calls, role-grant events) separately, referencing the "full 6-trigger Tenderly set" already named as optional at line 3089. No new content needed — just reorganize what's already written into the same two buckets used elsewhere.

### Fix 9 — Appendix C manifest scope
Either (a) add placeholder rows for the Phase II/III contracts (`SavingsVault`, `GroupLendingPool`, `InterBankLendingPool`, `UpwardDepositFacility`, `MockUSDC`) so the table matches its "consolidated Phase IV template" caption, or (b) rename the caption to "Phase I deployment manifest (extended incrementally through Phase IV)" if you'd rather leave it as-is until later phases are built. (a) is more work now but avoids the same "template doesn't match its own label" pattern behind several of the other findings.

---

Want me to actually apply any of these directly to the `.tex` file (patch the specific lines/tables) rather than just describing the edits?

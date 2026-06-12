# Crypto World Bank — Unified Improvement Suggestions for v17
## Incorporating Panel Defense Analysis, Scope Rationalization, Terminology Changes, Simulation Plan, and Platform Positioning

**Prepared:** May 2026
**Based on:** Pre-thesis_v16.tex, CWB_v16_Panel_Defense_Analysis.md, CWB_v16_Scope_And_Distinction_Report.md, and supplementary online research

---

## OVERVIEW OF THIS DOCUMENT

This report consolidates all improvement directions into a single actionable reference. It integrates:
- Retained improvements from the Scope Rationalization report (with updates per your preferences)
- Critical and major fixes from the Panel Defense Analysis
- Terminology changes you have requested
- Your simulation/prototype plan for v17
- Positioning analysis relative to FTX and similar platforms
- Online research on current DeFi exchange design standards (2025–2026)

---

## PART 1 — TERMINOLOGY CHANGES (Apply Globally Across the Entire Document)

### 1.1 "Borrower" → "Client"

Replace every instance of the word **"borrower"** in the thesis body (excluding historical citations and referenced literature) with **"client"** or a more specific contextual term. The rationale:

- "Client" is the standard term used by financial service platforms (banks, investment firms, payment services) and accurately reflects the relationship when the platform also supports savings, currency exchange, and multi-product interactions.
- "Client" is more inclusive — it covers both lending clients and savings/deposit clients, matching the closed-loop economic model.
- Suggested contextual replacements:
  - When specifically discussing a loan applicant: **"credit client"** or **"loan client"**
  - When discussing the solidarity group: **"group members"** or **"group clients"**
  - When referencing the full retail tier: **"retail clients"** or **"end clients"**
  - In database schema and smart contract roles: rename the `BORROWER` entity to `CLIENT` and the `borrower_id` foreign key to `client_id` throughout.

**ER / Schema impact:** The `PROFILE_SETTING` entity's FK should reference `client_id`, and the cold-start pathway design (see Part 3, Fix 2.4) should use "new client" rather than "new borrower."

---

### 1.2 "Lending Platform" → "Cryptocurrency Exchange Platform"

Replace the phrase **"lending platform"** wherever it appears as a standalone descriptor of the Crypto World Bank as a whole. The platform is more accurately described as a **cryptocurrency exchange and financial services platform** or simply **"crypto exchange platform"** in short form. Specific guidance:

- The platform's primary value proposition is the exchange and allocation of cryptocurrency-denominated financial instruments (loans, savings, interbank transfers, cross-tier capital). Calling it a "lending platform" undersells this and misframes the comparison with peers.
- In Section 1.1 and the Abstract, update the one-line description to: *"a blockchain-based cryptocurrency exchange and institutional finance platform that coordinates capital allocation across a four-tier institutional hierarchy."*
- In Section 3.5.3 (Conversion Funnel) and marketing-context sections (Chapter 5), use **"crypto financial services platform"**.
- Do **not** replace "lending platform" in citations to other platforms (e.g., "Goldfinch's lending platform") — only the self-referential uses change.

---

### 1.3 Bangladesh / BRAC — Move to Future Work

Per your instruction, **remove all Bangladesh-specific and BRAC-specific implementation claims** from the body of the thesis and reclassify them as **Future Work**.

**What stays:**
- The mention of BRAC, Grameen Bank, and ASA as historical academic references in the microfinance literature review (Section 2.x) — these are standard academic citations, not implementation claims.
- The general motivation from the Global Findex unbanked statistics (1.4 billion adults) — this is global framing, not Bangladesh-specific.
- Bangladesh mentioned as *one example* of a target geography in Tables 1.3–1.5, alongside Southeast Asia and Sub-Saharan Africa.

**What moves to Future Work:**
- The Bengali-language loan form suggestion (previously recommended as a high-value addition)
- The Bangladesh borrower scenario with BDT/bKash rate comparisons
- Any statement that the platform is designed *specifically* for Bangladesh or Sylhet
- The BDT display/conversion feature in the frontend
- References to PDPO (Bangladesh Personal Data Protection Ordinance) as an active compliance requirement

**Future Work framing (suggested text for Section 6.x):**
> *"A priority future work direction is regional pilot deployment. Bangladesh presents a compelling initial target: approximately 40% of adults lack formal banking access [54], and established microfinance institutions (BRAC, Grameen Bank, ASA) have demonstrated group lending viability at scale. A pilot in this context would include Bengali-language localization, BDT/USDC display conversion via a forex oracle, and regulatory engagement under the Bangladesh Bank's fintech sandbox program. Similar pilots are envisioned for Southeast Asia and Sub-Saharan Africa, with the platform's open architecture allowing region-specific parameterization without core protocol changes."*

---

## PART 2 — CRITICAL FIXES (Panel-Stopping Issues — Address Before Any Other Work)

These are the 7 Critical-severity items from the Panel Defense Analysis. Each is a one-paragraph fix or less.

### Fix 1.1 — Money Multiplier Language (Section 1.8.3)
**Remove:** *"recreating the multiplier effect of traditional banking"*
**Replace with:** *"The Reserve Ratio (RR) at every tier functions as a solvency constraint rather than a money-creation parameter; credit velocity (Formula CV) measures the rate at which the fixed capital pool circulates through the hierarchy. Higher credit velocity — not money multiplication — is the platform's capital-throughput mechanism."*

### Fix 1.2 — KYC-Before-Gas Paradox (Section 3.4.1)
Add a named **"pre-KYC bootstrap allowance"** to the Paymaster design: the Paymaster sponsors exactly two function signatures before KYC is completed — `submitKYCHash(bytes32)` and the ERC-4337 account creation transaction — with a gas cap of 0.001 ETH equivalent per wallet address. All other sponsorship gates on KYC completion.

### Fix 1.3 — ML Evaluation Circularity (Sections 4.2, 4.7)
Explicitly split the evaluation claim into two labeled phases:
- **(a) Synthetic-data evaluation** — reports upper-bound performance achievable given the synthetic distribution; labeled "proof-of-concept evaluation only."
- **(b) Real-data evaluation** — deferred to Future Work.

Also state that the stacking meta-learner weights are hardcoded initial values pending real labeled data, and that the system degrades gracefully to a calibrated Random Forest alone when no stacking data is available.

### Fix 2.1 — LLM Model Identity Conflict (Appendix A vs. Section 4.7)
Gemma-4-E4B and Qwen3.5-9B-Instruct are two different models from different organizations. Decide on one. Recommended: keep **Qwen3.5-9B-Instruct** for the thesis evaluation. If Gemma-4-E4B was used in early development, state it explicitly: *"During early development, the assistant used Gemma-4-E4B via LM Studio (Appendix A). For the final thesis evaluation, the assistant uses Qwen3.5-9B-Instruct under the protocol of Section 4.7."*

### Fix 2.2 — Revenue Table ETH Price Inconsistency (Section 5.5)
The assumptions table says $2,000/ETH; the footnote says $2,500; the calculations use $2,500. Fix: set the table entry to **$2,500/ETH**, remove the footnote contradiction, and add a **3-point sensitivity table** showing revenue at $2,000, $2,500, and $3,000 per ETH.

### Fix 2.3 — Design Patterns Count (Section 4.12)
The section opens with "Our system uses three design patterns" but lists five (Singleton, Observer, Adapter, Factory, Proxy/Upgradeable). Change the opening sentence to: *"Our system uses five design patterns."*

### Fix 3.1 — "Complete Banking Architecture" Framing (Chapter 1 opening, Chapter 6 Conclusion)
The Abstract correctly says "formally specified, partially implemented research prototype." This phrase must be used consistently in Chapter 1's opening sentence and Chapter 6's concluding summary. Remove any unqualified use of "complete banking architecture" that implies full implementation.

---

## PART 3 — MAJOR FIXES (Weakens Core Claims if Unaddressed)

### Fix 1.4 — Dual Governance / Emergency Upgrade Path (Section 3.9)
Add one paragraph: *"A dual-governance path is specified. The standard path uses the 24–48h TimeLock for planned changes. An emergency path uses a Security Council — a 4-of-7 Safe multisig composed of members distinct from WORLD_BANK_ADMIN — that can execute emergency upgrades within a 2-hour window. The Security Council can only execute pre-approved emergency action types (pause, upgrade, role revocation); it cannot change system parameters."*

### Fix 2.4 — ML Cold-Start Loop for New Clients (Section 3.10.3)
Define an explicit **cold-start credit pathway**: new clients with zero on-chain history who have passed Level 1 KYC receive a time-limited provisional credit tier with reduced maximum loan amount and mandatory group membership (minimum 5 members). This expires after 3 months. After the first successful repayment cycle, the SBT is populated and normal credit scoring applies.

### Fix 2.5 — SBT Revocation vs. True SBT Definition (Section 3.8)
Choose one honest framing and apply it consistently:
- **Option A (True SBT):** On default, the SBT's `riskTier` field is downgraded and `lastDefault` timestamp is set. The credential is never revoked — it permanently records the default. Borrowing becomes effectively impossible because no lender accepts the downgraded tier.
- **Option B (Governance credential):** Acknowledge that the credit passport is a "governance-controlled non-transferable token, which differs from the strict Buterin SBT definition in that platform governance can revoke it — analogous to a credit bureau record rather than a soulbound identity."

**Recommended:** Option A. It is academically cleaner and preserves the Buterin citation's validity.

### Fix 2.6 — CAR Formula (List of Formulas)
Basel III's Risk-Weighted Assets are undefined for DeFi/USDC assets. Either remove the CAR formula or replace it with a platform-native metric: `PlatformSolvencyRatio = TotalReserveBalance / TotalOutstandingLoans`, described as an on-chain analogue of capitalization adequacy.

### Fix 2.7 — ETH-USD Oracle for USDC Loans (Section 3.5.3)
Replace *"Chainlink ETH-USD feed converted to BDT"* with *"a USD-BDT forex oracle (or fiat-price oracle approved by governance) to display the USDC-equivalent in local currency."* The ETH-USD feed is only relevant for ETH-collateral tiers.

### Fix 3.2 — Aave v3 "Flat Architecture" Characterization
Qualify the claim: *"While existing protocols such as Aave v3 implement risk-parameterized sub-markets and isolation modes (Efficiency Mode, Isolation Mode), they do not model institutional hierarchy, cross-tier capital allocation, or differentiated governance access by institutional role — which are the distinguishing features of the CWB architecture."*

### Fix 6.1 — Literature Table TBD Cell (Table 2.1)
The Tan (2023) IMF working paper entry has "TBD" in the Headline Finding column. Replace with: *"Two-tier CBDC distribution (central bank → commercial banks → users) in developing economies achieves 30–40% higher financial inclusion rates than direct issuance; hierarchical distribution infrastructure is the key enabling design choice."*

---

## PART 4 — LLM / AI SECTION: WHAT STAYS AND WHAT CHANGES

Per your instruction, **the LLM training/assistant section stays** as a demonstration of your AI/ML engineering skillset. The following targeted adjustments are recommended:

### 4.1 Keep the LLM Assistant Section — With These Clarifications
- Resolve the model identity conflict (Fix 2.1 above) — choose Qwen3.5-9B-Instruct as the primary model.
- **Simplify QLoRA fine-tuning to RAG-only** for the pre-thesis deliverable, but frame it as an engineering decision: *"For pre-thesis prototype evaluation, the assistant uses a pre-trained Qwen3.5-9B-Instruct model with a ChromaDB RAG retrieval layer. Full QLoRA fine-tuning on a platform-specific Q&A dataset (200+ pairs) is a Sprint 3 deliverable for the final thesis, with LoRA rank, alpha, and target module parameters specified in Appendix A."* This way the fine-tuning architecture remains a demonstrated engineering design, while the evaluation is honest about what has actually been built.
- **Keep the evaluation protocol** (50-prompt red-teaming for regulatory hallucination, RAG retrieval precision@k) — this is evaluable now.
- **Keep the AMD Radeon RX 9060 XT benchmark** — but tie it to the one model you have actually run (Qwen3.5-9B Q4_K_M), not to Gemma-4.

### 4.2 Random Forest + Isolation Forest + SHAP + GNN Ablation — Keep All
These are Contribution 3 and the core ML engineering demonstration. No changes required beyond the evaluation circularity fix (Fix 1.3).

### 4.3 Remove Behavioral Biometrics from Active Feature Set
These require client-side instrumentation not in the current schema. Move to Future Work in one sentence. The 18 core blockchain transaction features remain.

---

## PART 5 — SIMULATION / PROTOTYPE PLAN (v17 Implementation Direction)

Per your plan to build a simulation of banks and many end-users/clients to demonstrate the platform as a prototype, the following architecture is recommended.

### 5.1 Simulation Scope

| Component | Description |
|---|---|
| **Simulated Banks** | 1 World Bank Reserve (Tier 1), 2–3 National Banks (Tier 2), 4–6 Local Banks (Tier 3) |
| **Simulated Clients** | 50–200 synthetic wallet addresses acting as Tier 4 retail clients |
| **Transaction Volume** | ~500–1,000 simulated transactions across the full loan lifecycle per run |
| **Deployment** | Polygon Amoy testnet (free, fast, EVM-compatible) |
| **Scripting** | Hardhat scripts using `ethers.js` with seeded randomness for reproducibility |

### 5.2 Simulation Script Design

Use Hardhat deployment scripts with deterministic seeds to:
1. Deploy all tier contracts (WorldBankReserve, 2× NationalBank, 4× LocalBank)
2. Fund each bank with testnet USDC from a seed distributor wallet
3. Generate N client wallets using a Hardhat `accounts` fixture
4. Run a loan lifecycle for each client: `applyLoan → approveRisk → signLoan → disburse → repay (×N installments)`
5. Introduce a configurable fraud rate (e.g., 5%) where selected clients default mid-lifecycle
6. Record all on-chain transaction hashes to a JSON manifest for Appendix C

```javascript
// Example structure (Hardhat simulation script)
async function runSimulation({ numBanks = 6, numClients = 100, fraudRate = 0.05 }) {
  const banks = await deployBankHierarchy(numBanks);
  const clients = await generateClients(numClients);
  const results = await runLoanLifecycles(banks, clients, { fraudRate });
  await exportManifest(results, './simulation-output/manifest.json');
}
```

### 5.3 What the Simulation Demonstrates

- **End-to-end four-tier capital flow** — verifiable on Polygon Amoy explorer
- **ML pipeline ingestion** — the FastAPI fraud scoring service processes synthetic transaction features extracted from the simulation
- **Credit passport SBT updates** — each client's SBT is updated as their lifecycle progresses
- **Reserve ratio live dashboard** — reserve ratios at each tier shift as loans are disbursed and repaid
- **Loan audit trail** — The Graph subgraph indexes all lifecycle events, viewable in the frontend timeline

### 5.4 Academic Framing of the Simulation

In Section 4.5 (Economic Feasibility), replace the Mesa ABM description with this simulation approach. Frame it as: *"A scripted on-chain simulation of N clients across a six-institution hierarchy, deployed to Polygon Amoy, replaces the planned Mesa agent-based model for the pre-thesis prototype evaluation. This simulation produces verifiable on-chain evidence for all four research questions, is reproducible via the published seed and Hardhat script, and generates the gas cost data reported in Table 5.4."*

---

## PART 6 — FTX COMPARISON AND DIFFERENTIATION

### 6.1 What FTX Was

FTX was a centralized cryptocurrency exchange that offered spot trading, derivatives, options, leveraged tokens, and a range of advanced trading products. It served both retail and institutional clients with deep liquidity, custom margin products, and complex derivatives tied to digital assets. Unlike decentralized platforms where users control their own assets, FTX operated as an intermediary holding custody of user funds — more like a traditional financial broker.

FTX supported advanced order types, cross-margining, and customizable risk parameters, with a matching engine designed for high throughput and low latency catering to professional trading firms and high-frequency traders.

### 6.2 Why FTX Collapsed — The Core Lesson

FTX had an $8 billion shortfall because customer funds had been improperly transferred to its affiliated trading firm, Alameda Research, for trading and investments. The platform halted withdrawals, then filed for bankruptcy within three days.

The structural cause: centralized custody with no on-chain proof of reserves, no separation between customer funds and operating capital, and no real-time verifiability of solvency.

Only after systemic failure did proof of reserves, governance structures, and auditability become central to valuation and trust.

Decentralised Finance (DeFi) naturally provides users on-chain transparency, self-custody, governance, and fair access to financial products — precisely the properties that would have prevented the FTX governance failures, where managers misused user funds and created 130 side companies without any supervision.

### 6.3 How the Crypto World Bank Differs From FTX

| Dimension | FTX (what it was) | Crypto World Bank |
|---|---|---|
| **Custody model** | Centralized — FTX held all user funds | Non-custodial — client assets held in smart contracts, not by any operator |
| **Reserve transparency** | Opaque — no real-time verifiability; reserves were fabricated | On-chain reserve ratios enforced and readable by anyone in real time |
| **Purpose** | Speculative trading: spot, futures, derivatives, leveraged tokens | Financial inclusion: savings, credit, interbank lending — not trading speculation |
| **Target users** | Professional traders and high-frequency trading firms | Unbanked retail clients, local banks, development finance institutions |
| **Governance** | Centralized (Sam Bankman-Fried controlled all decisions) | Role-based on-chain governance with TimeLock and multi-tier approval |
| **Architecture** | Flat — single liquidity pool for all users | Four-tier institutional hierarchy mirroring multilateral development finance |
| **AI/ML** | None publicly documented | RF + IF + SHAP + commit-reveal oracle integrated into credit governance |
| **Formal verification** | None | Certora CVL invariants on reserve ratios |
| **Risk model** | User-facing: leveraged exposure to volatile crypto assets | Stablecoin-denominated credit; volatility risk removed at retail tier |
| **Collapse risk** | Proved catastrophically fragile (2022) | Reserve ratio enforcement + on-chain audit = structural solvency constraint |

### 6.4 Similarities (Honest Acknowledgment)

Some surface features are similar and should be acknowledged rather than hidden:

- Both are cryptocurrency-denominated financial platforms
- Both support institutional and retail tiers
- Both have a native platform role structure (FTX had FTT governance token; CWB has role-based access control)
- Both aim to reduce friction in financial services

The key distinction is that CWB's architecture is specifically designed to prevent exactly the failure mode that destroyed FTX: opaque reserves, centralized custody, and unverifiable solvency.

### 6.5 Features Worth Learning From FTX (and Similar Platforms)

The following features from FTX and its successor exchange landscape are worth formally referencing in the thesis as external validation or as future work:

| Feature | Source | Applicability to CWB |
|---|---|---|
| **Proof of Reserves (PoR)** | Post-FTX industry standard | CWB's on-chain reserve ratios already implement the core PoR concept; explicitly name this in Section 3.2 as *"on-chain PoR by design"* — every tier's reserve is queryable without the off-chain attestation problem that FTX exploited |
| **Insurance fund for liquidations** | FTX, Binance, Bybit | CWB's InsuranceFund contract is specified; FTX's insurance fund model validates the need; cite as external precedent |
| **Cross-margining / multi-tier risk** | FTX | CWB's tiered collateral requirements per borrower class are a formalized version of this — name it explicitly |
| **Real-time solvency monitoring** | Post-FTX design standard | Modern exchanges implement real-time monitoring systems that track reserve ratios and alert management to potential liquidity issues, automated circuit breakers that halt withdrawals if reserves fall below thresholds, and multi-signature wallet architectures that prevent single points of failure. CWB's Tenderly monitoring and reserve-ratio enforcement implement all three; cite this convergence |
| **Segregated accounts** | Post-FTX industry lesson | CWB's per-tier contract architecture naturally segregates client funds; this is architecturally superior to account-level segregation in a centralized exchange |
| **Leveraged tokens / derivatives** | FTX only | **Not applicable to CWB** — CWB is not a trading platform; derivatives are explicitly out of scope |

### 6.6 How to Position This in the Thesis

Add a paragraph to the Related Work / Competitive Analysis section (Chapter 2 or Chapter 1):

> *"Centralized cryptocurrency exchanges such as FTX (defunct, 2022) demonstrate the catastrophic consequence of opaque reserve management: an $8 billion client-fund shortfall was only discovered at the point of bankruptcy, having been concealed through commingling of client deposits with proprietary trading activity [citation]. The Crypto World Bank's on-chain reserve architecture is designed as a structural response to this class of failure: every tier's reserve ratio is an enforced smart contract invariant, readable by any participant in real time without trust in a third-party attestation. This design property — on-chain Proof of Reserves by construction — is increasingly recognized as the non-negotiable foundation of trustworthy crypto-financial infrastructure [citation], and CWB implements it at the institutional tier level rather than the exchange-account level."*

---

## PART 7 — SCOPE: WHAT STAYS, WHAT MOVES, WHAT CHANGES (Updated Per Your Preferences)

This is the revised version of the Scope Rationalization table, updated to reflect your preference to keep LLM training and remove Bangladesh/BRAC implementations.

### 7.1 Keep (Core Contributions)

| Item | Sprint | Notes |
|---|---|---|
| Four-tier hierarchy (full end-to-end fund transfer) | P0, Sprint 2 | Core Contribution 1 |
| RF + IF + SHAP + commit-reveal oracle | P0, Sprint 3 | Core Contribution 3 |
| GNN ablation (GraphSAGE vs RF) | P1, Sprint 3 | Publishable comparison |
| GroupLendingPool MVP (3-member, equal-share) | P1, Sprint 2 | Core Contribution 2 |
| Credit Passport SBT (mint + update + read) | P0, Sprint 2 | Most publishable single deliverable |
| zkKYC circuit (one circuit only) | P1, Sprint 3 | Technically impressive |
| Certora 2 invariants | P1, Sprint 3 | Most academically prestigious |
| Foundry fuzz suite | P1, Sprint 3 | Complements Certora |
| ERC-4337 Account Abstraction (pre-KYC bootstrap fixed) | P1, Sprint 2 | Solves inclusion contradiction |
| SavingsVault (simplified) | P1, Sprint 2 | Required for sustainability claim |
| LLM assistant with RAG (Qwen3.5-9B, pre-thesis) | P1, Sprint 2 | AI/ML skillset demonstration |
| LLM QLoRA fine-tuning spec + Sprint 3 plan | Specified | Architecture stays; implementation is Sprint 3 |
| On-chain simulation (50–200 clients, 6 banks) | P0, Sprint 2/3 | Replaces Mesa ABM; generates empirical evidence |

### 7.2 Move to Future Work (Formally Specified, Not Implemented)

| Item | Rationale |
|---|---|
| Federated Learning implementation | Zero test data; too complex; already Phase 2 |
| zkAML second ZKP circuit | zkKYC alone is already ambitious |
| W3C DID/VC anchoring | Compatibility note sufficient; separate tech stack |
| Cross-chain CCIP bridge | Single-chain is sufficient for thesis |
| SyndicatedLoan contract | Not a core contribution; needs real banks to test |
| TranchedPool (Sr/Jr) | Replicates Goldfinch; not core differentiator |
| TreasurySwap | FXModule sufficient; AMM complexity |
| NettingEngine + Settlement Coordinator | Off-chain coordinator adds trust regression |
| Mesa ABM simulation | Replaced by on-chain simulation (Section 5.3) |
| Bangladesh/BRAC-specific implementations | Moved per your instruction (Part 1.3) |
| Bengali language UI | Moved to Future Work per Part 1.3 |

### 7.3 High-Impact, Low-Effort Additions (Add to Sprint Plans)

| Item | Effort | Impact |
|---|---|---|
| Hardhat gas reporter table (actual measured gas) | 2 hrs | Converts theoretical gas claim to empirical evidence |
| Slither static analysis output | 3 hrs | Converts "we plan to use Slither" to "we ran Slither" |
| `solidity-coverage` report | 1 hr | Converts "12 unit tests" to "87% line coverage" |
| Live loan audit trail (The Graph subgraph + React timeline) | 1 day | Best single demo moment for tamper-evident claim |
| Reserve ratio dashboard widget | 3 hrs | Live demo of transparency claim |
| Simulation output manifest (Appendix C) | Bundled | Transaction hashes verifiable on Polygon Amoy |

---

## PART 8 — MINOR AND CONSISTENCY FIXES

These are moderate/minor items from the Panel Defense Analysis. Each takes under 30 minutes.

| Item | Location | Fix |
|---|---|---|
| Use case count inconsistency | Section 3.9.1 | Count actual use cases; unify "29" and "20" to one number |
| DSCR unused in document | List of Abbreviations | Remove or integrate into credit analysis section |
| ABM "empirically grounded" language | Section 4.5 | Change to "Sprint 3 deliverable will produce empirically grounded projection" (or replace with simulation plan) |
| IBLP→InsuranceFund circular Sprint 2 dependency | Sprint 2 backlog | Add explicit implementation sequencing: (1) loan lifecycle, (2) InsuranceFund stub, (3) IBLP |
| File header still says v15 | Line 2 of .tex | Change to `v17` |
| 99.5% SLA claim undefined for blockchain | Section 3.12.2 | Split: API uptime (team-controlled, 99.5%) vs. chain liveness (not team-controlled) |
| MARKET_DATA entity has no defined relationships | Section 3.3.1 | Add: MARKET_DATA is a price cache refreshed by Express.js cron, read-only from contracts |
| PROFILE_SETTING no defined relationships | Section 3.3.1 | Add FK to CLIENT (client_id), attributes: language setting, display currency, notifications |
| Kinked rate has no floor constraints in contract | Section 3.5 | Add `require(r2 >= MINIMUM_JUMP_MULTIPLIER)` and `require(U_star <= MAXIMUM_KINK_POINT)` |
| UpwardDepositFacility bank run gap | Section 3.11.2 | Add NB-level 24h withdrawal rate limit: max 20% of total upward deposit liabilities per day |
| Blockchain fundamentals subsection too long | Section 1.6.1 | Reduce to 150–200 words; move SSTORE analysis to Section 5.4 |
| Three market tables duplicated Ch.1 and Ch.5 | Chapter 1 | Replace Ch.1 copies with one-paragraph summaries + forward reference to Ch.5 |
| Glossary embedded in literature review | Section 2.1 | Move to standalone Glossary section after List of Abbreviations |
| TVL figures without access dates | Chapter 5 | Add "(accessed [date])" to all DefiLlama/CoinGecko citations |
| "Unanimous confirmation" after 75% change | Section 3.11.3 | Replace "unanimous" with "supermajority confirmation (75%-by-capital-share)" |
| Aggregation label for AI_ML_SECURITY_LOG | Section 3.3.2 | Rename row to "Association/Derived Entity" |
| RQ4 unanswerable by current prototype | Section 4.7 | Add scope note: end-to-end four-tier flow awaits Sprint 2 completion |
| Olympus DAO cited as viable funding model | Section 5.9 | Replace or reframe; Olympus DAO lost 99% value in 2022 — cite as cautionary, not model |

---

## PART 9 — RECOMMENDED VERSION-NUMBER CONVENTION

Given the scope of v17 changes, the following naming convention is suggested:

- **v17 Pre-thesis (this cycle):** Implements terminology changes, all 7 Critical fixes, Major fixes, and simulation architecture. LLM section updated to RAG-only for pre-thesis with QLoRA specified for Sprint 3.
- **v18 Final Thesis:** Implements Sprint 2 deliverables (four-tier e2e, SBT, GroupLendingPool MVP, simulation), Sprint 3 deliverables (ML pipeline wired, GNN ablation, Certora, zkKYC), and completes LLM QLoRA fine-tuning evaluation.

Also update the file header comment (Line 2 of `.tex`) to `v17`.

---

## SUMMARY PRIORITY TABLE

| Priority | Item | Effort | Blocks Panel Defense? |
|---|---|---|---|
| P0 | Fix all 7 Critical issues (Part 2) | 1–2 days | Yes |
| P0 | Terminology: borrower→client, lending platform→crypto exchange platform | 2–4 hrs (find/replace + review) | Yes (consistency) |
| P0 | Bangladesh/BRAC implementation claims → Future Work | 2 hrs | Yes (scope honesty) |
| P0 | Update file header to v17 | 5 min | No |
| P1 | Major fixes (Part 3) | 2–3 days | Weakens arguments if missed |
| P1 | Simulation plan (Part 5) | Sprint 2 implementation | Core prototype deliverable |
| P1 | LLM section updates (Part 4) | 1–2 hrs | Fixes model identity conflict |
| P2 | FTX positioning paragraph (Part 6.6) | 1 hr writing | Strong differentiator for panel |
| P2 | High-impact additions (Part 7.3) | 1–3 days total | Very high demo ROI |
| P3 | Minor/consistency fixes (Part 8) | ~4 hrs total | Polish and rigor |

---

*Document prepared May 2026. Cross-references: Pre-thesis_v16.tex, CWB_v16_Panel_Defense_Analysis.md, CWB_v16_Scope_And_Distinction_Report.md, and online research on FTX, DeFi exchange architecture, and proof-of-reserves standards (2025–2026).*

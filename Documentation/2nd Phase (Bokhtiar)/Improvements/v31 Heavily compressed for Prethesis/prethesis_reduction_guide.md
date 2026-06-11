# Pre-Thesis 1 Reduction Guide — Crypto World Bank

> **Your file:** `Pre-thesis_v31_final.tex` (3,995 lines, ~254 KB)
> **Goal:** Meet the minimum requirements exactly, keep all figures/diagrams, replace LLM text with your own voice.

---

## What the requirements actually demand

| Chapter | Required sections |
|---|---|
| Ch. 1 | 1.1 Background · 1.2 Rationale/Motivation · 1.3 Problem Statement · 1.4 Objectives · 1.5 Methodology in Brief · 1.6 Scopes and Challenges |
| Ch. 2 | 2.1 Preliminaries · 2.2 Review of Existing Research · 2.3 Summary of Key Findings |
| Ch. 3 | Technical requirements — show architecture briefly |
| Ch. 4–5 | Feasibility — show slightly, not fully required |

---

## CHAPTER 1 — Introduction (Lines 621–811, ~190 lines)

All required sections already exist. The problem is **four non-required sections** adding ~85 extra lines.

### ✅ Keep exactly as-is (required)
- §1.1 Background (line 635)
- §1.2 Rationale and Motivation (line 648)
- §1.3 Problem Statement (line 653) — including the 6-item list and 4-item DeFi limitation list
- §1.4 Objectives (line 675)
- §1.5 Methodology in Brief (line 776)
- §1.6 Scopes and Challenges (line 780)
- §1.7 Thesis Organization (line 797) — standard, keep it

### ✂️ Sections to merge/compress (not in requirements)

**§1.5 Research Questions (line 688, ~12 lines)**
These are valuable but not required. Options:
- **Best option:** Fold the 5 RQs into the end of §1.4 Objectives as a short paragraph: *"These objectives are tested through five research questions: [list concisely]."*
- Don't delete — just merge so the section heading disappears.

**§1.6 Research Contribution (line 700, ~24 lines)**
Not required, but C1–C4 are important to establish novelty.
- **Best option:** Compress to a single short paragraph of ~5–6 sentences (one sentence per contribution), **remove the \description environment and the long sub-paragraphs**. Keep the last paragraph about "not pitching a bank killer."

**§1.7 Blockchain Justification + subsection (lines 725–740, ~16 lines)**
Not required. The §1.7.1 subsection on EVM/oracles is genuinely useful, but belongs in Background.
- **Best option:** Move the content of §1.7.1 (the 5 bold-paragraph block) to the end of §1.1 Background as a paragraph titled **"Technical foundations."** Delete the §1.7 section heading entirely.

**§1.8 Proposed Solution + 2 subsections (lines 742–775, ~33 lines)**
Not required. But **the two figures here must stay** (system overview figure is already at the chapter start; the cross-tier lending diagram at line 766 is important).
- **Best option:** Compress §1.8 to a single short paragraph that introduces the four-tier model and references the figures. Remove the `\subsection{Banking Functions}` and `\subsection{Cross-Tier Lending}` headers — inline the figure and a 2-sentence caption explanation directly into the main §1.8 paragraph.

### Net result for Chapter 1
After these changes, Ch. 1 drops from ~190 lines to roughly **~120 lines** while all figures and key content remain.

---

## CHAPTER 2 — Literature Review (Lines 812–1166, ~355 lines)

All three required sections exist. The issue is **extra content adding ~180 lines** on top of requirements.

### ✅ Keep exactly as-is (required)
- §2.1 Preliminaries + PRISMA subsection (line 814) — keep the PRISMA flow diagram and Top-10 table; these are very strong
- §2.2 Review of Existing Research + all 8 subsections (line 887) — all subsections are concise and well-structured; keep
- §2.3 Summary of Key Findings (line 1150) — **this is the required 2.3** — keep exactly as-is

### ✂️ Sections to compress or remove

**Literature Review Summary Parts A–F (lines 948–1091, ~144 lines)**
This is 6 separate tables covering ~19 papers. The requirement is already met by §2.3 Summary of Key Findings. These 6 tables are redundant for pre-thesis 1.
- **Best option:** Merge all 6 tables into **1 or 2 combined tables** (just merge rows), which saves ~60–80 lines. Place a note: *"Extended synthesis table available in the thesis repository."*
- Alternatively, move the full 6-table set to an appendix and reference it.

**§2.4 Comparative Protocol Analysis (lines 1092–1149, ~57 lines)**
Not required, but the **11-feature protocol comparison table (tab:protocol-comparison)** is extremely valuable — it visually proves your research gap in one glance.
- **Best option:** Keep the table. Compress the surrounding text (especially the long paragraph at line 1133) from ~30 lines of prose down to ~8 lines. Remove the `§2.4.1 Literature Synthesis` subsection header — fold the 6 design decisions into one short bullet list.

**§2.4.2 Agent Harness Engineering and Production Safety (lines 1145–1149, ~4 lines)**
Only relevant to the optional conversational agent, not the core thesis.
- **Best option:** Delete entirely. The OWASP/Alizadeh citations can be footnoted elsewhere if needed.

### Net result for Chapter 2
After merging the 6-table block and compressing Ch2 extras, the chapter drops from ~355 lines to roughly **~220 lines**.

---

## CHAPTER 3 — System Architecture and Design (Lines 1167–2256, ~1,090 lines)

This is your largest chapter and where the most work is needed. The professor said to "show it slightly." The key rule: **keep every figure and every table that contains data or diagrams. Slash the explanatory prose around them.**

### ✅ Keep completely (core technical requirement)

| Section | Lines | Why keep |
|---|---|---|
| Prototype Scope (§3.1) | 1167–1225 | The status table is the clearest single-page view of what's built vs. planned |
| High-Level Architecture (§3.2) | 1227–1271 | Three figures + contract inventory table — core of the chapter |
| Blockchain Platform Selection (§3.3) | 1273–1332 | Keep the blockchain stack figure; compress the 3-page text to ~1 page |
| Oracle Architecture (§3.3.2) | 1333–1425 | **Keep the oracle figure and the oracle flow description** — this is core novelty (C3) |
| Data Model (§3.5) + Entity Summary | 1426–1588 | Keep the ERD figures and entity table; compress the normalization/constraint prose |
| On-Chain/Off-Chain Partitioning (§3.6) | 1589–1622 | Keep — short section, important for understanding architecture |
| System Modeling (§3.12) + all 5 subsections | 1913–2011 | **Keep every diagram** — use case, activity, DFD, sequence, and four-tier capital flow diagrams are the visual proof of your work |
| Final Specifications & Requirements (§3.17) | 2218–2240 | Keep — useful summary table |

### ✂️ Sections to compress heavily (keep figures, cut prose)

**§3.4 Digital Identity System + ZKP KYC subsection (lines 1628–1663, ~35 lines)**
Keep the compliance/identity stack figure. The long Groth16/Circom/zkAML paragraphs are implementation details for a later phase.
- **Action:** Keep §3.4 intro paragraph (4 lines) and the figure. Cut the ZKP circuit mathematics paragraphs to 3–4 sentences: *"Two cooperating zk-SNARK circuits (KYC and AML, built with Circom 2.0) are specified for Phase IV. The KYC circuit proves credential possession without revealing PII; the AML circuit proves the wallet is not linked to sanctioned addresses. Both must verify before a CLIENT role is activated."*

**§3.5 User Taxonomy and Onboarding Flows (lines 1664–1812, ~148 lines)**
This is the most bloated section in Ch. 3.
- Keep: The 3 user tables (user taxonomy, actor labels, permission matrix) — these are compact and demonstrative.
- **Remove the 4 subsections entirely:** ERC-4337 Account Abstraction (1745), Tiered Risk-Based KYC (1752), Five-Stage Retail Onboarding Funnel (1782), Optional Conversational Interface Add-On (1794). These are Phase III–IV implementation details that are already noted in the MVT checklist.
- **Savings: ~100 lines**

**§3.8 Kinked Interest Rate Model (lines 1806–1829, ~23 lines)**
Keep the kinked-rate figure. Cut the mathematical derivation prose to 4–5 sentences explaining what the three zones mean.

**§3.9 Liquidation Engine (lines 1830–1862, ~32 lines)**
Keep the liquidation diagram. Compress text to ~8 lines: health factor formula + what happens at each threshold.

**§3.12 Multi-Entity and Cross-Tier Capital Operations (lines 1893–1912, ~19 lines)**
Keep the figure. Compress text to ~5 lines summarizing the 5 modules.

**§3.13 Banking Product Suite + subsections (lines 2013–2041, ~28 lines)**
Compress each of the 3 subsections (Savings, Checking, Group Lending) from ~8 lines each to 2–3 sentences each. Keep any product diagram if present.

**§3.14 Governance Framework + 6 subsections (lines 2042–2136, ~94 lines)**
This is the second most bloated section. Each of the 6 subsections is implementation detail that belongs in the final thesis.
- Keep: The governance diagram if present, and the first 2 subsections (Execution Paths and Network Membership) compressed to ~1 paragraph each.
- **Remove or fold in as 1–2 sentences:** Business Network Governance, Technology Infrastructure Governance, Regulatory Compliance Considerations, Asset Tokenization subsections.
- **Savings: ~60 lines**

**§3.15 Five-Layer Security Architecture + §3.16 Threat Model (lines 2137–2217, ~80 lines)**
Keep the defense-in-depth figure. Keep the threat model table. Cut the layer-by-layer prose explanation (which just restates what the figure shows) to ~10 lines.

**§3.18–3.20 Societal, Environmental, Ethical Impact (lines 2241–2256, ~15 lines)**
Not required for pre-thesis 1.
- **Best option:** Compress all three to one short paragraph of ~5 lines or remove entirely, noting they will be addressed in the final thesis.

### Net result for Chapter 3
After these changes, Ch. 3 drops from ~1,090 lines to roughly **~450–500 lines** while keeping every diagram and every table.

---

## CHAPTER 4 — Methodology (Lines 2257–3078, ~821 lines)

The professor said to "show slightly." The chapter has two problems: **the 4 per-task development tables** (DT-I through DT-IV) and **the Datasets/Training workload subsection** — together these account for ~350 lines of granular operational detail that's not needed at pre-thesis 1.

### ✅ Keep completely

| Section | Lines | Why keep |
|---|---|---|
| Chapter intro + Core vs. Optional table | 2257–2281 | Short and sets tone |
| MVT Checklist + 3 tables (§4.1) | 2283–2348 | Critical — proves you know what you need to deliver |
| Development Methodology (§4.2) | 2350–2368 | Keep with the Agile figure |
| Planned AI/ML Support intro + figure (§4.3) | 2370–2388 | Keep the pipeline figure + the 4-step numbered explanation |
| GNN Extension (§4.6) | 2652 | Already brief (5 lines) — keep |
| Federated Learning (§4.7) | 2657 | Already brief (4 lines) — keep |
| Formal Verification (§4.8) | 2662 | Keep |
| Foundry Suite (§4.9) | 2672 | Keep |
| On-Chain Simulation (§4.10) | 2686 | Keep |
| Real-Time Dashboard (§4.11) | 2691 | Keep figure |
| Transaction State Machine (§4.12) | 2703 | Keep figure |
| Evaluation Methodology (§4.14) | 2722 | Keep |
| SDLC Stage Mapping (§4.18) | 2921 | Keep the SDLC table |
| Software Testing Strategy (§4.22) | 3067 | Keep, it's short |

### ✂️ Sections to compress heavily

**§4.3.1 Datasets, Training Workload, Pre-Submission Deliverables (lines 2389–2556, ~167 lines)**
This is the longest single section in Ch. 4. It contains detailed model tuning, feature engineering tables, and benchmark plans — all of which belong in the **final thesis after training is done.**
- **Action:** Keep only: (a) the ML datasets table (tab:ml-datasets), (b) the 3–4 line paragraph introducing what training will involve, and (c) the note that benchmark metrics will be populated after pre-thesis 2.
- **Remove:** The detailed feature engineering tables, the hyperparameter tuning grids, the benchmark format tables with empty cells.
- **Savings: ~130 lines**

**§4.3.2 Explainability and Anomaly Detection (lines 2557–2588, ~31 lines)**
Keep the core explanation (what SHAP waterfall shows, what the Authority Brief contains). The verbatim Authority Brief example at lines 2631–2650 is excellent — keep it. Cut the dense mathematical and operational paragraphs.
- **Savings: ~15 lines**

**§4.4 Optional Conversational Agent (lines 2589–2651, ~62 lines)**
This is a "Could-have" feature. Keep: the 1-paragraph intro, the 6-step loop description. **Remove the full MCP tools table (17 tools)** — or reduce it to a half-size summary table of 5 representative tools with a note pointing to the GitHub repo for the full list.
- **Savings: ~35 lines**

**§4.15 Implementation Phase Plan — 4 task tables (lines 2740–2919, ~179 lines)**
The per-task registers (DT-I.01 through DT-IV.08) are extremely granular project management detail. They are useful for *your* planning but not for demonstrating research to an examiner.
- **Action:** Keep ONLY: (a) the high-level 4-row phase summary table (lines 2876–2889), (b) the phase roadmap figure (fig-phase-roadmap), (c) the development toolchain figure (fig-dev-toolchain), (d) the effort bar chart figure (fig-phase-effort).
- **Remove the 4 detailed task-register tables** (Phase I, II, III, IV per-task tables). You can note: *"Detailed task registers are maintained in the project repository."*
- **Savings: ~140 lines**

**§4.17 Design Decisions and Alternatives (lines 2947–3031, ~84 lines)**
This section is detailed tech-choice justification. Good content but very long.
- **Action:** Keep the main design decisions table (tab:design-decisions). Compress the surrounding prose from ~40 lines to ~10 lines. The §4.17.1 Justification of Selected Technologies subsection can be folded directly into the table as an extra column if needed.
- **Savings: ~50 lines**

**§4.19 Design Patterns (lines 3032–3066, ~34 lines)**
Useful but verbose.
- **Action:** Keep the design patterns table. Cut surrounding prose to ~5 lines.
- **Savings: ~20 lines**

### Net result for Chapter 4
After these changes, Ch. 4 drops from ~821 lines to roughly **~380–420 lines**.

---

## CHAPTER 5 — Evaluation and Discussion (Lines 3079–3367, ~288 lines)

This chapter is already fairly tight. The professor said to "show it slightly" — it can mostly stay, with one section compressed.

### ✅ Keep as-is
- §5.1 Performance Evaluation (3081) — already just 1 short paragraph
- §5.2 Analysis of Design Solutions (3088) — already just 1 short paragraph
- §5.3 Final Design Adjustment (3093) — already just 1 short paragraph
- §5.4 Feasibility Analysis + 4 subsections (3098–3194) — **keep all four feasibility tables**; this is exactly what pre-thesis 5 requires
- §5.6 Discussion (3349) — already brief and important

### ✂️ Compress slightly

**§5.5 Statistical Analysis (lines 3195–3271, ~76 lines)**
The three tables (revenue assumptions, ETH sensitivity, default scenarios) and two figures are valuable planning content — keep them. The surrounding prose is minimal already.
- **Action:** Just make sure the introductory paragraph clearly labels these as *planning projections, not observed data.* (It already does this — mostly fine.)

**§5.6 Comparisons and Relationships (lines 3272–3348, ~76 lines)**
Contains 4 tables: market sizing, customer segment, partner categories, and competitive features. The **competitive features table (tab:competitor-detailed, lines 3332–3347) is a near-duplicate of the protocol comparison table already in Ch. 2 (tab:protocol-comparison).**
- **Action:** Remove tab:competitor-detailed from Ch. 5 (it duplicates Ch. 2). Keep the 3 other tables (market segments, customer profiles, partner roles) as they're new information. 
- **Savings: ~20 lines**

### Net result for Chapter 5
Minimal change — chapter stays at roughly **~265 lines** after removing the duplicate table.

---

## CHAPTER 6 — Conclusion (Lines 3368–3421, ~53 lines)

**Keep entirely as-is.** Already concise, well-structured, and directly addresses your four contributions. This is one of the strongest chapters in the document.

---

## APPENDICES

### ✅ Keep
- **Appendix A: Database Schema Reference** (line 3424) — The schema tables are the physical proof of your data model design. Keep, but you can remove the Functional Dependencies section (§A.2) which is academic detail that can be a GitHub note.
- **Appendix C: Technology Stack** (line 3550) — Short and useful
- **Appendix D: Smart Contract Capabilities** (line 3589) — Keep, short
- **Appendix E: Internal Industry Research Notes** (line 3731) — Keep

### ✂️ Compress or remove
- **Appendix B: Optional Agent Harness Reference** (line 3520) — This is detailed operational spec for a "Could-have" feature. Remove from the document; add a note: *"Agent harness specification available in the project GitHub repository."*
- **Appendix C: Planned Testnet Deployment Manifest** (line 3611) — If it contains mostly placeholder data (TBD addresses), move it to GitHub and note the location.

---

## Summary of changes by chapter

| | Current (lines) | After reduction (est.) | Main cuts |
|---|---|---|---|
| **Ch. 1** | ~190 | ~120 | Merge RQs into Objectives; compress Contribution to 1 para; fold Blockchain Justification into Background; compress Proposed Solution |
| **Ch. 2** | ~355 | ~220 | Merge 6-part summary table to 1–2; compress Comparative Protocol text; remove Agent Harness subsection |
| **Ch. 3** | ~1,090 | ~450–500 | Remove 4 User Taxonomy subsections; compress Governance (~60 lines saved); compress Security prose; compress Digital Identity details |
| **Ch. 4** | ~821 | ~380–420 | Remove 4 per-task phase tables; remove Datasets training details; compress Agent section |
| **Ch. 5** | ~288 | ~265 | Remove duplicate competitor table |
| **Ch. 6** | ~53 | ~53 | No change |
| **Appendices** | ~574 | ~420 | Remove Agent Harness appendix; remove Deployment Manifest placeholders |
| **TOTAL** | **~3,371** | **~1,908–1,998** | **Approx. 40–43% reduction** |

---

## Practical approach: how to work through this

1. **Start with Ch. 3 — User Taxonomy subsections** (lines 1745–1812). These 4 subsections alone are ~68 lines. Delete them first — it's the cleanest cut and gives you the most immediate relief.

2. **Then Ch. 4 — Remove the 4 phase task tables** (DT-I through DT-IV, lines ~2743–2874). Replace with one sentence: *"Detailed task registers (DT-I.01 through DT-IV.08) are maintained in the project repository."* Keep the summary table and roadmap figure.

3. **Then Ch. 3 — Governance section** (lines 2042–2136). Keep the first 2 subsections brief, remove the last 4 subsections' detailed text.

4. **Then Ch. 4 — Datasets subsection** (lines 2389–2556). Keep the ML datasets table + 2 paragraphs. Delete the hyperparameter tables.

5. **Then Ch. 2 — Merge the 6 summary tables** into a single combined table.

6. **Finally, rewrite all remaining prose in your own voice**, starting from the sections that were kept. The figures and tables are yours — the text around them is what needs to be replaced with your own explanations.

---

## A note on the text replacement goal

When you rewrite, aim to be **descriptive rather than generative** — explain what *you* designed and *why you made that choice*, not what blockchain/DeFi is in general. For example:

> ❌ LLM-style: *"Blockchain technology offers immutable, tamper-evident ledgers with programmable smart contracts that enable trustless execution of financial operations without relying on centralized intermediaries."*

> ✅ Your voice: *"I chose Polygon zkEVM because the gas fees on mainnet Ethereum make micro-loans economically unviable — a 10 USDC loan can't carry a $3 transaction fee. Cardona testnet gives me L1 security with L2 cost."*

Your diagrams and tables are already good. The text just needs to sound like you explaining your own project.

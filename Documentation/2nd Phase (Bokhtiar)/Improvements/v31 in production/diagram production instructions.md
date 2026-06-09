# Diagram Production Instructions — Pre-thesis v31

**Source thesis:** `Documentation/2nd Phase (Bokhtiar)/Improvements/v30 in development/Pre-thesis_v30_final.tex`  
**Output folder:** `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/`  
**Total figures:** 56 PNG files (one per numbered figure; Figure 5.2 produces two PNGs)  
**Generation rule:** Every figure is a **direct academically professional image** in one pass — never graph/code first, then convert to diagram.

---

## 1. Global instructions (prepend to every prompt)

### 1.0 Generation method — direct image only (critical)

**Generate the finished figure in one step as an academically professional image.** Do not use a graph-first or code-first workflow.

| DO | DO NOT |
|----|--------|
| Generate **one final PNG/image directly** from the prompt | Build in Mermaid, Graphviz, PlantUML, draw.io, Lucidchart, or Figma first |
| Produce a **single-pass** formal thesis / journal-quality figure | Render a chart or graph, then restyle or trace it into a diagram |
| Output **publication-ready academic professionalism** — like IEEE, ACM, or university thesis figures | Output casual infographics, cartoonish icons, or sketchy hand-drawn doodles |
| Use **image generation** or **illustration mode** in the AI tool | Use "diagram code", "SVG export", or "convert this mermaid to image" pipelines |

If the tool offers both **Image** and **Diagram/Chart** modes, always choose **Image / Illustration**. Content must be accurate and readable; style must be **formal, clean, and examiner-appropriate**.

### 1.1 Visual style — academically professional (mandatory)

The figure must look **formal, precise, and thesis-appropriate** — the standard expected in engineering / computer-science dissertations and peer-reviewed supplementary figures. Professional does **not** mean sterile CAD; it means **controlled, consistent, and examiner-ready**.

| Element | Specification |
|---------|---------------|
| **Overall feel** | Clean academic technical figure; balanced whitespace; **aligned, grid-respecting layout**; consistent box sizes within groups |
| **Background** | Pure white `#FFFFFF` or thesis off-white `#FAFAFA` — **no** paper grain, texture, or decorative backdrop |
| **Lines & borders** | Crisp black or dark grey `#1F1F1F`, uniform stroke weight (1–1.5 px); professionally drawn, not sketchy |
| **Grey fills** | Flat academic greys `#F2F2F2`, `#E2E2E2`, `#FAFAFA`, `#F6F6F6` — no gradients, gloss, or 3D bevel |
| **Accent fills** | Restrained light-blue-white `#F4F8FB` and light-green-white `#F4FAF6` — **one accent per logical group maximum** |
| **Optional / dashed** | Formal dashed lines for optional paths (agent add-on, async flows) — even dash pattern, not hand-sketched |
| **Typography** | Professional sans-serif (Helvetica, Arial, Inter, or Times-compatible labels where appropriate); **all text horizontal and legible**; 9–11 pt equivalent at print scale |
| **Arrows & connectors** | Clear directional arrows; orthogonal or smooth professional curves; **no ambiguous crossing lines**; arrowheads consistent |
| **Shadows / depth** | **Flat design preferred** — no drop shadows, no glassmorphism, no skeuomorphic UI chrome |
| **Icons / actors** | Minimal flat UML-style actor glyphs or simple geometric symbols — **no** cartoon characters, clipart, or photorealistic people |

### 1.2 What NOT to include in the image

- **No figure number** (e.g. "Figure 3.5") — caption lives in LaTeX only  
- **No caption text** — no thesis title bar or long descriptive subtitle in the image  
- **No logos of any kind** — no company, protocol, university, or brand marks (e.g. no Chainlink, Ethereum, React, Polygon, MetaMask, or institutional logos); use text labels only  
- **No watermark** or decorative frame  
- **No saturated colours** — stay monochrome + subtle blue/green tints only  
- **No photorealistic scenes** — no stock-photo people, offices, or 3D cityscapes  
- **No obvious auto-diagram artifacts** — no Mermaid default shapes, no chart-library default themes, no visible grid paper

### 1.3 A4 footprint tiers (portrait A4 = 210 mm × 297 mm)

| Tier | Footprint | Canvas @ 300 DPI (landscape-friendly) | LaTeX macro equivalent |
|------|-----------|--------------------------------------|------------------------|
| **Small** | ¼ page | **2480 × 900 px** (or 210 mm × 75 mm) | `HalfWidthDiagram`, `CompactDiagram` |
| **Medium** | ⅓ page | **2480 × 1180 px** (210 mm × 100 mm) | Compact vertical flows |
| **Detailed** | ½ page | **2480 × 1750 px** (210 mm × 148 mm) | `BalancedDiagram` |
| **Very large** | ~1 full page | **3508 × 2480 px** landscape or **2480 × 3508 px** portrait | `OnePageDiagram`, dense ERD/DFD/use-case |

Export as **PNG**, **300 DPI**, sRGB, no transparency (white background).

### 1.4 Filename convention

```
Ch{chapter}_Fig{chapter}_{number}_{short-purpose}.png
```

- Use underscore between chapter and sub-number: `Ch4_Fig4_7_sdlc-stage-mapping.png`  
- Lowercase kebab-case for `short-purpose`  
- Appendix C: `ChC_FigC_1_local-llm-compact.png`  
- Save every file to: **`Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/`**

### 1.5 Prompt philosophy — context not code

Each figure prompt below gives **raw contextual information only** — what the figure is about, what concepts and relationships matter, and what the examiner should understand. Prompts deliberately avoid:

- Diagram syntax, markup, or code
- Hex colours, pixel dimensions, or stroke specifications inside prompts
- Step-by-step layout commands or rigid section labels

Let the model choose layout, shapes and visual structure creatively while staying academically professional. Metadata tables above each prompt still hold filename, size tier and LaTeX label for your reference.

### 1.6 How to use this document

1. Copy the **COPY-PASTE PROMPT** for one figure — each block is self-contained narrative context.  
2. Choose **image / illustration** mode — not diagram code or chart builder.  
3. Let the model design the visual layout; you only need the content to be accurate.  
4. Save with the exact filename shown at the end of each prompt.  
5. Figures not listed (e.g. removed fig-banking-modules) are intentionally excluded from v30.

---

## 2. Figure index

| Fig | Label | Filename | Tier |
|-----|-------|----------|------|
| 1.1 | `fig:intro-system-overview` | `Ch1_Fig1_1_intro-system-overview.png` | Detailed |
| 1.2 | `fig:banking-functions` | `Ch1_Fig1_2_six-banking-functions.png` | Detailed |
| 1.3 | `fig:cross-tier-lending` | `Ch1_Fig1_3_cross-tier-lending-flows.png` | Detailed |
| 2.1 | `fig:prisma-flow` | `Ch2_Fig2_1_prisma-literature-screening.png` | Medium |
| 3.1 | `fig:three-layer-arch` | `Ch3_Fig3_1_four-layer-application-architecture.png` | Detailed |
| 3.2 | `fig:component-diagram` | `Ch3_Fig3_2_component-architecture-planning.png` | Detailed |
| 3.3 | `fig:blockchain-stack` | `Ch3_Fig3_3_blockchain-application-stack.png` | Detailed |
| 3.4 | `fig:oracle-architecture` | `Ch3_Fig3_4_chainlink-oracle-architecture.png` | Detailed |
| 3.5 | `fig:core-system-graph` | `Ch3_Fig3_5_core-erd-lending-governance.png` | Very large |
| 3.6 | `fig:erd-extended` | `Ch3_Fig3_6_extended-erd-banking-products.png` | Very large |
| 3.7 | `fig:eer` | `Ch3_Fig3_7_eer-model-specialization-aggregation.png` | Very large |
| 3.8 | `fig:data-partitioning` | `Ch3_Fig3_8_onchain-offchain-data-partitioning.png` | Detailed |
| 3.9 | `fig:compliance-identity` | `Ch3_Fig3_9_compliance-identity-stack.png` | Detailed |
| 3.10 | `fig:permission-matrix` | `Ch3_Fig3_10_actor-permission-matrix.png` | Small |
| 3.11 | `fig:tier-model` | `Ch3_Fig3_11_client-limits-bank-syndication.png` | Detailed |
| 3.12 | `fig:five-stage-funnel` | `Ch3_Fig3_12_five-stage-retail-funnel.png` | Detailed |
| 3.13 | `fig:agent-six-step-pipeline` | `Ch3_Fig3_13_optional-agent-six-step-pipeline.png` | Detailed |
| 3.14 | `fig:kinked-rate-curve` | `Ch3_Fig3_14_kinked-utilization-rate-curve.png` | Small |
| 3.15 | `fig:liquidation-engine` | `Ch3_Fig3_15_liquidation-engine-lifecycle.png` | Small |
| 3.16 | `fig:savings-vault` | `Ch3_Fig3_16_savings-vault-fixed-deposit-loop.png` | Small |
| 3.17 | `fig:credit-passport` | `Ch3_Fig3_17_credit-passport-sbt-lifecycle.png` | Small |
| 3.18 | `fig:ccip-bridge` | `Ch3_Fig3_18_chainlink-ccip-cross-chain.png` | Detailed |
| 3.19 | `fig:multi-entity-ops` | `Ch3_Fig3_19_multi-entity-cross-tier-operations.png` | Detailed |
| 3.20 | `fig:usecase` | `Ch3_Fig3_20_usecase-nine-actor-taxonomy.png` | Very large |
| 3.21 | `fig:act-lending` | `Ch3_Fig3_21_usdc-loan-lifecycle-activity.png` | Detailed |
| 3.22 | `fig:act-onboarding` | `Ch3_Fig3_22_retail-onboarding-identity-activity.png` | Detailed |
| 3.23 | `fig:act-aux` | `Ch3_Fig3_23_client-banking-session-activity.png` | Detailed |
| 3.24 | `fig:dfd-suite` | `Ch3_Fig3_24_data-flow-diagrams-context-level1.png` | Very large |
| 3.25 | `fig:seq-loan-flow` | `Ch3_Fig3_25_loan-approval-sequence.png` | Detailed |
| 3.26 | `fig:seq-installment-income` | `Ch3_Fig3_26_installment-income-sequence.png` | Detailed |
| 3.27 | `fig:seq-banking-data` | `Ch3_Fig3_27_hierarchical-market-borrowlimit-sequence.png` | Detailed |
| 3.28 | `fig:seq-chat-bot` | `Ch3_Fig3_28_bank-chat-optional-agent-sequence.png` | Detailed |
| 3.29 | `fig:four-tier` | `Ch3_Fig3_29_four-tier-hierarchical-capital-flow.png` | Detailed |
| 3.30 | `fig:group-lending-lifecycle` | `Ch3_Fig3_30_solidarity-group-lending-lifecycle.png` | Very large |
| 3.31 | `fig:governance-dual-path` | `Ch3_Fig3_31_governance-dual-path-timelock.png` | Medium |
| 3.32 | `fig:sar-aml-workflow` | `Ch3_Fig3_32_sar-aml-compliance-workflow.png` | Medium |
| 3.33 | `fig:defense-in-depth` | `Ch3_Fig3_33_five-layer-defense-in-depth.png` | Very large |
| 3.34 | `fig:security-controls` | `Ch3_Fig3_34_smart-contract-security-controls.png` | Detailed |
| 4.1 | `fig:agile-process` | `Ch4_Fig4_1_agile-scrum-sprint-cycle.png` | Medium |
| 4.2 | `fig:aiml-pipeline` | `Ch4_Fig4_2_aiml-pipeline-training-oracle.png` | Detailed |
| 4.3 | `fig:ml-eval` | `Ch4_Fig4_3_ml-evaluation-explainability-benchmarks.png` | Detailed |
| 4.4 | `fig:ml-explainability` | `Ch4_Fig4_4_ml-explainability-anomaly-flow.png` | Detailed |
| 4.5 | `fig:realtime-dashboard` | `Ch4_Fig4_5_realtime-dashboard-monitoring.png` | Detailed |
| 4.6 | `fig:tx-state-machine` | `Ch4_Fig4_6_transaction-state-machine-loan.png` | Detailed |
| 4.7 | `fig:sdlc-mapping` | `Ch4_Fig4_7_sdlc-agile-stage-mapping.png` | Detailed |
| 4.8 | `fig:phase-roadmap` | `Ch4_Fig4_8_four-phase-implementation-roadmap.png` | Very large |
| 4.9 | `fig:phase-effort` | `Ch4_Fig4_9_development-effort-by-phase.png` | Small |
| 4.10 | `fig:optional-agent-addon` | `Ch4_Fig4_10_optional-conversational-agent-compact.png` | Small |
| 4.11 | `fig:dev-toolchain` | `Ch4_Fig4_11_development-verification-toolchain.png` | Detailed |
| 4.12 | `fig:design-decisions` | `Ch4_Fig4_12_key-design-decisions-alternatives.png` | Detailed |
| 5.1 | `fig:revenue-by-tier` | `Ch5_Fig5_1_annual-revenue-by-tier.png` | Small |
| 5.2 (pie A) | `fig:revenue-mix-pie` | `Ch5_Fig5_2_revenue-mix-pie-chart.png` | Small |
| 5.2 (pie B) | `fig:market-tam-pie` | `Ch5_Fig5_2_market-sizing-funnel-pie.png` | Small |
| 5.3 | `fig:apr-spread` | `Ch5_Fig5_3_hierarchical-apr-spread.png` | Small |
| C.1 | `fig:local-llm-mermaid` | `ChC_FigC_1_local-llm-compact-request-path.png` | Medium |
| C.2 | `fig:local-llm-tikz` | `ChC_FigC_2_local-llm-expanded-data-flow.png` | Very large |

---

## 3. Per-figure prompts (copy each block separately)

---

## Figure 1.1 — Crypto World Bank — Whole-System Overview

| Field | Value |
|-------|-------|
| **Figure number** | 1.1 |
| **LaTeX label** | `fig:intro-system-overview` |
| **Source** | `fig-intro-system-overview.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch1_Fig1_1_intro-system-overview.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch1_Fig1_1_intro-system-overview.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

This is the opening overview figure for a Crypto World Bank thesis. Show the whole system at a glance: the four-tier banking hierarchy flows from World Bank Reserve down through National Bank and Local Bank to the Retail Client. Below or connected to that, show the technology stack the platform runs on — presentation layer with React and account abstraction, off-chain services with Express, PostgreSQL and machine learning, smart contracts in Solidity with role-based access, and infrastructure including Chainlink, Polygon zkEVM and Sepolia testnet. The reader should instantly understand that this is a hierarchical decentralised bank with a full-stack implementation.

Save the image as: Ch1_Fig1_1_intro-system-overview.png
```

---

## Figure 1.2 — Six Banking Functions

| Field | Value |
|-------|-------|
| **Figure number** | 1.2 |
| **LaTeX label** | `fig:banking-functions` |
| **Source** | `fig-banking-functions.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch1_Fig1_2_six-banking-functions.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch1_Fig1_2_six-banking-functions.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Show the six core banking functions that the Crypto World Bank platform delivers, and how they feed into a four-tier banking core. The six functions are deposits, credit, settlement, risk management, liquidity, and ancillary services. Arrange them so the reader sees they are interconnected capabilities that together form a complete banking system, not isolated features.

Save the image as: Ch1_Fig1_2_six-banking-functions.png
```

---

## Figure 1.3 — Cross-Tier Capital Flows

| Field | Value |
|-------|-------|
| **Figure number** | 1.3 |
| **LaTeX label** | `fig:cross-tier-lending` |
| **Source** | `fig-cross-tier-lending.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch1_Fig1_3_cross-tier-lending-flows.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch1_Fig1_3_cross-tier-lending-flows.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Illustrate how capital moves across the four tiers of the Crypto World Bank. Downward flow allocates capital from higher tiers to lower tiers. Upward flows use the Upward Deposit Facility when local or national banks have surplus. At tiers two and three, the InterBank Lending Pool enables same-tier lending between institutions. Make the multi-directional nature of institutional capital clear — this is not a flat DeFi pool but a hierarchical treasury network.

Save the image as: Ch1_Fig1_3_cross-tier-lending-flows.png
```

---

## Figure 2.1 — PRISMA-style Literature Screening Flow

| Field | Value |
|-------|-------|
| **Figure number** | 2.1 |
| **LaTeX label** | `fig:prisma-flow` |
| **Source** | `Inline TikZ in Pre-thesis_v30_final.tex` |
| **Size tier** | **Medium** |
| **Output filename** | `Ch2_Fig2_1_prisma-literature-screening.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch2_Fig2_1_prisma-literature-screening.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a medium figure — about one third of an A4 page.

A PRISMA-style literature screening flow for the thesis evidence base. Starting records identified from six databases, then duplicates removed, title and abstract screening with exclusions, full-text assessment with further exclusions, ending with the final included synthesis count. This is a formal academic screening funnel showing how 892 records narrow down through 614 unique, 126 full-text assessed, to 131 bibliography entries. Keep it clean and examiner-familiar.

Save the image as: Ch2_Fig2_1_prisma-literature-screening.png
```

---

## Figure 3.1 — Four-Layer Decentralised Application Architecture

| Field | Value |
|-------|-------|
| **Figure number** | 3.1 |
| **LaTeX label** | `fig:three-layer-arch` |
| **Source** | `fig-three-layer-arch.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_1_four-layer-application-architecture.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_1_four-layer-application-architecture.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

The four-layer decentralised application architecture of Crypto World Bank in planning phase. Top layer is presentation — React, wallet connectivity, dashboard and admin interfaces. Smart contract layer holds World Bank Reserve, National and Local Bank contracts. Services layer has Express API, PostgreSQL, FastAPI machine learning, and optional agent UI. Chainlink infrastructure provides oracle functions, price feeds, proof of reserve and cross-chain bridging. Show how layers depend on each other vertically.

Save the image as: Ch3_Fig3_1_four-layer-application-architecture.png
```

---

## Figure 3.2 — Component Architecture (Specified — Planning Phase)

| Field | Value |
|-------|-------|
| **Figure number** | 3.2 |
| **LaTeX label** | `fig:component-diagram` |
| **Source** | `fig-component-architecture.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_2_component-architecture-planning.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_2_component-architecture-planning.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Component architecture diagram for the planning phase. Show how the React SPA and ERC-4337 smart accounts talk to the Express REST API, which connects to PostgreSQL, Redis, FastAPI ML service, and optional LLM assistant. The API also reaches smart contracts — core tier contracts, banking product modules, and multi-entity operations. External systems include Chainlink Functions, CCIP bridge, IPFS for documents, and zkKYC identity provider. Show the main integration paths between client, backend, contracts and externals.

Save the image as: Ch3_Fig3_2_component-architecture-planning.png
```

---

## Figure 3.3 — Blockchain and Application Stack

| Field | Value |
|-------|-------|
| **Figure number** | 3.3 |
| **LaTeX label** | `fig:blockchain-stack` |
| **Source** | `fig-blockchain-stack.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_3_blockchain-application-stack.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_3_blockchain-application-stack.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Layered blockchain and application stack from settlement network up to presentation. Bottom is L1 settlement on Polygon for retail and Ethereum Sepolia for institutional, with Chainlink CCIP, The Graph and monitoring. Above that smart contract platform with Solidity, OpenZeppelin, upgradeable proxies, timelock and RBAC. Data layer with PostgreSQL, Redis and IPFS. API and services with Express, FastAPI, WebSocket and authentication. Top is React frontend with wallet and account abstraction. Classic stacked architecture figure.

Save the image as: Ch3_Fig3_3_blockchain-application-stack.png
```

---

## Figure 3.4 — Chainlink Oracle Architecture

| Field | Value |
|-------|-------|
| **Figure number** | 3.4 |
| **LaTeX label** | `fig:oracle-architecture` |
| **Source** | `fig-oracle-architecture.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_4_chainlink-oracle-architecture.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_4_chainlink-oracle-architecture.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Chainlink oracle architecture connecting off-chain AI scoring to on-chain loan decisions. Off-chain side does feature engineering, random forest and isolation forest models, SHAP explainability producing an Authority Brief. Chainlink Functions DON with multi-node consensus receives the score. On-chain contracts include loan controller with commit-reveal pattern, local bank pool gating on score revealed, price feeds, automation and proof of reserve. Show trust boundary crossing from ML service to blockchain.

Save the image as: Ch3_Fig3_4_chainlink-oracle-architecture.png
```

---

## Figure 3.5 — Core ERD — Lending, Governance, and Agent Session Entities

| Field | Value |
|-------|-------|
| **Figure number** | 3.5 |
| **LaTeX label** | `fig:core-system-graph` |
| **Source** | `fig-erd-core.mmd` |
| **Size tier** | **Very large** |
| **Output filename** | `Ch3_Fig3_5_core-erd-lending-governance.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_5_core-erd-lending-governance.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a large detailed figure — nearly a full A4 page; ensure all labels remain readable.

Core entity-relationship view of the lending and governance data model. World Bank registers National Banks which register Local Banks. Local Banks employ bank users and onboard borrowers. Borrowers submit loan requests approved by bank users, producing loans with installment schedules settled by transactions. Borrowers also have income proofs, chat messages, credit passport soulbound token, sessions and agent action logs. Loans link to AI ML scoring logs and collateral assets. This is the hub schema for the whole platform — make entities and relationships readable.

Save the image as: Ch3_Fig3_5_core-erd-lending-governance.png
```

---

## Figure 3.6 — Extended ERD — Banking Products and Multi-Entity Operations

| Field | Value |
|-------|-------|
| **Figure number** | 3.6 |
| **LaTeX label** | `fig:erd-extended` |
| **Source** | `fig-erd-extended.mmd` |
| **Size tier** | **Very large** |
| **Output filename** | `Ch3_Fig3_6_extended-erd-banking-products.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_6_extended-erd-banking-products.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a large detailed figure — nearly a full A4 page; ensure all labels remain readable.

Extended entity-relationship view covering banking products and multi-entity operations. Borrowers own savings accounts, fixed deposits and current accounts. Local banks host loan groups with group members. Insurance fund maintained per local bank. Interbank loans, upward deposits, syndicated loans with members, tranched pools, treasury swaps, and netting batches with entries. Show how retail products and institutional capital operations extend the core schema.

Save the image as: Ch3_Fig3_6_extended-erd-banking-products.png
```

---

## Figure 3.7 — EER Model — Generalization, Specialization, Weak Entities, Aggregation

| Field | Value |
|-------|-------|
| **Figure number** | 3.7 |
| **LaTeX label** | `fig:eer` |
| **Source** | `fig-eer-model.mmd` |
| **Size tier** | **Very large** |
| **Output filename** | `Ch3_Fig3_7_eer-model-specialization-aggregation.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_7_eer-model-specialization-aggregation.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a large detailed figure — nearly a full A4 page; ensure all labels remain readable.

Enhanced entity-relationship concepts beyond basic ERD. Show BANK_USER specialization into National Bank Admin, Local Bank Admin and Approver with total disjoint constraint. LOAN with weak entity INSTALLMENT identified by loan. BORROWER with multi-valued income proofs. Loan-centric aggregation cluster linking borrower, loan request, approval, loan and AI ML log. Participation constraints showing loan request maps one-to-one to loan and borrower optionally holds credit passport SBT. Academic database design figure.

Save the image as: Ch3_Fig3_7_eer-model-specialization-aggregation.png
```

---

## Figure 3.8 — On-Chain vs Off-Chain Data Partitioning

| Field | Value |
|-------|-------|
| **Figure number** | 3.8 |
| **LaTeX label** | `fig:data-partitioning` |
| **Source** | `fig-data-partitioning.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_8_onchain-offchain-data-partitioning.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_8_onchain-offchain-data-partitioning.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

How data is partitioned between on-chain and off-chain storage. On-chain holds reserve balances, loan state, RBAC roles and soulbound tokens. Off-chain holds KYC documents, ML logs and chat history, session cache. Hybrid pattern where computation happens off-chain but limits and rules enforce on-chain. Simple clear three-way comparison the examiner can reference.

Save the image as: Ch3_Fig3_8_onchain-offchain-data-partitioning.png
```

---

## Figure 3.9 — Compliance and Identity Stack

| Field | Value |
|-------|-------|
| **Figure number** | 3.9 |
| **LaTeX label** | `fig:compliance-identity` |
| **Source** | `fig-compliance-identity.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_9_compliance-identity-stack.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_9_compliance-identity-stack.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Compliance and identity stack for retail clients. Identity proofs from zkKYC licensed provider, zkAML sanction screening, W3C verifiable credentials and decentralised identifiers. Tiered KYC ladder from browse-only L0 through basic L1, standard L2 to full K3. Account abstraction with ERC-4337 smart accounts, paymaster sponsored gas and EIP-7702 session keys for controlled signing.

Save the image as: Ch3_Fig3_9_compliance-identity-stack.png
```

---

## Figure 3.10 — Actor Permission Matrix (Primary Actions)

| Field | Value |
|-------|-------|
| **Figure number** | 3.10 |
| **LaTeX label** | `fig:permission-matrix` |
| **Source** | `fig-permission-matrix.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch3_Fig3_10_actor-permission-matrix.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_10_actor-permission-matrix.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Permission matrix showing which actor types can perform which primary actions. Actors: retail client, local bank approver, national bank admin, world bank governance, and optional AI agent. Actions include viewing loan status, submitting loans and paying installments, approving or rejecting loans, setting rates and reserve ratios, freezing accounts and SAR triggers, and agent write tools. Show grants and denials clearly in a compact grid.

Save the image as: Ch3_Fig3_10_actor-permission-matrix.png
```

---

## Figure 3.11 — Client Entry, KYC Limits, and Bank-Level Syndication

| Field | Value |
|-------|-------|
| **Figure number** | 3.11 |
| **LaTeX label** | `fig:tier-model` |
| **Source** | `fig-tier-model.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_11_client-limits-bank-syndication.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_11_client-limits-bank-syndication.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Client entry model and bank-level syndication. All end clients enter only through their local bank at tier four. Risk-based KYC ladder sets borrowing caps at each level. Credit passport tiers from bronze through diamond reflect repayment history. On-chain enforcement ties KYC level and open loan caps to limits. Large exposures at bank tier use syndicated loans with lead arranger and co-lenders.

Save the image as: Ch3_Fig3_11_client-limits-bank-syndication.png
```

---

## Figure 3.12 — Five-Stage Retail Conversion Funnel

| Field | Value |
|-------|-------|
| **Figure number** | 3.12 |
| **LaTeX label** | `fig:five-stage-funnel` |
| **Source** | `fig-five-stage-funnel.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_12_five-stage-retail-funnel.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_12_five-stage-retail-funnel.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Five-stage retail conversion funnel. Stage one browse products with zero friction no wallet. Stage two email or phone signup creating ERC-4337 account. Stage three KYC capture in minutes. Stage four first USDC loan with plain language terms. Stage five power user with MetaMask, explorer and group lending. Side notes that crypto is hidden from UI, paymaster sponsors gas, fiat shown via Chainlink oracle.

Save the image as: Ch3_Fig3_12_five-stage-retail-funnel.png
```

---

## Figure 3.13 — Optional AI Agent Add-On — Six-Step Pipeline

| Field | Value |
|-------|-------|
| **Figure number** | 3.13 |
| **LaTeX label** | `fig:agent-six-step-pipeline` |
| **Source** | `fig-agent-six-step-pipeline.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_13_optional-agent-six-step-pipeline.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_13_optional-agent-six-step-pipeline.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Optional AI agent six-step pipeline for Phase III-IV, explicitly not part of minimum viable thesis. Context assembly from SSE message, inject on-chain JSON, branch between read path with RAG answer versus write path assembling parameters, confirmation gate, MCP write with signature, audit log entry. Mark as optional add-on excluded from MVT scope.

Save the image as: Ch3_Fig3_13_optional-agent-six-step-pipeline.png
```

---

## Figure 3.14 — Kinked Utilization-Based Interest Rate Model

| Field | Value |
|-------|-------|
| **Figure number** | 3.14 |
| **LaTeX label** | `fig:kinked-rate-curve` |
| **Source** | `fig-kinked-rate-curve.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch3_Fig3_14_kinked-utilization-rate-curve.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_14_kinked-utilization-rate-curve.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Kinked utilization-based borrowing interest rate curve. Gentle slope below eighty percent utilization, steep rise above the kink as pool utilization increases. Classic DeFi money-market curve adapted for hierarchical banking. Show utilization on horizontal axis and borrowing rate on vertical axis with clear kink point.

Save the image as: Ch3_Fig3_14_kinked-utilization-rate-curve.png
```

---

## Figure 3.15 — LiquidationEngine — Tier-Specific Health Factor

| Field | Value |
|-------|-------|
| **Figure number** | 3.15 |
| **LaTeX label** | `fig:liquidation-engine` |
| **Source** | `fig-liquidation-engine.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch3_Fig3_15_liquidation-engine-lifecycle.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_15_liquidation-engine-lifecycle.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Liquidation engine with tier-specific health factor models. Retail individual loans, group pool loans, credit-based loans with SBT downgrade only, and institutional tier one to three models each differ. Lifecycle: price feed updates health factor each block, liquidation triggered below threshold with caller bonus, event indexed, hierarchical queue if portfolio reserve ratio falls below fifteen percent.

Save the image as: Ch3_Fig3_15_liquidation-engine-lifecycle.png
```

---

## Figure 3.16 — SavingsVault and FixedDeposit — Closed Loop

| Field | Value |
|-------|-------|
| **Figure number** | 3.16 |
| **LaTeX label** | `fig:savings-vault` |
| **Source** | `fig-savings-vault.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch3_Fig3_16_savings-vault-fixed-deposit-loop.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_16_savings-vault-fixed-deposit-loop.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Closed-loop deposit mobilization through SavingsVault and FixedDeposit. Depositors place USDC into variable yield savings or term-locked fixed deposits. Funds flow to local bank lending pool funding retail and group loans. Interest collected splits between depositor yield, insurance fund five percent, and protocol revenue. Circular economy argument for the platform.

Save the image as: Ch3_Fig3_16_savings-vault-fixed-deposit-loop.png
```

---

## Figure 3.17 — On-Chain Credit Passport (Soulbound Token)

| Field | Value |
|-------|-------|
| **Figure number** | 3.17 |
| **LaTeX label** | `fig:credit-passport` |
| **Source** | `fig-credit-passport.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch3_Fig3_17_credit-passport-sbt-lifecycle.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_17_credit-passport-sbt-lifecycle.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

On-chain credit passport as non-transferable soulbound token. Issued after KYC with credit score, risk tier and open loan count. Repaid installments improve score and tier. Missed payments cause permanent downgrade with last default recorded never revoked. Other contracts read score for group lending caps, progressive lending across local banks, and external composability.

Save the image as: Ch3_Fig3_17_credit-passport-sbt-lifecycle.png
```

---

## Figure 3.18 — Cross-Chain Bridge — Chainlink CCIP

| Field | Value |
|-------|-------|
| **Figure number** | 3.18 |
| **LaTeX label** | `fig:ccip-bridge` |
| **Source** | `fig-ccip-bridge.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_18_chainlink-ccip-cross-chain.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_18_chainlink-ccip-cross-chain.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Chainlink CCIP cross-chain bridge preserving hierarchy invariant. Polygon zkEVM Cardona hosts retail origin with authoritative loan state and origin credit passport copy. Ethereum Sepolia hosts institutional tier with world and national bank reserve ratios and read-only SBT mirror. Only permitted payloads cross — reserve ratio updates and credential mirror. Loan disbursement, borrowing limit bypass and cross-chain debt consensus must never bridge.

Save the image as: Ch3_Fig3_18_chainlink-ccip-cross-chain.png
```

---

## Figure 3.19 — Multi-Entity and Cross-Tier Capital Operations

| Field | Value |
|-------|-------|
| **Figure number** | 3.19 |
| **LaTeX label** | `fig:multi-entity-ops` |
| **Source** | `fig-multi-entity-ops.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_19_multi-entity-cross-tier-operations.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_19_multi-entity-cross-tier-operations.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Six multi-entity and cross-tier capital operations panels. InterBank Lending Pool between surplus and deficit local banks with kinked rate check. Upward Deposit Facility cascading surplus from local to national to world bank. Syndicated loan with lead arranger, co-lender subscriptions and borrower disbursement. Tranched pool with senior and junior tranches. Treasury swap between national bank ETH reserve and local bank USDC liquidity. Netting engine batching settlements at tier level.

Save the image as: Ch3_Fig3_19_multi-entity-cross-tier-operations.png
```

---

## Figure 3.20 — Use-Case Diagram — Nine-Actor Taxonomy

| Field | Value |
|-------|-------|
| **Figure number** | 3.20 |
| **LaTeX label** | `fig:usecase` |
| **Source** | `fig-usecase-actors.mmd` |
| **Size tier** | **Very large** |
| **Output filename** | `Ch3_Fig3_20_usecase-nine-actor-taxonomy.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_20_usecase-nine-actor-taxonomy.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a large detailed figure — nearly a full A4 page; ensure all labels remain readable.

Use-case diagram with nine-actor taxonomy inside Crypto World Bank system boundary. Actors: retail client, local bank approver, national bank admin, world bank governance, optional AI agent, regulator, Chainlink DON, zkEVM validator, external auditor. Use cases span retail banking, multi-entity operations, governance and compliance. Optional agent and use case ten marked as excluded from MVT. Show who interacts with what at system level — this is a large landscape figure.

Save the image as: Ch3_Fig3_20_usecase-nine-actor-taxonomy.png
```

---

## Figure 3.21 — USDC Loan Lifecycle — End-to-End Activity Flow

| Field | Value |
|-------|-------|
| **Figure number** | 3.21 |
| **LaTeX label** | `fig:act-lending` |
| **Source** | `fig-activity-lending.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_21_usdc-loan-lifecycle-activity.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_21_usdc-loan-lifecycle-activity.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

End-to-end USDC loan lifecycle activity flow. Eligibility gate reading credit passport SBT. Origination with signed loan request and capital allocation down the hierarchy. Oracle risk scoring via FastAPI and Chainlink DON commit-reveal. Human approver reviews SHAP Authority Brief. Disbursement scheduling installments or rejection with explanation. Include reject paths for borrowing limit exceeded.

Save the image as: Ch3_Fig3_21_usdc-loan-lifecycle-activity.png
```

---

## Figure 3.22 — Retail Onboarding and Tiered Identity Activity Flow

| Field | Value |
|-------|-------|
| **Figure number** | 3.22 |
| **LaTeX label** | `fig:act-onboarding` |
| **Source** | `fig-activity-onboarding-id.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_22_retail-onboarding-identity-activity.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_22_retail-onboarding-identity-activity.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Retail onboarding and tiered identity activity flow. Discovery without wallet, smart account via email or OAuth with paymaster, document ladder L1 through L3, compliance proofs from KYC provider with zkKYC and zkAML, on-chain activation granting client role and USDC limits, manual review queue on failure.

Save the image as: Ch3_Fig3_22_retail-onboarding-identity-activity.png
```

---

## Figure 3.23 — Client Banking Session — Chat, Dashboard, Optional Agent

| Field | Value |
|-------|-------|
| **Figure number** | 3.23 |
| **LaTeX label** | `fig:act-aux` |
| **Source** | `fig-activity-aux.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_23_client-banking-session-activity.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_23_client-banking-session-activity.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Client banking session covering dashboard, human support chat and optional agent add-on. Session bootstrap with JWT and wallet, prefetch market prices, primary REST path to contracts, WebSocket chat persisted off-chain, optional agent with context injection RAG read or MCP write only after explicit confirmation, audit logging including agent action log.

Save the image as: Ch3_Fig3_23_client-banking-session-activity.png
```

---

## Figure 3.24 — Data-Flow Diagrams — Context and Level-1

| Field | Value |
|-------|-------|
| **Figure number** | 3.24 |
| **LaTeX label** | `fig:dfd-suite` |
| **Source** | `fig-dfd-suite.mmd` |
| **Size tier** | **Very large** |
| **Output filename** | `Ch3_Fig3_24_data-flow-diagrams-context-level1.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_24_data-flow-diagrams-context-level1.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a large detailed figure — nearly a full A4 page; ensure all labels remain readable.

Data-flow diagram suite with context and level-one decomposition. Level zero shows client, approver and Chainlink as externals around CWB platform. Level one lending breaks into origination, ML plus DON, disbursement with PostgreSQL and on-chain stores. Level one treasury covers savings vault, interbank lending and syndicate, netting engine into capital pools.

Save the image as: Ch3_Fig3_24_data-flow-diagrams-context-level1.png
```

---

## Figure 3.25 — Loan Approval Sequence — Chainlink + Authority Brief

| Field | Value |
|-------|-------|
| **Figure number** | 3.25 |
| **LaTeX label** | `fig:seq-loan-flow` |
| **Source** | `fig-seq-loan-flow.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_25_loan-approval-sequence.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_25_loan-approval-sequence.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Loan approval sequence from client submission through Chainlink oracle to approver decision. Client submits USDC loan via frontend with signed request, API calls apply on contract, ML computes score sent to DON for commit-reveal on chain, approver receives Authority Brief with top SHAP features, then approves disbursement or rejects with reason returned to client.

Save the image as: Ch3_Fig3_25_loan-approval-sequence.png
```

---

## Figure 3.26 — Sequence — Installment Payment & Income Verification

| Field | Value |
|-------|-------|
| **Figure number** | 3.26 |
| **LaTeX label** | `fig:seq-installment-income` |
| **Source** | `fig-seq-installment-income.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_26_installment-income-sequence.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_26_installment-income-sequence.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Two related sequences. First installment payment loop where borrower pays each scheduled installment, contract processes with checks-effects-interactions, event emitted, database updated, receipt returned, final installment closes loan and bumps SBT. Second income verification where borrower uploads document or bank token, open banking pull or manual review, proof stored and credit score updated.

Save the image as: Ch3_Fig3_26_installment-income-sequence.png
```

---

## Figure 3.27 — Sequence — Hierarchical Banking, Market Data, Borrow Limit

| Field | Value |
|-------|-------|
| **Figure number** | 3.27 |
| **LaTeX label** | `fig:seq-banking-data` |
| **Source** | `fig-seq-banking-data.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_27_hierarchical-market-borrowlimit-sequence.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_27_hierarchical-market-borrowlimit-sequence.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Three sequences in one figure. Hierarchical capital allocation from world bank admin down through national to local bank funding the pool. Market data retrieval with cached Chainlink price feeds for client loan form. Borrowing limit calculation reading SBT open loans and tier ceiling before proceeding to ML scoring or returning limit exceeded.

Save the image as: Ch3_Fig3_27_hierarchical-market-borrowlimit-sequence.png
```

---

## Figure 3.28 — Sequence — Bank Chat & Optional Agent

| Field | Value |
|-------|-------|
| **Figure number** | 3.28 |
| **LaTeX label** | `fig:seq-chat-bot` |
| **Source** | `fig-seq-chat-chatbot.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_28_bank-chat-optional-agent-sequence.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_28_bank-chat-optional-agent-sequence.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Two sequences. Core client-bank chat via WebSocket support thread with messages persisted off-chain. Optional MCP agent path where client requests loan in natural language, model returns confirmation summary, explicit yes triggers signed submission, with note that writes without confirmation are blocked. Agent path is Phase III-IV optional not MVT.

Save the image as: Ch3_Fig3_28_bank-chat-optional-agent-sequence.png
```

---

## Figure 3.29 — Four-Tier Hierarchical Capital Flow

| Field | Value |
|-------|-------|
| **Figure number** | 3.29 |
| **LaTeX label** | `fig:four-tier` |
| **Source** | `fig-hierarchical-banking.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_29_four-tier-hierarchical-capital-flow.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_29_four-tier-hierarchical-capital-flow.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Four-tier hierarchical capital flow in USDC. Downward allocation from national through local to client and groups. Upward repayment cascade from client back up the hierarchy. Same-tier interbank lending pool between surplus and deficit local banks. Upward deposit facility moving surplus USDC up the chain to parent banks and world reserve.

Save the image as: Ch3_Fig3_29_four-tier-hierarchical-capital-flow.png
```

---

## Figure 3.30 — Solidarity Group Lending — Full Lifecycle

| Field | Value |
|-------|-------|
| **Figure number** | 3.30 |
| **LaTeX label** | `fig:group-lending-lifecycle` |
| **Source** | `fig-group-lending-lifecycle.mmd` |
| **Size tier** | **Very large** |
| **Output filename** | `Ch3_Fig3_30_solidarity-group-lending-lifecycle.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_30_solidarity-group-lending-lifecycle.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a large detailed figure — nearly a full A4 page; ensure all labels remain readable.

Solidarity group lending full lifecycle. Formation of loan group three to twenty members with collateral pool or cold-start tier and SBT plus debt-to-income gate. Collective application requiring unanimous consent and approver decision. Disbursement with equal share split, per-member installments and mutual liability pool. Credit progression updating SBT history with three or more cycles unlocking ML tier upgrade.

Save the image as: Ch3_Fig3_30_solidarity-group-lending-lifecycle.png
```

---

## Figure 3.31 — Governance Dual-Path — TimeLock vs Emergency

| Field | Value |
|-------|-------|
| **Figure number** | 3.31 |
| **LaTeX label** | `fig:governance-dual-path` |
| **Source** | `fig-governance-dual-path.mmd` |
| **Size tier** | **Medium** |
| **Output filename** | `Ch3_Fig3_31_governance-dual-path-timelock.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_31_governance-dual-path-timelock.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a medium figure — about one third of an A4 page.

Governance dual path for protocol changes. Standard path through timelock controller with twenty-four to forty-eight hour delay and Safe multisig before on-chain execution. Emergency path through security council four-of-seven multisig with two-hour window for pre-approved actions only and mandatory forty-eight hour post-incident disclosure.

Save the image as: Ch3_Fig3_31_governance-dual-path-timelock.png
```

---

## Figure 3.32 — SAR and AML Compliance Workflow

| Field | Value |
|-------|-------|
| **Figure number** | 3.32 |
| **LaTeX label** | `fig:sar-aml-workflow` |
| **Source** | `fig-sar-aml-workflow.mmd` |
| **Size tier** | **Medium** |
| **Output filename** | `Ch3_Fig3_32_sar-aml-compliance-workflow.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_32_sar-aml-compliance-workflow.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a medium figure — about one third of an A4 page.

SAR and AML compliance workflow. Transaction stream scored by isolation forest anomaly detection, alerts queued for officer review, compliance review generates SAR, on-chain freeze account enforcement and audit log append. Linear compliance operations figure.

Save the image as: Ch3_Fig3_32_sar-aml-compliance-workflow.png
```

---

## Figure 3.33 — Five-Layer Defense-in-Depth Security Architecture

| Field | Value |
|-------|-------|
| **Figure number** | 3.33 |
| **LaTeX label** | `fig:defense-in-depth` |
| **Source** | `fig-defense-in-depth.mmd` |
| **Size tier** | **Very large** |
| **Output filename** | `Ch3_Fig3_33_five-layer-defense-in-depth.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_33_five-layer-defense-in-depth.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a large detailed figure — nearly a full A4 page; ensure all labels remain readable.

Five-layer defense-in-depth security architecture stacked from smart contracts at bottom to operations at top. Layer one smart contract controls UUPS timelock RBAC reentrancy guards and formal verification. Layer two application authentication JWT confirmation hooks rate limits. Layer three AI ML oracle DON SHAP brief prompt injection scanner agent confirmation gate. Layer four runtime monitoring via Tenderly The Graph and SAR queue. Layer five operations with multisigs security council key rotation and bug bounty.

Save the image as: Ch3_Fig3_33_five-layer-defense-in-depth.png
```

---

## Figure 3.34 — Smart-Contract Security Controls

| Field | Value |
|-------|-------|
| **Figure number** | 3.34 |
| **LaTeX label** | `fig:security-controls` |
| **Source** | `fig-security-controls.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch3_Fig3_34_smart-contract-security-controls.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch3_Fig3_34_smart-contract-security-controls.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Smart contract security controls in three areas. UUPS upgrade path from Safe proposer through timelock to new implementation. EIP-712 typed data sign-in recovering wallet address issuing short JWT. Granular pause registry where world bank admin can pause individual functions tracked on-chain and indexed.

Save the image as: Ch3_Fig3_34_smart-contract-security-controls.png
```

---

## Figure 4.1 — Agile / Scrum Process with Sprint Submission

| Field | Value |
|-------|-------|
| **Figure number** | 4.1 |
| **LaTeX label** | `fig:agile-process` |
| **Source** | `fig-agile-process.mmd` |
| **Size tier** | **Medium** |
| **Output filename** | `Ch4_Fig4_1_agile-scrum-sprint-cycle.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_1_agile-scrum-sprint-cycle.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a medium figure — about one third of an A4 page.

Agile Scrum development process with sprint submission cycle for the thesis project. Product backlog through sprint planning, development in two-week iterations, review demo, retrospective, shippable increment and formal sprint submission with report PRs and CI. Daily standup throughout. Sprint point estimates for first three sprints roughly thirty-four, forty-one and forty-seven points.

Save the image as: Ch4_Fig4_1_agile-scrum-sprint-cycle.png
```

---

## Figure 4.2 — AI / ML Pipeline

| Field | Value |
|-------|-------|
| **Figure number** | 4.2 |
| **LaTeX label** | `fig:aiml-pipeline` |
| **Source** | `fig-aiml-pipeline.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch4_Fig4_2_aiml-pipeline-training-oracle.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_2_aiml-pipeline-training-oracle.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

AI and ML pipeline wiring. Training branch with feature engineering, random forest, isolation forest, SHAP and model registry. Oracle branch with FastAPI commit-reveal through Chainlink to loan approved event. Extension branches for GNN augmenting features and federated learning across local trainers aggregated at national bank — extensions marked as future work.

Save the image as: Ch4_Fig4_2_aiml-pipeline-training-oracle.png
```

---

## Figure 4.3 — ML Evaluation and Explainability Benchmarks

| Field | Value |
|-------|-------|
| **Figure number** | 4.3 |
| **LaTeX label** | `fig:ml-eval` |
| **Source** | `Inline TikZ composite in tex` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch4_Fig4_3_ml-evaluation-explainability-benchmarks.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_3_ml-evaluation-explainability-benchmarks.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

ML evaluation and explainability benchmarks on BCCC fraud dataset held-out test set. Left side ROC curve for random forest with AUC around zero point eight nine and bar chart of precision recall F1 and AUC values. Right side confusion matrix with counts for legitimate and fraud classes and SHAP waterfall for sample declined loan showing which features drove risk score. Composite academic results figure.

Save the image as: Ch4_Fig4_3_ml-evaluation-explainability-benchmarks.png
```

---

## Figure 4.4 — ML Explainability and Anomaly Detection Flow

| Field | Value |
|-------|-------|
| **Figure number** | 4.4 |
| **LaTeX label** | `fig:ml-explainability` |
| **Source** | `fig-ml-explainability.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch4_Fig4_4_ml-explainability-anomaly-flow.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_4_ml-explainability-anomaly-flow.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

ML explainability and anomaly detection flow. Feature engineering feeds random forest fraud probability and isolation forest anomaly score into stacking meta-learner. SHAP tree explainer and anomaly deviation report feed Chainlink commit. Deliverables split by audience — plain language for client, Authority Brief for approver, full JSON with model version for auditor.

Save the image as: Ch4_Fig4_4_ml-explainability-anomaly-flow.png
```

---

## Figure 4.5 — Real-Time Dashboard and Runtime Monitoring

| Field | Value |
|-------|-------|
| **Figure number** | 4.5 |
| **LaTeX label** | `fig:realtime-dashboard` |
| **Source** | `fig-realtime-dashboard.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch4_Fig4_5_realtime-dashboard-monitoring.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_5_realtime-dashboard-monitoring.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Real-time dashboard and runtime monitoring pipeline. Smart contracts emit typed events indexed by The Graph subgraph with Tenderly runtime alerts. WebSocket server feeds anomaly detector triggering ops runbook and function pause. Consumer views include React dashboard with charts and alerts plus read-only regulator view.

Save the image as: Ch4_Fig4_5_realtime-dashboard-monitoring.png
```

---

## Figure 4.6 — Transaction State Machine — Loan Lifecycle

| Field | Value |
|-------|-------|
| **Figure number** | 4.6 |
| **LaTeX label** | `fig:tx-state-machine` |
| **Source** | `fig-tx-state-machine.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch4_Fig4_6_transaction-state-machine-loan.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_6_transaction-state-machine-loan.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Transaction state machine for loan lifecycle. States from draft through pending KYC, limit check, ML scoring, human approval, active loan with installment processing, possible default and liquidation paths, cure window, and closed. Include rejection branches at KYC limit and approval stages. Standard finite-state diagram for loan status.

Save the image as: Ch4_Fig4_6_transaction-state-machine-loan.png
```

---

## Figure 4.7 — SDLC Mapping with Agile / Scrum Sprint Plan

| Field | Value |
|-------|-------|
| **Figure number** | 4.7 |
| **LaTeX label** | `fig:sdlc-mapping` |
| **Source** | `fig-sdlc-agile.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch4_Fig4_7_sdlc-agile-stage-mapping.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_7_sdlc-agile-stage-mapping.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

SDLC mapping with agile sprint plan aligned to thesis deliverables. Requirements through maintenance phases each linked to concrete outputs — use case taxonomy, architecture and contracts, ERD and DFD and UML suite, Foundry verification, ABM simulation and regulator dashboard, runtime monitoring and key rotation, final thesis sprints.

Save the image as: Ch4_Fig4_7_sdlc-agile-stage-mapping.png
```

---

## Figure 4.8 — Four-Phase Implementation Roadmap

| Field | Value |
|-------|-------|
| **Figure number** | 4.8 |
| **LaTeX label** | `fig:phase-roadmap` |
| **Source** | `fig-phase-roadmap.mmd` |
| **Size tier** | **Very large** |
| **Output filename** | `Ch4_Fig4_8_four-phase-implementation-roadmap.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_8_four-phase-implementation-roadmap.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a large detailed figure — nearly a full A4 page; ensure all labels remain readable.

Four-phase sixteen-week implementation roadmap mapped to SDLC stages. Pre-thesis work covering use cases ERD contracts threat model and ML plan. Phase one foundation weeks one to four with core contracts schema React shell and Chainlink feeds. Phase two core banking weeks five to nine with loan lifecycle SBT limits Authority Brief UI. Phase three AI ML oracle weeks ten to thirteen. Phase four verification weeks fourteen to sixteen. Optional agent add-on linked to later phases. Progress bars showing spec complete, contracts partial, ML partial, testnet early.

Save the image as: Ch4_Fig4_8_four-phase-implementation-roadmap.png
```

---

## Figure 4.9 — Development Effort by Phase

| Field | Value |
|-------|-------|
| **Figure number** | 4.9 |
| **LaTeX label** | `fig:phase-effort` |
| **Source** | `fig-phase-effort-bar.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch4_Fig4_9_development-effort-by-phase.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_9_development-effort-by-phase.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Bar chart of estimated development effort by implementation phase in person-days. Phase one forty-eight, phase two sixty-six, phase three fifty-five, phase four thirty-eight days. Compact economic planning figure for the thesis roadmap.

Save the image as: Ch4_Fig4_9_development-effort-by-phase.png
```

---

## Figure 4.10 — Optional Conversational Agent Add-On

| Field | Value |
|-------|-------|
| **Figure number** | 4.10 |
| **LaTeX label** | `fig:optional-agent-addon` |
| **Source** | `fig-optional-agent-addon.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch4_Fig4_10_optional-conversational-agent-compact.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_10_optional-conversational-agent-compact.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Optional conversational agent add-on shown as compact architecture. React UI as primary path through Express API to smart contracts. MCP agent connects optionally to API not on critical path. Minimal four-box optional component figure.

Save the image as: Ch4_Fig4_10_optional-conversational-agent-compact.png
```

---

## Figure 4.11 — Planned Development and Verification Toolchain

| Field | Value |
|-------|-------|
| **Figure number** | 4.11 |
| **LaTeX label** | `fig:dev-toolchain` |
| **Source** | `fig-dev-toolchain.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch4_Fig4_11_development-verification-toolchain.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_11_development-verification-toolchain.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Planned development and verification toolchain. Solidity contracts with Hardhat deploy scripts, Foundry fuzz and invariant tests, Certora formal proofs for reserve invariants, CI pipeline running thousands of fuzz iterations, final deploy to Polygon zkEVM Cardona testnet in phase four.

Save the image as: Ch4_Fig4_11_development-verification-toolchain.png
```

---

## Figure 4.12 — Key Design Decisions and Alternatives

| Field | Value |
|-------|-------|
| **Figure number** | 4.12 |
| **LaTeX label** | `fig:design-decisions` |
| **Source** | `fig-design-decisions.mmd` |
| **Size tier** | **Detailed** |
| **Output filename** | `Ch4_Fig4_12_key-design-decisions-alternatives.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch4_Fig4_12_key-design-decisions-alternatives.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a detailed figure — about half an A4 page.

Key design decisions and alternatives considered. Chosen EVM Solidity over Cosmos or Solana. Polygon plus Sepolia over Ethereum L1 only or single L2. UUPS upgradeability over transparent proxy or immutable. DID VC plus zkKYC over on-chain raw KYC. Commit-reveal Chainlink Functions over trusted backend or on-chain ML. Chainlink CCIP over LayerZero for bridging.

Save the image as: Ch4_Fig4_12_key-design-decisions-alternatives.png
```

---

## Figure 5.1 — Annual Revenue Projection by Tier

| Field | Value |
|-------|-------|
| **Figure number** | 5.1 |
| **LaTeX label** | `fig:revenue-by-tier` |
| **Source** | `fig-revenue-by-tier.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch5_Fig5_1_annual-revenue-by-tier.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch5_Fig5_1_annual-revenue-by-tier.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Annual spread revenue projection by tier in USD millions base case. World Bank fifty-one point six, National Banks thirty-four point four, Local Banks fifty-one point six, Total one hundred thirty-seven point six million. Bar chart comparing tier contributions to total revenue.

Save the image as: Ch5_Fig5_1_annual-revenue-by-tier.png
```

---

## Figure 5.2 (pie A) — Revenue Mix at Full Deployment

| Field | Value |
|-------|-------|
| **Figure number** | 5.2 (left pie in thesis) |
| **LaTeX label** | `fig:revenue-mix-pie` |
| **Source** | `fig-revenue-mix-pie.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch5_Fig5_2_revenue-mix-pie-chart.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch5_Fig5_2_revenue-mix-pie-chart.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Pie chart of revenue mix at full deployment in USD millions. Interest spreads dominate at one hundred thirty-seven point six, origination fees four point three, FX spread mid twelve point five. Shows where protocol revenue comes from at maturity.

Save the image as: Ch5_Fig5_2_revenue-mix-pie-chart.png
```

---

## Figure 5.2 (pie B) — Market Sizing Funnel

| Field | Value |
|-------|-------|
| **Figure number** | 5.2 (right pie in thesis) |
| **LaTeX label** | `fig:market-tam-pie` |
| **Source** | `fig-market-tam-pie.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch5_Fig5_2_market-sizing-funnel-pie.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch5_Fig5_2_market-sizing-funnel-pie.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Pie chart market sizing funnel illustrative scale. Serviceable obtainable market zero point two billion, serviceable addressable ten billion, remainder of total addressable market fifty-five billion. TAM SAM SOM positioning figure.

Save the image as: Ch5_Fig5_2_market-sizing-funnel-pie.png
```

---

## Figure 5.3 — Hierarchical Interest-Rate Spread (APR)

| Field | Value |
|-------|-------|
| **Figure number** | 5.3 |
| **LaTeX label** | `fig:apr-spread` |
| **Source** | `fig-apr-spread.mmd` |
| **Size tier** | **Small** |
| **Output filename** | `Ch5_Fig5_3_hierarchical-apr-spread.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/Ch5_Fig5_3_hierarchical-apr-spread.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a small figure — about one quarter of an A4 page.

Hierarchical interest rate spread APR between tiers. World Bank to National Bank three percent, National to Local Bank five percent, Local Bank to Borrower eight percent. Ascending spread bar chart showing rate markup at each hierarchy level.

Save the image as: Ch5_Fig5_3_hierarchical-apr-spread.png
```

---

## Figure C.1 — Local LLM Assistant — Compact Request Path

| Field | Value |
|-------|-------|
| **Figure number** | C.1 |
| **LaTeX label** | `fig:local-llm-mermaid` |
| **Source** | `fig-local-llm-compact.mmd` |
| **Size tier** | **Medium** |
| **Output filename** | `ChC_FigC_1_local-llm-compact-request-path.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/ChC_FigC_1_local-llm-compact-request-path.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a medium figure — about one third of an A4 page.

Compact request path for optional local LLM banking assistant add-on. Web UI in Vite React talks through dev proxy to CWB API streaming chat endpoint, which forwards to LM Studio local inference, responses rendered as markdown back to user. Simple five-step integration path for appendix.

Save the image as: ChC_FigC_1_local-llm-compact-request-path.png
```

---

## Figure C.2 — Local LLM Assistant — Component Data Flow

| Field | Value |
|-------|-------|
| **Figure number** | C.2 |
| **LaTeX label** | `fig:local-llm-tikz` |
| **Source** | `fig-local-llm.mmd` |
| **Size tier** | **Very large** |
| **Output filename** | `ChC_FigC_2_local-llm-expanded-data-flow.png` |
| **Save path** | `Documentation/2nd Phase (Bokhtiar)/Improvements/v31 in production/PNGs/ChC_FigC_2_local-llm-expanded-data-flow.png` |

### COPY-PASTE PROMPT

```
Create one finished thesis figure image directly — academically professional, clean and formal, suitable for a university engineering dissertation. Use your own creative layout; do not follow rigid template syntax. Colour palette: black, white, grey, with subtle light blue-white and light green-white accents only. No figure number, no caption, no watermark, no logos of any kind, no clipart, no cartoon style.

This is a large detailed figure — nearly a full A4 page; ensure all labels remain readable.

Expanded local LLM assistant data flow for appendix. Browser hosts landing and in-app widget. CWB backend handles AI routes, session context from wallet loans and SBT read-only, SSE streaming bridge, confirmation gate before any MCP writes, PostgreSQL chat history. Local inference via LM Studio or Ollama running Qwen model. Optional MCP tools branch for write operations with confirmation required.

Save the image as: ChC_FigC_2_local-llm-expanded-data-flow.png
```

## 4. Post-generation checklist

- [ ] All **56** PNG files present in `v31 in production/PNGs/`
- [ ] Filenames match convention exactly (case-sensitive)
- [ ] Each figure was generated as a **direct image from contextual prompts** (not from diagram code or graph exports)
- [ ] Figures look **academically professional** — formal clean layout, not casual or auto-diagram export
- [ ] No captions, figure numbers, or logos baked into images
- [ ] Text readable at printed thesis size (9 pt minimum for dense ERDs)
- [ ] Colour palette is monochrome + subtle blue/green accents only
- [ ] Replace `\BalancedDiagram{fig-*.pdf}` paths in v31 `.tex` when integrating (separate step)

## 5. Figures intentionally excluded

| Removed from v30 | Reason |
|------------------|--------|
| `fig:banking-modules` | Split into Figures 3.15–3.18 (liquidation, savings, credit passport, CCIP) |

---

*Generated from `Pre-thesis_v30_final.tex` figure inventory and `Documentation/Diagrams/mermaid-src/improved diagrams/*.mmd` sources.*

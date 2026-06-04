# Updated Diagram Integration in LaTeX (v29)

**Purpose:** Re-upload this file with `diagram_update_plan_for_v29.md` when ready to wire v29 diagrams into `Pre-thesis_v29_final.tex`.  
**Scope:** Integration instructions only — **do not edit `.tex` during diagram sessions 2–5.**  
**PDF location until integration:** `Improvements/v29/mermaid-pdf/*.pdf` (v29-only; no copy to legacy `Diagrams/mermaid-pdf/improved diagrams/` unless you choose to).

---

## 1. Folder layout (after sessions 2–5)

```
Documentation/2nd Phase (Bokhtiar)/Improvements/v29/
  diagram_update_plan_for_v29.md          ← master plan (IDs D3.01, etc.)
  updated_diagram_integration_in_latex.md ← this file
  mermaid-src/<basename>.mmd
  mermaid-pdf/<basename>.pdf
  mmdc-config.json                        ← copy from Diagrams/ in Session 2
  mmdc-charts-config.json
  mmdc-puppeteer.json
  build-v29-diagrams.sh                   ← adapt from Diagrams/build-improved-diagrams.sh
```

---

## 2. `\graphicspath` change (paste into `Pre-thesis_v29_final.tex` ~lines 50–57)

Replace or prepend the v29 PDF directory **before** legacy fallbacks:

```latex
\graphicspath{%
  {Improvements/v29/mermaid-pdf/}%           % v29 canonical diagrams
  {Diagrams/mermaid-pdf/improved diagrams/}% % legacy fallback
  {./}%
  {Tables/}%
  {Diagrams/mermaid-pdf/}%
  {Diagrams/}%
  {Diagrams/CSE370/}{Diagrams/CSE471/}{Diagrams/CSE470/}%
}
```

Also update `\ThesisIncludeGraphics` fallback chain (~lines 77–78) to probe `Improvements/v29/mermaid-pdf/` if you rely on that helper for missing-file resolution.

**Compile cwd:** Run `pdflatex` from `Documentation/2nd Phase (Bokhtiar)/Improvements/` (same as today).

---

## 3. Figure macros (unchanged)

| Macro | Usage | Sizing |
|-------|--------|--------|
| `\OnePageDiagram{fig-foo.pdf}` | Most figures | `width=\linewidth`, max height ≈ `\textheight` minus caption reserve |
| `\HalfWidthDiagram{fig-foo.pdf}` | Ch5 charts only | `width=0.5\linewidth` |

Definitions: `Pre-thesis_v29_final.tex` lines 132–141.

---

## 4. Existing figures — replace PDF only (32)

Action: **REPLACE** — change `\OnePageDiagram{...}` path only if basename changes; otherwise only swap PDF on disk via `\graphicspath`.

| PDF basename | LaTeX `\label` | ~Line | Macro | Session | Plan ID |
|--------------|----------------|-------|-------|---------|---------|
| `fig-three-layer-arch.pdf` | `fig:three-layer-arch` | 1364 | OnePage | 2 | D3.01 |
| `fig-component-architecture.pdf` | `fig:component-diagram` | 1375 | OnePage | 2 | D3.02 |
| `fig-blockchain-stack.pdf` | `fig:blockchain-stack` | 1384 | OnePage | 2 | D3.03 |
| `fig-erd-core.pdf` | `fig:core-system-graph` | 1543 | OnePage | 2 | **Change to** `fig-core-system-graph.pdf` |
| `fig-erd-core.pdf` | `fig:erd` | 1572 | OnePage | 2 | D3.17b |
| `fig-erd-extended.pdf` | `fig:erd-extended` | 1579 | OnePage | 2 | D3.18 |
| `fig-eer-model.pdf` | `fig:eer` | 1589 | OnePage | 2 | D3.19 |
| `fig-compliance-identity.pdf` | `fig:compliance-identity` | 1865 | OnePage | 2 | D3.10 |
| `fig-tier-model.pdf` | `fig:tier-model` | 2022 | OnePage | 2 | D3.09 |
| `fig-multi-entity-ops.pdf` | `fig:multi-entity-ops` | 2183 | OnePage | 2 | D3.08 |
| `fig-usecase-actors.pdf` | `fig:usecase` | 2382 | OnePage | 2 | D3.22 |
| `fig-activity-lending.pdf` | `fig:act-lending` (+ aliases) | 2393 | OnePage | 2 | D3.23 |
| `fig-activity-onboarding-id.pdf` | `fig:act-onboarding` (+ aliases) | 2401 | OnePage | 2 | D3.24 |
| `fig-activity-aux.pdf` | `fig:act-aux` (+ aliases) | 2409 | OnePage | 2 | D3.25 |
| `fig-dfd-suite.pdf` | `fig:dfd-suite` (+ aliases) | 2436 | OnePage | 2 | D3.27 |
| `fig-seq-loan-flow.pdf` | `fig:seq-loan-flow` (+ aliases) | 2448 | OnePage | 2 | D3.28 |
| `fig-seq-installment-income.pdf` | `fig:seq-installment-income` (+ aliases) | 2456 | OnePage | 2 | D3.29 |
| `fig-seq-banking-data.pdf` | `fig:seq-banking-data` (+ aliases) | 2464 | OnePage | 2 | D3.30 |
| `fig-seq-chat-chatbot.pdf` | `fig:seq-chat-bot` (+ aliases) | 2472 | OnePage | 2 | D3.31 — content from `fig-seq-agent-banking` |
| `fig-hierarchical-banking.pdf` | `fig:four-tier` | 2484 | OnePage | 2 | D3.07 |
| `fig-banking-modules.pdf` | `fig:banking-modules` | 2506 | OnePage | 2 | D3.06 |
| `fig-defense-in-depth.pdf` | `fig:defense-in-depth` | 2693 | OnePage | 2 | D3.20 |
| `fig-security-controls.pdf` | `fig:security-controls` | 2700 | OnePage | 2 | D3.21 |
| `fig-agile-process.pdf` | `fig:agile-process` | 2812 | OnePage | 3 | D4.01 |
| `fig-aiml-pipeline.pdf` | `fig:aiml-pipeline` | 2831 | OnePage | 3 | D4.02 |
| `fig-realtime-dashboard.pdf` | `fig:realtime-dashboard` | 3256 | OnePage | 3 | D4.07 |
| `fig-tx-state-machine.pdf` | `fig:tx-state-machine` | 3278 | OnePage | 3 | D4.08 |
| `fig-sdlc-agile.pdf` | `fig:methodology-technical`, `fig:sdlc-mapping` | 3325 | OnePage | 3 | D4.09 |
| `fig-design-decisions.pdf` | `fig:design-decisions` | 3612 | OnePage | 3 | D4.10 |
| `fig-revenue-by-tier.pdf` | `fig:revenue-by-tier` | 4136 | HalfWidth | 4 | D5.01 |
| `fig-apr-spread.pdf` | `fig:apr-spread` | 4205 | HalfWidth | 4 | D5.02 |
| `fig-local-llm-compact.pdf` | `fig:local-llm-mermaid` | 4518 | OnePage | 5 | D-A.01 |
| `fig-local-llm.pdf` | `fig:local-llm-tikz` | 4525 | OnePage | 5 | D-A.02 — **rename label** to `fig:local-llm-expanded` |

### Special case: ERD split (T3)

**Before integration**, Session 2 must produce two PDFs:

| Figure | Old path | New path |
|--------|----------|----------|
| `\ref{fig:core-system-graph}` (~1543) | `fig-erd-core.pdf` | `fig-core-system-graph.pdf` |
| `\ref{fig:erd}` (~1572) | `fig-erd-core.pdf` | `fig-erd-core.pdf` (unchanged basename) |

Edit line ~1543:

```latex
\OnePageDiagram{fig-core-system-graph.pdf}
```

### Special case: Oracle placeholder (T4)

**Remove** prose at ~1534 referencing `oracle_architecture.png`. **Insert** after `\paragraph{Chainlink Proof of Reserve}` block (~1532):

```latex
\begin{figure}[H]
\centering
\OnePageDiagram{fig-oracle-architecture.pdf}
\caption{Oracle architecture: Chainlink Functions DON as the primary path for ML risk-score commitment to \texttt{LoanController}; commit-reveal FastAPI relay as prototype fallback; Chainlink Automation, Price Feeds, and Proof of Reserve as auxiliary oracle services.}
\label{fig:oracle-architecture}
\end{figure}
```

Add prose reference: `Figure~\ref{fig:oracle-architecture}`.

### Special case: Agent sequence (D3.31)

Option A (minimal `.tex` diff): Render `fig-seq-agent-banking.mmd` but output PDF as **`fig-seq-chat-chatbot.pdf`** for line 2472.

Option B: Change line 2472 to `\OnePageDiagram{fig-seq-agent-banking.pdf}` and update caption (remove QLoRA wording per T10).

---

## 5. New figures — add `\begin{figure}` blocks (18)

Insert after the line indicated. Use `\OnePageDiagram` unless noted.

| Plan ID | PDF | Proposed `\label` | Insert after ~line | Section |
|---------|-----|-------------------|-------------------|---------|
| D3.04 | `fig-oracle-architecture.pdf` | `fig:oracle-architecture` | 1532 | Oracle (see §4) |
| D3.05 | `fig-cross-chain-bridge-ccip.pdf` | `fig:bridge-ccip` | 2174 | `\ref{sec:bridge}` |
| D3.11 | `fig-kinked-rate-curve.pdf` | `fig:kinked-rate` | 2073 | Kinked rate |
| D3.12 | `fig-liquidation-engine.pdf` | `fig:liquidation` | 2098 | Liquidation |
| D3.13 | `fig-savings-vault-loop.pdf` | `fig:savings-vault-loop` | 2103 | SavingsVault |
| D3.14 | `fig-credit-passport-sbt.pdf` | `fig:credit-passport` | 2125 | Credit passport |
| D3.15 | `fig-governance-dual-path.pdf` | `fig:governance-dual-path` | 2568 | Governance |
| D3.16 | `fig-prototype-scope-matrix.pdf` | `fig:prototype-scope` | 1302 | Optional |
| D3.26 | `fig-activity-sar-aml.pdf` | `fig:sar-aml` | 2428 | SAR paragraph |
| D3.32 | `fig-seq-agent-confirm-gate.pdf` | `fig:seq-confirm-gate` | 2476 | After seq-chat figure |
| D4.03 | `fig-agent-six-step-pipeline.pdf` | `fig:agent-pipeline` | 2862 | Six-step list |
| D4.04 | `fig-mcp-tool-server.pdf` | `fig:mcp-tools` | 2868 | MCP table |
| D4.05 | `fig-three-tier-prompt.pdf` | `fig:three-tier-prompt` | 2957 | Prompt assembly |
| D4.06 | `fig-lifecycle-hook-middleware.pdf` | `fig:lifecycle-middleware` | 3112 | Lifecycle hooks |
| D4.11 | `fig-eip7702-session-scope.pdf` | `fig:eip7702-scope` | 4530 | After tech stack / agent section |
| D4.12 | `fig-abm-simulation-manifest.pdf` | `fig:abm-sim` | 3222 | ABM simulation |
| D1.01 | `fig-proposed-solution-overview.pdf` | `fig:proposed-solution` | 741 | Proposed Solution |
| D1.02 | `fig-capital-flow-directions.pdf` | `fig:capital-flow-directions` | 802 | Cross-tier lending |
| D1.03 | `fig-five-stage-retail-funnel.pdf` | `fig:five-stage-funnel` | 2052 | Funnel |
| D1.04 | `fig-methodology-phase-roadmap.pdf` | `fig:methodology-roadmap` | 857 | Methodology in Brief |
| D1.05 | `fig-stablecoin-mica-positioning.pdf` | `fig:stablecoin-mica` | 887 | Stablecoin-first |
| D2.01 | `fig-prisma-review-flow.pdf` | `fig:prisma-flow` | 1200 | Literature |
| D2.02 | `fig-protocol-comparison-matrix.pdf` | `fig:protocol-matrix` | 1214 | Optional |
| D2.03 | `fig-ftx-vs-onchain-reserves.pdf` | `fig:ftx-vs-por` | 1250 | Optional |
| D5.03 | `fig-mica-genius-compliance-map.pdf` | `fig:mica-genius` | 4258 | MiCA section |
| D5.04 | `fig-sylhet-accessibility-journey.pdf` | `fig:accessibility-journey` | 4360 | Accessibility |
| D-A.03 | `fig-agent-safety-four-layers.pdf` | `fig:agent-safety-layers` | 4511 | Before compact LLM figure |

**Page budget:** D1.03–D1.05, D2.02–D2.03, D3.16, D5.03–D5.04 are lower priority — add if space allows.

---

## 6. New figure LaTeX template

```latex
\begin{figure}[H]
\centering
\OnePageDiagram{fig-BASENAME.pdf}
\caption{CAPTION_TEXT_MATCHING_V29_NARRATIVE.}
\label{fig:LABEL}
\end{figure}
```

For half-width charts (D5.01, D5.02):

```latex
\begin{figure}[H]
\centering
\HalfWidthDiagram{fig-BASENAME.pdf}
\caption{CAPTION_TEXT.}
\label{fig:LABEL}
\end{figure}
```

After each insert, add at least one `Figure~\ref{fig:LABEL}` in surrounding prose.

---

## 7. Prose and caption fixes (parallel track — not optional for final PDF)

Apply when integrating (see plan Section H). Minimum set:

| ID | ~Line | Action |
|----|-------|--------|
| T1 | 1371 | Four layers; 3 implemented / 15 target contracts |
| T3 | 1543 | `fig-core-system-graph.pdf` |
| T4 | 1534 | Remove `oracle_architecture.png`; use `\ref{fig:oracle-architecture}` |
| T5–T6 | 1598, 859 | Entity count **20** everywhere |
| T7–T12 | various | Cardona, fifteen contracts, Qwen3+MCP |
| T10 | 2473 | Seq-chat caption: agent + MCP, not QLoRA |
| T13 | 2694, 2701 | Remove “v15” from security figure captions |
| T14 | 4527 | Rename `fig:local-llm-tikz` → `fig:local-llm-expanded` |

---

## 8. Build and render (integration phase)

From repo root or `Improvements/v29/`:

```bash
# Session 2+ (once build-v29-diagrams.sh exists)
cd "Documentation/2nd Phase (Bokhtiar)/Improvements/v29"
chmod +x build-v29-diagrams.sh
./build-v29-diagrams.sh

# Force rebuild all
FORCE=1 ./build-v29-diagrams.sh
```

**Requires:** `mmdc` (`npm install -g @mermaid-js/mermaid-cli`), `rsvg-convert` for chart PDFs.

**Configs:** Copy unchanged from `Documentation/2nd Phase (Bokhtiar)/Improvements/Diagrams/`.

---

## 9. Verification checklist (after `.tex` + PDF integration)

- [ ] `pdflatex Pre-thesis_v29_final.tex` (twice) from `Improvements/` — no “Missing file” boxes
- [ ] List of Figures: 32 original + new figures listed; no duplicate numbering
- [ ] P0 spot-check: `fig:three-layer-arch`, `fig:oracle-architecture`, `fig:usecase`, `fig:local-llm-mermaid`, `fig:erd` vs `fig:core-system-graph` distinct
- [ ] Half-width charts readable at 0.5\linewidth
- [ ] Captions match diagram content (four layers, nine actors, MCP path, USDC)
- [ ] No orphan `oracle_architecture.png` in prose
- [ ] Cross-refs compile (`\ref{fig:...}`)

---

## 10. Sync rule

| Event | Update both files |
|-------|-------------------|
| New basename | `diagram_update_plan_for_v29.md` inventory + this manifest |
| New `\label` | Plan table LaTeX label column + §4/§5 here |
| Session checklist complete | Plan Section I changelog |

---

## 11. Quick reference — session → files

| Session | Count | Integration impact |
|---------|------:|-------------------|
| 2 | 33 mmd | 32 replacements + 1 path change (`fig-core-system-graph`) + ~10 new figure blocks in Ch3 |
| 3 | 12 mmd | 9 replacements + 6 new figure blocks in Ch4 |
| 4 | 4 mmd | 2 replacements + 2 new figure blocks in Ch5 |
| 5 | 11 mmd | 2 replacements (appendix) + 8 new figure blocks (Ch1, Ch2, appendix) |

**Total new `\begin{figure}` blocks (high priority):** ~15–18 depending on page budget.

---

## 12. Next-step prompt for LaTeX session

> Integrate v29 diagrams per `updated_diagram_integration_in_latex.md`. Update `\graphicspath`, apply §4 replacements, insert §5 new figures, fix §7 prose. PDFs are in `Improvements/v29/mermaid-pdf/`.

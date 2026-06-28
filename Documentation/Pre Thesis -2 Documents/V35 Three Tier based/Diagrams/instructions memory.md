# Crypto World Bank — Pre-Thesis v34: Working Instructions & Memory

This file is the persistent brief for work on `Pre-thesis_v34.tex` and its figures.
Update it whenever the user gives new instructions. (Created 2026-06-17.)

---

## 1. Project context
- Final-year B.Sc. pre-thesis (Pre-Thesis 1 stage) for **Crypto World Bank (CWB)** — a four-tier
  blockchain banking platform (World Bank → National → Local → Client) with off-chain AI/ML risk
  scoring (Random Forest + Isolation Forest + SHAP), commit–reveal oracle, and a Phase III
  conversational agent (Qwen3-8B + MCP).
- Main file: `Pre-thesis_v34.tex` (~5,137 lines). Compiled with **pdflatex** locally, then the whole
  `v34 overleaf/` folder is uploaded to Overleaf and compiled there.
- Marking against `Documentation/Writing format/checklist.md` and `rubics.md` (CO1–CO14).
- We are still in pre-thesis; production Phase 1 starts soon. Not everything is finalized.

## 2. Writing / editing rules (from the user)
- Improve the paper with the **rubric in mind**; quality is the most important thing.
- **Do not add anything beyond requirements.** Examiners know the domain — no extra explanatory
  filler sentences.
- Where chapters have too much/repetitive info, **cut only the extra/repetitive parts** and replace
  with concise, accurate info — **in simple language** (compressing ≠ congesting with complex jargon).
- Each paragraph: enough information, not too much, not congested.
- **Chapter balancing is for LATER** — do NOT rebalance Ch3/Ch4 now (they share content that needs
  rearranging later). For Ch5, do NOT cut anything yet — instead *report* anything extra/unnecessary
  (bloat) to the user.
- Ch2 (Literature Review) is already well maintained — do NOT add many sources. Only flag a *very*
  valuable paper if found.
- Maintain consistency with the **contents page and references page**. Follow **ACM** style writing.
- Tables and diagrams must not overflow table/page borders. Manage page space properly.

## 3. Figure / diagram rules (from the user)
- Build figures in `Diagrams/`, link them in the `.tex`, generate PDFs via pdflatex; Overleaf
  compile of the `.tex` should produce the final PDF.
- Source format: **`.mmd` (Mermaid) → SVG → PDF**. **No PNG** (SVG strongly preferred per checklist:
  scalable vector graphics only).
- Color scheme (consistent across ALL figures): **black, white, minimalist, very slight 3D effect,
  very light grey, very light blue.** Text must be easily readable; match figure font size to page
  text size where possible.
- Boxes and text must not overlap; connecting lines clear and non-overlapping.
- Page-space sizing: small diagrams ≈ 1/3 page, medium ≈ 1/2 page, large (full DB schema, EER,
  dataflow) ≈ 1 full page.
- Use **academic-standard symbols** for EER, dataflow, component diagrams; minimalist icons only where
  appropriate. Consistent style on every page.

## 4. Workflow rules
- **Write this memory file first** (done).
- **After every command/task is finished, compile the PDF** of the LaTeX file.
- Keep updating this file when new instructions arrive.

## 5. First task (current)
In-depth examiner-POV analysis: read the paper, do online research for credible sources, critically
analyze, list pros/cons, recommend improvements for the project and the paper. Then (later) improve
the paper and build the figures.

---

## 6. Findings log (append as work progresses)
- 2026-06-17: Initial full read of `Pre-thesis_v34.tex` complete (Ch1–Conclusion + appendices +
  references). Structure mapped. Key issue spotted: references use a mixed `[n]` and `[Rn]` citation
  scheme over a single numbered list — likely numbering collisions (e.g. `[R36]` used for both MiCA
  and the SWC Registry). Several duplicate reference entries (Laravel 11, Qu et al. "From Rules to
  Rewards", W3C DID). Many figures referenced in the `.tex` have **no `.mmd` source** in `Diagrams/`
  yet (only `Ch1_tier-hierarchy` and `Ch2_prisma-flow` exist, and neither matches the figure names
  the `.tex` actually calls). Figures must be built.

## 7. Build commands (reference)
- Rebuild figure PDFs: `./Diagrams/build-pdfs.sh` (needs `mmdc` + `rsvg-convert`; both present on this machine).
- Compile thesis: `pdflatex Pre-thesis_v34.tex` (run twice for TOC/refs) from the `v34 overleaf/` dir.
- Toolchain verified 2026-06-17: pdflatex, mmdc, rsvg-convert, node all available. latexmk missing.

## 8. Figure inventory (54 figures the .tex calls; all to be (re)built in Diagrams/)
Structural diagrams (Mermaid .mmd -> PDF):
- Ch1: Ch1_system-overview-four-tier-stack, Ch1_six-banking-functions, Ch1_cross-tier-lending-flows
- Ch3 arch: fig-three-layer-arch, fig-component-architecture, fig-blockchain-stack, fig-oracle-architecture,
  fig-data-partitioning, Ch3_actor-permission-matrix
- DB: fig-erd-core, fig-erd-extended, fig-eer-model (Crow's-foot/EER, full page),
  fig-db-1nf, fig-db-2nf, fig-db-3nf, fig-db-bcnf
- Onboarding/products: fig-tier-model, fig-five-stage-funnel, fig-agent-six-step-pipeline,
  fig-kinked-rate-curve, fig-liquidation-engine, fig-savings-vault, fig-credit-passport
- Multi-entity/modeling: Ch3_multi-entity-cross-tier-operations, Ch3_use-case-nine-actor-taxonomy,
  fig-activity-lending, fig-activity-onboarding-id, fig-activity-aux, Ch3_data-flow-diagrams,
  fig-seq-loan-flow, fig-seq-installment-income, fig-seq-banking-data, fig-seq-chat-chatbot,
  fig-hierarchical-banking, fig-group-lending-lifecycle
- Governance/security: fig-governance-dual-path, fig-sar-aml-workflow, fig-defense-in-depth, fig-security-controls
- Ch4: Ch4_mvt-status, Ch4_ml-oracle-commit-reveal, Ch4_ml-evidence-pipeline, fig-ml-explainability,
  Ch4_four-phase-roadmap-sdlc, Ch4_dev-verification-toolchain
- Appendix/tech: fig-local-llm, fig-local-llm-compact

Quantitative CHARTS (not flowcharts; render via mmdc xychart or matplotlib->PDF, NOT PNG):
- fig-ml-metrics-bars, fig-ml-confusion-matrix, fig-ml-shap-importance, Ch4_rq2-latency-plan,
  fig-revenue-by-tier, fig-apr-spread, Ch4_dataset-timeline

Note: existing Ch1_tier-hierarchy.mmd and Ch2_prisma-flow.mmd are ORPHANS (not called by current .tex;
PRISMA is inline TikZ). The .tex's Ch1 figure is Ch1_system-overview-four-tier-stack, not Ch1_tier-hierarchy.

## 9. Shared figure style (palette + rules)
- Config files (self-contained): Diagrams/mermaid-config.json, Diagrams/puppeteer-config.json.
- Palette: ink/border/lines #1B1B1B; text #111111; emphasis fill #D6E4F7 (light blue);
  standard fill #EAF1FB (very light blue); neutral fill #F2F4F7 (very light grey); white #FFFFFF;
  neutral border #8A8A8A. Serif font to match thesis body. "Slight 3D" approximated by clean
  consistent borders (Mermaid/rsvg cannot do reliable shadows in PDF).
- Reused classDefs per diagram: apex / mid / leaf / excl / note for consistency across all figures.

## 10. Build progress log
- 2026-06-17: Pipeline validated end-to-end (mermaid-config.json + puppeteer-config.json + build-pdfs.sh
  local-config; per-stem canvas sizes added to figure_canvas()). Full doc compiles clean (no real LaTeX
  errors; only over/underfull-hbox warnings). Now 180 pages.
- DONE (built + rendered + previewed + embedded):
  - Ch1: Ch1_system-overview-four-tier-stack, Ch1_six-banking-functions, Ch1_cross-tier-lending-flows
  - Ch3 arch: fig-three-layer-arch, fig-component-architecture, fig-blockchain-stack,
    fig-oracle-architecture, fig-data-partitioning
- Layout lesson: under `flowchart LR/TB`, a subgraph's inner `direction` is IGNORED when it has
  cross-subgraph edges -> nodes splay horizontally. Fix = force vertical order with invisible links
  `A ~~~ B ~~~ C` inside the subgraph (used in fig-data-partitioning two-column layout).
- DONE (DB set): fig-erd-core (crow's-foot, attrs), fig-eer-model (disjoint "d", weak/assoc double-bar,
  multivalued), fig-erd-extended (banking products, PK-only), fig-erd-multientity (NEW split, full-page
  LANDSCAPE), Ch3_actor-permission-matrix (actor->capability authority map), fig-db-1nf/2nf/3nf/bcnf
  (before->after, serif).
- .tex EDITS made (user-approved): added \usepackage{pdflscape}; split fig-erd-extended into products
  (portrait) + fig-erd-multientity (landscape \begin{landscape} figure[p]); updated prose to ref both.
  New label: fig:erd-multientity. build-pdfs.sh: removed fig-db-* special-case so they use shared config
  (serif). Added fig-erd-multientity canvas via default; per-stem sizes in figure_canvas().
- Layout rule: Mermaid erDiagram CANNOT wrap a hub fan or force vertical -> hub-heavy ERDs go to a
  full-page LANDSCAPE figure; attributed ERDs must stay <= ~10 entities to be legible at \linewidth.
- Compile clean at 188 pages. NOTE: chaining `grep "Output written"` right after pdflatex can race the
  log flush (false exit 1); read the log file instead to confirm.
- DONE (Ch3 modeling): Ch3_use-case-nine-actor-taxonomy (UML boundary + stadium use-cases + primary/
  secondary actors + gated/read assoc), fig-activity-lending / -onboarding-id / -aux (start/end terminals,
  decision diamonds, single end), Ch3_data-flow-diagrams (Level-0 context + Level-1; DFD circles/cylinders/
  externals), fig-seq-loan-flow / -installment-income / -banking-data / -chat-chatbot (native sequenceDiagram,
  alt + rect groupings), fig-hierarchical-banking (capital down / repay up / default cascade),
  Ch3_multi-entity-cross-tier-operations (backbone + 5 ops stacked vertically; portrait full-page).
- Layout lessons: long edge labels widen flowcharts badly -> keep labels short, put detail in prose;
  to stack subgraphs vertically use cross-subgraph invisible links (A ~~~ B). Sequence diagrams render
  fine with shared config.
- Compile clean at 196 pages.
- DONE (products/governance/security): fig-tier-model, fig-five-stage-funnel, fig-agent-six-step-pipeline,
  fig-kinked-rate-curve (xychart), fig-liquidation-engine, fig-savings-vault, fig-credit-passport,
  fig-group-lending-lifecycle, fig-governance-dual-path, fig-sar-aml-workflow, fig-defense-in-depth,
  fig-security-controls.
- DONE (Ch4 + charts): Ch4_mvt-status, Ch4_ml-oracle-commit-reveal, Ch4_dataset-timeline,
  Ch4_ml-evidence-pipeline, fig-ml-explainability, Ch4_rq2-latency-plan, Ch4_four-phase-roadmap-sdlc,
  Ch4_dev-verification-toolchain, fig-ml-metrics-bars / fig-ml-confusion-matrix / fig-ml-shap-importance
  (REAL values from ML pipeline - Mac M4/artifacts/metrics.json: P=.786 R=.807 F1=.796 AUC=.884; CM
  TP1815/FP494/FN435/TN1756; SHAP feat_08..03). fig-revenue-by-tier ($51.6/$34.4/$51.6M from
  tab:revenue-summary), fig-apr-spread (cumulative 0/3/5/8%). fig-local-llm + fig-local-llm-compact.
- CONFIG: added xyChart theme vars (plotColorPalette #2E5A9C) so chart lines/bars are visible (default
  palette was near-invisible cream). build-pdfs.sh: removed BOTH fig-db-* and Ch4_mvt-status special
  cases -> all stems now use shared serif config uniformly.
- STATUS: ALL ~42 figures rebuilt in consistent Mermaid style. Compile clean at 209 pages, 0 errors,
  0 undefined refs, no missing-graphic fallbacks. 57 .mmd -> all have PDFs.
- DONE (refs unification): converted ALL 40+ in-text [Rn] placeholder tokens -> verified ACM [n]
  positions (content-matched to the numbered list, see mapping below). Fixed [R36] collision:
  [R36, R37] (MiCA/EBA) -> [97, 98]; standalone [R36] (SWC class) -> new [164] SWC Registry.
  Fixed malformed [18-1] (ERC-4337 EntryPoint) -> new [165]. Appended 4 genuinely-missing refs at
  end of list (no cascade): 162 Weyl/Ohlhaver/Buterin SBT (was [R30]), 163 BCCC-DeFiFraudTrans-2025
  (was [R47]), 164 SWC Registry, 165 ERC-4337. List now 165 items. Compile clean 209pp, 0 errors,
  0 undefined refs, 0 leftover [Rn]. NOTE math intervals [0,1] and code args[0] are NOT citations.
  FLAGGED for user: (a) [R41]->[103] BB regulatory entry is closest but #103 is the 2025 FE circular,
  not the 2018 crypto-FX circular cited -> verify/replace; (b) "[R47,108]"->"[108, 163]" keeps the
  pre-existing 108 (EIP bundle) which looks unrelated to the BCCC dataset -> user may drop 108;
  (c) BCCC #163 URL/attribution (York Univ BCCC) should be confirmed; (d) DUPLICATE list entries
  remain (Laravel 112=119, Qu 80=104, W3C DID 81=91) -- safe removal needs a full renumber cascade
  (every plain [n] after the dup shifts) AND a global token rewrite is risky due to math/code [..]
  collisions, so left for sign-off.
- DONE (text-size fix, user request): Ch4_mvt-status was a wide diagonal staircase (cross-subgraph
  invisible links I6~~~I7/I8~~~I9 splayed it) -> text ~4pt. Rebuilt as 3 vertical-column subgraphs
  (SPEC/PART/PLAN, each forced single-column via internal ~~~), tight <br/> wrapping, per-diagram
  init directive (fontSize 22px, rankSpacing 26, nodeSpacing 28). Now portrait, fills BalancedDiagram
  slot, labels ~body-text size (verified on compiled p.113/p.91). Canvas 1600x1800.
- DONE (seq text): all 4 fig-seq-* native labels were 13px -> ~3pt at \linewidth (9 participants =
  very wide). Fix: shortened verbose participant names (ML Risk Service->ML Service, Commit-Reveal
  Oracle->Oracle, LocalBank (chain)->LocalBank, WorldBankReserve->WB Reserve, Chainlink Feed->Chainlink)
  to narrow the diagrams + prevent header overlap, AND generalized build-pdfs.sh finalize_figure_pdf
  to scale inline SVG fonts x1.5 (geometry fixed) then rsvg->PDF for ALL fig-seq-* (was chat-chatbot
  only @1.2). Verified legible on compiled pp.72-74. Compile clean 210pp, 0 errors.
- LAYOUT LESSON: text size in a Mermaid figure fit to \linewidth is governed by diagram natural
  WIDTH in px (text_px * \linewidth/diagram_px). Bumping themeVariables.fontSize for a width-bound
  flowchart is a WASH (boxes auto-grow). Real levers: fewer columns, tighter <br/> wrapping (narrower),
  or for sequence diagrams the scale_svg_inline_fonts trick (font up, geometry fixed). Per-diagram
  overrides via %%{init: ...}%% front-matter directive (not the shared config).
- DONE (user request: remove BCOLBD): deleted all 3 BCOLBD mentions -- in-text [17] + \href
  (sec planning para), table cell "(BCOLBD 2025)", and reference entry #17. Removing the auto-numbered
  \item forced a full cascade: decremented EVERY body citation value >=18 by 1 (174 token rewrites,
  97 distinct), via a guarded script that skips math/code/option brackets ([0,1], args[0], [12pt],
  [#1], lengths, captions). List now 164 items (Galaxy Digital is new #17; appended refs now 161-164).
  Verified: max body citation 164, 0 out-of-range, compile clean 210pp, 0 errors, 0 undefined refs.
- REMAINING (non-figure): novelty pre-emption + BCCC fix
  + 2 Ch2 sources + de-congest + ORCID/abbrev; Ch5 line-by-line bloat report (no cuts w/o sign-off);
  final double-pass compile.

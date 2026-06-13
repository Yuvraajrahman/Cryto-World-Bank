# LLM image-generator prompts — Crypto World Bank database figures

Six figures: **0NF, 1NF, 2NF, 3NF, EER, ERD**  
Output target: **SVG** (vector), or **PNG 300 DPI** then trace in Inkscape / Figma.

---

## Important before you generate

1. **Most LLM image models cannot output real SVG with editable text.** They produce raster images. Workflow:
   - Generate PNG at high resolution → **Inkscape** (*Trace Bitmap* or manual redraw) → export SVG  
   - Or use prompts as **layout reference** and label text in **draw.io / Figma** (recommended for thesis accuracy)
2. **Spell-check every label** after generation; image models garble small text.
3. **Generate one diagram per prompt** — never combine 0NF+1NF in one image.
4. Paste **GLOBAL STYLE** + **NEGATIVE PROMPT** + the specific diagram prompt below.

---

## GLOBAL STYLE (prepend to every prompt)

```
STYLE: Professional academic database diagram for a computer science thesis (CSE370 / ACM-style paper). Strict monochrome palette only: pure white background #FFFFFF, black lines and primary text #000000, entity fill light grey #F0F0F0, secondary panels #E8E8E8, tertiary borders #CCCCCC. No color accents, no gradients, no shadows, no 3D, no icons, no logos, no watermarks, no decorative clipart.

NOTATION: Chen / Crow's Foot ER notation. Rectangles for entities (strong), double-bordered rectangles for weak entities, diamonds for relationships optional, crow's-foot cardinality on connectors. Monospace or clean sans-serif font (Helvetica / Arial / Inter). Entity name bold uppercase on top border; attributes listed inside box, one per line, left-aligned. Primary keys underlined; foreign keys marked (FK).

TYPOGRAPHY: Entity titles 10–11 pt bold; attributes 8–9 pt regular; relationship labels 8 pt italic; section titles 12 pt bold. All text must be razor-sharp and readable when printed at thesis size. High contrast black on white/grey only.

LAYOUT: Generous whitespace, orthogonal (right-angle) connector routing, no overlapping text, consistent box widths within each diagram, aligned grid. Figure caption area left empty (caption added in LaTeX).

QUALITY: Flat vector-illustration aesthetic, crisp line art, print-ready, technical documentation standard, looks like a textbook or ACM conference figure—not infographic, not cartoon, not hand-sketched.
```

---

## NEGATIVE PROMPT (append to every prompt)

```
NEGATIVE: color, blue, red, green, yellow, neon, gradient, drop shadow, 3D bevel, glossy, blurry text, illegible text, misspelled words, random characters, watermark, logo, photo, realistic, isometric, emoji, comic, dark background, night mode, low contrast, cluttered, overlapping labels, handwriting font, decorative borders, stock icons, bitcoin logo, cryptocurrency coins art.
```

---

## Canvas sizes (A4 thesis + ACM)

| Figure | Page use | Canvas (mm) | Canvas (px @300 DPI) | Aspect |
|--------|----------|-------------|----------------------|--------|
| 0NF, 1NF, 2NF, 3NF | **Half page** | 155 × 110 | 1831 × 1299 | landscape |
| EER | **Half page** (tall) | 155 × 130 | 1831 × 1535 | portrait |
| ERD | **Full page** | 155 × 220 | 1831 × 2598 | portrait |

ACM single-column figure width ≈ 85 mm; your thesis text block ≈ **155 mm** — use 155 mm width for consistency with `Pre-thesis_v31_heavily_compress.tex` geometry.

**SVG export settings (if tool supports):** viewBox matching mm above, stroke 1–1.5 px black, font-family `Helvetica, Arial, sans-serif`.

---

## Prompt 1 — 0NF (unnormalized problems) — HALF PAGE

```
[GLOBAL STYLE]

DIAGRAM TITLE (top center, 12 pt bold): "Figure: Unnormalized Relations (0NF) — Crypto World Bank"

CANVAS: 155 mm × 110 mm landscape, half A4 thesis column width.

LAYOUT: Three wide table-style relation boxes stacked vertically with 8 mm gap. Each box has a red-free "violation" callout in small italic grey #666666 text (not red—use grey italic).

BOX 1 — header bold: "BORROWER (unnormalized — repeating group)"
Columns as attribute list inside one rectangle:
borrower_id | wallet | name | income_proof_1_hash | income_proof_2_hash | income_proof_1_status | income_proof_2_status | …
Side note in grey italic: "Violation: multi-valued income proofs as repeating columns"

BOX 2 — header bold: "LOAN (unnormalized — repeating group)"
Columns:
loan_id | principal | inst_1_due | inst_1_amount | inst_2_due | inst_2_amount | inst_3_due | …
Side note: "Violation: variable-length installment schedule embedded"

BOX 3 — header bold: "LOCAL_BANK (unnormalized — transitive data)"
Columns:
local_bank_id | name | city | base_rate | kink_utilisation | rate_above_klink
Side note: "Violation: rate parameters depend on tier policy, not local_bank_id directly"

FOOTER NOTE (8 pt grey): "0NF: contains repeating groups and non-atomic attributes. Decomposed in 1NF–3NF."

No relationship lines between boxes—this is a "before" motivation figure.

[NEGATIVE PROMPT]
```

---

## Prompt 2 — 1NF — HALF PAGE

```
[GLOBAL STYLE]

DIAGRAM TITLE: "Figure: First Normal Form (1NF) — Atomic Values, No Repeating Groups"

CANVAS: 155 mm × 110 mm landscape.

RULE BOX (light grey #E8E8E8, top): "1NF Rule: every attribute is atomic; no repeating groups within a row."

LAYOUT: Four entity rectangles in 2×2 grid with crow's-foot relationships.

ENTITY BORROWER (top-left):
  borrower_id (PK, underlined)
  wallet (UK)
  name
  kyc_level
  local_bank_id (FK)

ENTITY INCOME_PROOF (top-right):
  proof_id (PK)
  borrower_id (FK)
  file_hash
  status
  uploaded_at

ENTITY LOAN (bottom-left):
  loan_id (PK)
  borrower_id (FK)
  principal
  status

ENTITY INSTALLMENT (bottom-right):
  loan_id (FK, part of PK)
  installment_number (PK)
  amount_due
  due_date
  status

RELATIONSHIPS:
- BORROWER —|< INCOME_PROOF  label "1:N provides"
- LOAN —|< INSTALLMENT  label "1:N schedules"

ANNOTATION BOX (bottom, 8 pt):
"FD: borrower_id → name, wallet | proof_id → borrower_id, file_hash | (loan_id, installment_number) → amount_due, due_date"

[NEGATIVE PROMPT]
```

---

## Prompt 3 — 2NF — HALF PAGE

```
[GLOBAL STYLE]

DIAGRAM TITLE: "Figure: Second Normal Form (2NF) — No Partial Dependencies"

CANVAS: 155 mm × 110 mm landscape.

RULE BOX: "2NF: in 1NF + every non-key attribute depends on the FULL primary key (no partial dependency on composite key)."

LAYOUT: Left column = correct design; right column = violation example with strikethrough grey.

LEFT — CORRECT:
ENTITY LOAN:
  loan_id (PK)
  borrower_id (FK)
  local_bank_id (FK)
  principal
  apr_bps
  term_months

ENTITY INSTALLMENT (double border = weak entity):
  loan_id (FK, PK part)
  installment_number (PK part)
  amount_due
  due_date
  status

Connect LOAN —|< INSTALLMENT  label "1:N identifying"

RIGHT — VIOLATION (grey header "✗ Remove partial dependents"):
ENTITY INSTALLMENT_BAD (dashed border):
  (loan_id, installment_number) PK
  amount_due
  borrower_wallet  ← annotate "depends only on loan_id ✗"
  local_bank_city  ← annotate "depends only on loan_id ✗"

ARROW from violation box to fix note: "Move borrower_wallet → BORROWER; local_bank_city → LOCAL_BANK"

FOOTER: "INSTALLMENT composite PK: (loan_id, installment_number)"

[NEGATIVE PROMPT]
```

---

## Prompt 4 — 3NF — HALF PAGE

```
[GLOBAL STYLE]

DIAGRAM TITLE: "Figure: Third Normal Form (3NF) — No Transitive Dependencies"

CANVAS: 155 mm × 110 mm landscape.

RULE BOX: "3NF: in 2NF + no non-key attribute depends on another non-key attribute."

LAYOUT: Top = BEFORE (crossed with thin grey X or labelled "Not 3NF"); Bottom = AFTER (3NF decomposition).

TOP PANEL — BEFORE (dashed border):
LOCAL_BANK (unnormalized):
  local_bank_id (PK)
  name
  city
  base_rate
  kink_utilisation
  rate_above_kink
Annotation: "local_bank_id → tier_id → rate params (transitive ✗)"

BOTTOM PANEL — AFTER:
Center ENTITY INTEREST_RATE_TIER (fill #E8E8E8):
  tier_id (PK)
  base_rate
  kink_utilisation
  rate_above_kink
  max_rate

Three bank entities below, each with FK arrow up to INTEREST_RATE_TIER:
WORLD_BANK: world_bank_id (PK), interest_rate_tier_id (FK)
NATIONAL_BANK: national_bank_id (PK), interest_rate_tier_id (FK)
LOCAL_BANK: local_bank_id (PK), interest_rate_tier_id (FK), name, city

FOOTER NOTE: "Derived attributes (e.g. six_month_remaining) computed from TRANSACTION at query time."

[NEGATIVE PROMPT]
```

---

## Prompt 5 — EER — HALF PAGE (tall)

```
[GLOBAL STYLE]

DIAGRAM TITLE: "Figure: Enhanced ER Model (EER) — Crypto World Bank"

CANVAS: 155 mm × 130 mm portrait (tall half-page).

NOTATION KEY (small box top-right):
— Rectangle = strong entity
— Double rectangle = weak entity
— Triangle ISA = specialization
— {braces} = multi-valued
— Double line = total participation

SECTION A (top) — SPECIALIZATION disjoint total:
Superclass rectangle BANK_USER:
  bank_user_id (PK)
  wallet (UK)
  bank_type (discriminator)

ISA triangle below labelled "d" (disjoint). Three subclasses:
  NationalBankAdmin
  LocalBankAdmin
  Approver

SECTION B (middle-left) — WEAK ENTITY + MULTI-VALUED:
LOAN (strong) double-line identifying relationship to INSTALLMENT (double-border weak):
  PK (loan_id, installment_number)

BORROWER connected to brace notation {INCOME_PROOF} with note "separate table for 1NF"

SECTION C (middle-right) — ASSOCIATION + AGGREGATION:
BORROWER and LOCAL_BANK connect to LOAN_REQUEST (label "association entity / M:N resolver").
Diamond aggregation labelled "loan-centric cluster" connecting to:
  TRANSACTION, CHAT_MESSAGE, AI_ML_SECURITY_LOG

SECTION D (bottom) — PARTICIPATION:
LOAN_REQUEST === LOAN  label "total 1:1"
BORROWER --- CREDIT_PASSPORT  label "partial 0:1 (SBT after KYC)"

Small note: AGENT_ACTION_LOG append-only (INSERT-only RLS)

[NEGATIVE PROMPT]
```

---

## Prompt 6 — ERD (full schema) — FULL PAGE

This is the largest figure. Use **two-panel vertical layout** on one A4-full page.

```
[GLOBAL STYLE]

DIAGRAM TITLE: "Figure: Entity-Relationship Diagram — Crypto World Bank (PostgreSQL 3NF)"

CANVAS: 155 mm × 220 mm portrait FULL PAGE.

PANEL A HEADER (12 pt bold, grey bar #E8E8E8): "Core schema — 20 entities"

Arrange Panel A in three horizontal bands:

BAND 1 — Hierarchy (left to right):
WORLD_BANK —1:N— NATIONAL_BANK —1:N— LOCAL_BANK
WORLD_BANK —N:1— INTEREST_RATE_TIER (box below WORLD_BANK)

BAND 2 — People & lending (center):
LOCAL_BANK —1:N— BANK_USER
LOCAL_BANK —1:N— BORROWER —1:N— LOAN_REQUEST —1:1— LOAN —1:N— INSTALLMENT (double border)
BORROWER —1:1— BORROWING_LIMIT
BORROWER —1:N— INCOME_PROOF
BORROWER —0:1— CREDIT_PASSPORT (dashed border, note "on-chain SBT")

BAND 3 — Auxiliary (bottom of Panel A):
LOAN —1:N— TRANSACTION — monitoring — AI_ML_SECURITY_LOG
LOAN_REQUEST —1:N— CHAT_MESSAGE
LOAN —N:1— ASSETS (twice: collateral, loan asset)
BORROWER —1:N— SESSIONS —1:N— AGENT_ACTION_LOG
Standalone: MARKET_DATA, AI_CHATBOT_LOG, PROFILE_SETTING

Include attribute lists INSIDE each entity (minimum 3 attributes + PK); strong entities single border; INSTALLMENT double border.

---

PANEL B HEADER: "Extended schema — 14 entities (Phase II–III)"

BAND 4 — Retail products:
BORROWER —1:N— SAVINGS_ACCOUNT, FIXED_DEPOSIT, CURRENT_ACCOUNT
LOCAL_BANK —1:N— LOAN_GROUP —1:N— GROUP_MEMBER — N:1 — BORROWER
LOCAL_BANK —1:1— INSURANCE_FUND

BAND 5 — Multi-entity / cross-tier:
LOCAL_BANK / NATIONAL_BANK — INTERBANK_LOAN
UPWARD_DEPOSIT arrows: LOCAL_BANK → NATIONAL_BANK → WORLD_BANK (label "surplus repatriation")
SYNDICATE —1:N— SYNDICATE_MEMBER; SYNDICATE —funds— LOAN; BORROWER obligor
TRANCHED_POOL —funds— LOAN
TREASURY_SWAP between banks and ASSETS
NETTING_BATCH —1:N— NETTING_ENTRY

Draw dashed FK bridges from Panel B entities to Panel A (BORROWER, LOCAL_BANK, NATIONAL_BANK, WORLD_BANK, LOAN, ASSETS).

LEGEND BOX (bottom-right, 8 pt):
PK = underlined | FK = (FK) | UK = unique | 1:N crow's foot | double box = weak entity | dashed = on-chain SBT

PROJECT FOOTER: "Crypto World Bank — four-tier hierarchical DeFi banking platform"

[NEGATIVE PROMPT]
```

### ERD fallback (if full page is illegible)

If the model cannot render all 34 entities legibly, use this **Core-only full page** prompt instead:

```
[GLOBAL STYLE]
TITLE: "Core ERD — 20 PostgreSQL Entities — Crypto World Bank"
CANVAS: 155 mm × 220 mm portrait.
Include ONLY the 20 core entities from Panel A in Prompt 6, larger boxes, minimum 4 attributes each, no extended entities.
[NEGATIVE PROMPT]
```

---

## Batch checklist after generation

| # | File name | Verify |
|---|-----------|--------|
| 1 | `fig-norm-0nf.svg` | Three unnormalized tables; violation notes readable |
| 2 | `fig-norm-1nf.svg` | Four entities; 1:N lines correct |
| 3 | `fig-norm-2nf.svg` | Composite PK on INSTALLMENT; violation side panel |
| 4 | `fig-norm-3nf.svg` | INTEREST_RATE_TIER central; three banks with FK |
| 5 | `fig-eer-improved.svg` | ISA triangle; weak entity; aggregation diamond |
| 6 | `fig-erd-improved.svg` | Core + extended OR core-only fallback |

---

## Recommended generators & settings

| Tool | Settings |
|------|----------|
| **GPT-4o / DALL·E 3** | Size: 1792×1024 (half page) or 1024×1792 (full ERD); Style: natural → pick cleanest; then vectorize |
| **Midjourney v6** | `--style raw --ar 3:2` (half) `--ar 2:3` (full ERD) `--no color gradient shadow` |
| **Ideogram 2** | Enable "Typography" mode; paste exact entity names |
| **Adobe Firefly** | Illustration → technical diagram; high detail |

**Best accuracy path:** Generate layout-only (blur text) → overlay text in **Figma/Inkscape** using `ERD-FULL-SPEC.md` → export SVG.

---

## LaTeX figure includes (after SVG→PDF)

```latex
% Half-page normalization figures
\ThesisIncludeGraphics[width=0.92\linewidth]{fig-norm-1nf.pdf}

% Full-page ERD
\ThesisIncludeGraphics[width=\linewidth,height=0.92\textheight,keepaspectratio]{fig-erd-improved.pdf}
```

# Show ML Results + Agent Demo

**Purpose:** Minimum empirical evidence you can put in the paper **now** (tight time budget), plus a later path to **A+** final-thesis quality.

**Repo state (March 2026):**
- ML: `ml-service/app/main.py` is a **stub** (`model_loaded: false`, hash-based scores).
- Dependencies for real ML already listed: `scikit-learn`, `shap`, `joblib` in `ml-service/requirements.txt`.
- Agent: keyword chatbot at `POST /api/chatbot/message` — **no** `loan_apply` intent yet; **no** MCP / Qwen.
- BCCC CSV: must be on disk before the ML block (download ~200–400 MB; do that in a separate session).

**Honest framing for the paper:** call this sprint **“pipeline validation on BCCC mini-subsample”**, not “full CWB 22-dim production model.” That matches limitation **G2** and keeps you defensible.

---

## Resume after loadshedding / power cut

Training is split into **6 stages**. Each stage writes a file and updates `ml-service/artifacts/checkpoint.json`. If power dies mid-run, rerun with `--resume` — finished stages are skipped.

| Stage | Artifact saved | Typical time (50k) |
|-------|----------------|-------------------|
| 1 `preprocess` | `preprocessed.joblib` | 2–10 min (CSV load dominates) |
| 2 `rf` | `rf_model.pkl` | 3–8 min |
| 3 `if` | `if_model.pkl` | 2–5 min |
| 4 `meta` | `meta_learner.json` | <1 min |
| 5 `evaluate` | `metrics.json` | <1 min |
| 6 `shap` | `shap_examples.json` | 5–15 min |

**Commands:**
```bash
cd ml-service && source .venv/bin/activate

# First run (or after --reset)
python scripts/train_mini.py --csv data/bccc.csv

# After power returns — continues from last completed stage
python scripts/train_mini.py --csv data/bccc.csv --resume

# See what's done / pending
python scripts/train_mini.py --status

# Flaky power during RF: save partial forest every 20 trees
python scripts/train_mini.py --csv data/bccc.csv --resume --rf-chunks 5
```

**BCCC download (resume partial file):**
```bash
curl -C - -L -o data/bccc.zip "<download-url>"
# or: wget -c "<url>"
```

**Tips:**
- **Preprocess once** — `preprocessed.joblib` avoids re-reading the full CSV after every outage.
- **`--rf-chunks 5`** — RF trains in chunks; `rf_model.pkl` is rewritten after each chunk (best if cuts happen during forest fit).
- **`tmux` or `nohup`** — keeps the shell alive if only the terminal closes (not if the machine powers off):
  ```bash
  tmux new -s mltrain
  python scripts/train_mini.py --csv data/bccc.csv --resume
  # Detach: Ctrl+B then D
  ```
- **Do not delete `artifacts/`** between sessions unless you mean to start over (`--reset`).

---

## Section 1 — Minimum results now (paper-ready, ~4–5 hours total)

### What you can claim after this sprint

| Evidence | Thesis hook | Honest label |
|----------|-------------|--------------|
| `metrics.json` with precision, recall, F1, ROC-AUC | Replace illustrative `fig:ml-eval`; MVT item 8 | *Measured on BCCC subsample (n=50k), seed 42* |
| `rf_model.pkl` + `if_model.pkl` + live `/score` | RQ3 — models exist and run | *BCCC feature space; CWB 22-dim mapping deferred* |
| 3–5 SHAP explanation rows (JSON or PNG) | Section `sec:ml-explainability` | *TreeExplainer on held-out sample (n≤500)* |
| Agent: one `loan_apply` turn + confirmation CTA + log line | Partial MVT item 11 | *Intent-router prototype; MCP + Qwen Phase III* |

You **cannot** honestly claim after this sprint: E2E commit–reveal, testnet explorer hashes, full MCP agent, or full 1M-row BCCC training.

---

### Is RF + IF + SHAP possible in 2–3 hours?

**Yes — if BCCC is already downloaded.** On a 50k stratified subsample with ~79 numeric features:

| Step | Time (typical) | Notes |
|------|----------------|-------|
| Load CSV + drop NaN labels | 2–5 min | Use all numeric columns except label; auto-detect label column |
| 70/15/15 split (seed 42) | <1 min | Stratified |
| **Random Forest** (100–200 trees) | 3–8 min | `class_weight='balanced'` |
| **Isolation Forest** (train on val non-fraud only) | 2–5 min | Normalize anomaly score to [0,1] |
| **Stacking** (logistic on `p_f`, `s_if`) | <1 min | Optional but cheap; matches thesis story |
| **SHAP** TreeExplainer on 200–500 test rows | 5–15 min | Do **not** SHAP all 7.5k test rows |
| Serialize `.pkl` + `metrics.json` | 1 min | |
| Wire `main.py` to load artifacts | 15–30 min | Same HTTP contract |
| **Total ML block** | **~45–90 min train** | **2–3 h** with debugging + 1 screenshot |

Full 1,026,867-row pipeline (22-dim mapping, Platt scaling, SHAP PDF bundle) is **4–8+ hours** — defer to Section 2.

---

### Sprint schedule (do in this order)

#### Block A — ML train + artifacts (~2–3 h)

**Prereq:** BCCC CSV path, e.g. `ml-service/data/bccc_defi_fraud.csv`

1. Create `ml-service/scripts/train_mini.py` (one script, one run):
   - `sample(n=50_000, random_state=42)` stratified by fraud label.
   - Train RF → `artifacts/rf_model.pkl`.
   - Train IF on validation **non-fraud** rows → `artifacts/if_model.pkl`.
   - Fit logistic meta-learner on `(p_f, s_if)` → `artifacts/meta_learner.json`.
   - Evaluate on held-out test → `artifacts/metrics.json`.
   - SHAP: `TreeExplainer(rf)` on **max 500** test rows → `artifacts/shap_examples.json` (+ optional `confusion_matrix.png`).

2. Run (use `--resume` after any power cut):
   ```bash
   cd ml-service
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt pandas matplotlib
   python scripts/train_mini.py --csv data/bccc.csv --resume --rf-chunks 5
   ```

3. Copy artifacts to evidence:
   ```bash
   mkdir -p "../Documentation/Pre Thesis -2 Documents/v33 development/evidence"
   cp artifacts/metrics.json artifacts/shap_examples.json \
      "../Documentation/Pre Thesis -2 Documents/v33 development/evidence/"
   ```

4. Update `ml-service/app/main.py`:
   - Load `rf_model.pkl` / `if_model.pkl` on startup if present.
   - `GET /health` → `model_loaded: true`.
   - `POST /score` → real `predict_proba` + top-3 SHAP from precomputed template or on-the-fly for demo wallet.

**`metrics.json` shape (paste into paper / appendix):**
```json
{
  "dataset": "BCCC-DeFiFraudTrans-2025",
  "subset": "mini",
  "n_train": 35000,
  "n_val": 7500,
  "n_test": 7500,
  "seed": 42,
  "models": ["RandomForest", "IsolationForest", "LogisticStacking"],
  "test": {
    "precision": 0.0,
    "recall": 0.0,
    "f1": 0.0,
    "roc_auc": 0.0
  },
  "note": "Pipeline validation; full 1M train + 22-dim CWB mapping per Section 4."
}
```
*(Replace zeros with measured values after run.)*

**Thesis caption (use verbatim):**
> *Measured held-out metrics from the training pipeline on a stratified BCCC mini-subsample (n=50,000, seed 42). Full 1,026,867-row training and 22-dimensional CWB feature mapping are scheduled for Phase III.*

---

#### Block B — Agent demo (~45 min)

**Goal:** Show **human-gate pattern** + audit log — not full MCP.

1. In `backend/src/routes/chatbot.ts`:
   - Add intent `loan_apply` with keywords: `apply for loan`, `request loan`, `borrow`, `want a loan`.
   - Response: plain-language summary + `requiresConfirmation: true` + action `{ label: "Confirm loan application", href: "/app/loans/new?confirm=1&source=agent" }`.

2. Append each agent turn to `backend/.data/agent_action_log.jsonl`:
   ```json
   {"timestamp":"...","userId":"...","intent":"loan_apply","message":"...","confirmationRequired":true,"writeExecuted":false}
   ```

3. Demo script (30 s screen recording):
   - Log in as borrower → Chat: *“I want to apply for a 500 USDC loan for 6 months”*
   - Show confirmation CTA (no auto-submit).
   - Show one line in `agent_action_log.jsonl`.

4. Save recording + log under `evidence/screenshots/` and `evidence/agent-demo-log.jsonl`.

**Paper wording:**
> *Agent MVP: keyword intent router with mandatory confirmation before any write path; full MCP tool server and Qwen3-8B integration are Phase III deliverables (MVT item 11).*

---

#### Block C — Optional same-day add-ons (~30 min each, if time)

These strengthen the paper but are **not** required for “minimum ML + agent”:

| Task | Output | MVT |
|------|--------|-----|
| 2 Hardhat revert tests | `evidence/test-run-*.txt` | Item 3 |
| `scripts/measure-gas-local.ts` | `evidence/rq2-gas-local.md` | RQ2 |

Skip testnet E2E and commit–reveal for this sprint.

---

### Minimum evidence checklist (tick before updating `.tex`)

```
evidence/
├── metrics.json              ← from train_mini.py
├── shap_examples.json        ← 3–5 rows with feature + contribution
├── confusion_matrix.png      ← optional
├── agent-demo-log.jsonl      ← ≥1 loan_apply turn
└── screenshots/
    └── agent-loan-apply.mp4  ← or .png sequence
```

**Paper updates (minimum):**
1. Table `tab:ml-datasets` — footnote: *mini-subsample metrics in Appendix / evidence folder*.
2. Figure `fig:ml-eval` caption — change “illustrative” → “measured mini-BCCC run” **or** add footnote pointing to `metrics.json`.
3. One paragraph in Ch4 evaluation: quote F1/AUC from `metrics.json` + SHAP example sentence.

---

### Panel Q&A (minimum sprint)

| Question | Answer |
|----------|--------|
| Is RF/IF/SHAP implemented? | Yes on BCCC subsample; artifacts in `ml-service/artifacts/`; service loads real models. |
| Why not full BCCC? | Time-boxed pipeline proof; full train is Phase III (1–2 days). |
| Why not 22-dim CWB features? | Mapping table exists in spec; training used native BCCC columns for first measured metrics. |
| Is the agent done? | Confirmation-gated intent demo; MCP + Qwen is the planned MVT agent. |
| Domain transfer (G2)? | Acknowledged — BCCC is DeFi fraud proxy, not CWB loan book. |

---

## Section 2 — Advanced work later (A− → solid A+)

These are **evidence gaps**, not writing gaps. Do them after the minimum sprint when you have multi-day blocks.

### A+ empirical targets (from MVT / examiner summary)

| # | Deliverable | Est. effort | Closes gap |
|---|-------------|-------------|------------|
| 1 | **E2E demo** — loan request → commit–reveal score → approver → disbursement → installment, with **explorer tx hashes** | 2–4 days | MVT items 2, 7 |
| 2 | **Full ML** — 1M BCCC, 22-dim mapping, Platt scaling, IF, stacking, SHAP PDF, `LOAN_RISK_ASSESSMENT` rows | 1–2 days | MVT items 4–6, 8; replace all illustrative ML figures |
| 3 | **RQ2 testnet numbers** — gas + latency table on Amoy/Sepolia (not just local Hardhat) | 0.5–1 day | RQ2 empirical |
| 4 | **Invariant / fuzz tests** — reserve-ratio reverts + expanded Hardhat suite (or Foundry) | 0.5–1 day | MVT item 3 |
| 5 | **Full agent** — MCP server, 3–5 tools, one write path, HTTP 403 without confirmation, `AGENT_ACTION_LOG` in Prisma | 3–5 days | MVT item 11 |
| 6 | **LLM eval** — 200 Q&A, 50 action scenarios, 20 bypass prompts (`sec:llm-eval`) | 2–3 days | MVT item 12 (Should) |

**Without Section 1:** strong design document.  
**With Section 1:** credible “we ran the pipeline” pre-thesis / early final evidence.  
**With Section 2 complete:** defensible empirical thesis (A+).

---

### Advanced ML roadmap (after mini sprint)

| Track | What | Why |
|-------|------|-----|
| **Full BCCC train** | `train_risk_models.py` per Section 4 | Real MVT metrics at scale |
| **22-dim CWB mapping** | Table `tab:ml-feature-mapping` | Closes G2 partially |
| **Elliptic++ eval row** | Secondary benchmark table only | Robustness without joint training |
| **Domain adaptation** | BCCC → Foundry synthetic txs | Direct G2 response |
| **GNN ablation** | GraphSAGE on wallet edges | `DT-III.13` Could |
| **Federated learning** | FedAvg across synthetic Local Banks | `DT-III.14` Could |
| **Aave liquidation head** | Cred / Scaleframe-style credit features | Lending-domain complement |

Do **not** merge BCCC + TokenScout + Elliptic in one training run.

---

### Advanced agent roadmap

1. MCP server: `get_borrowing_limit`, `get_loan_status`, `get_pending_approvals`, `apply_loan` (write).
2. Qwen3-8B via llama.cpp / vLLM on RX 9060 XT (ROCm) or LM Studio on Mac.
3. Confirmation middleware: no write without `confirmed: true` in session.
4. Red-team set (20 injection + 20 bypass) per `DT-IV.08`.

---

### Suggested phase order (after minimum sprint)

```
Week A  →  Full ML (1–2 d) + wire backend /risk/score + Authority Brief mock
Week B  →  Hardhat invariants + local/testnet gas table
Week C  →  Commit–reveal on LocalBank + FastAPI oracle hook
Week D  →  Testnet E2E video + e2e-tx-hashes.json
Week E  →  MCP agent + eval protocol
```

---

### Evidence folder (full A+ target)

```
evidence/
├── metrics.json                 ← Section 1 mini → Section 2 full
├── shap_examples.json
├── shap_report.pdf              ← later
├── rq2-gas-local.md
├── rq2-gas-testnet.md           ← later
├── test-run-YYYY-MM-DD.txt
├── e2e-tx-hashes.json           ← later
├── agent-demo-log.jsonl
├── agent-eval-summary.json      ← later (sec:llm-eval)
└── screenshots/
```

---

## Quick decision: you have one evening

**Do (minimum paper impact):**
1. `train_mini.py` → RF + IF + stacking + SHAP → `metrics.json` (**2–3 h** if CSV cached)
2. Load models in `main.py` (**30 min**)
3. `loan_apply` chatbot intent + log (**45 min**)

**Defer:**
- Testnet E2E, commit–reveal, MCP, Qwen, full 1M train

**If BCCC download blocks you tonight:** do Block B (agent) first; run ML tomorrow with CSV pre-staged.

---

*Aligns with `Pre-thesis_v33.tex` Abstract deliverables (i)–(v), MVT checklist Section 4, and limitation G2.*

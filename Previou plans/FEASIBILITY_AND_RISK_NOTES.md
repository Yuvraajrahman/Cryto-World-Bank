================================================================================
FEASIBILITY & RISK NOTES
Decentralized Crypto Reserve & Lending Bank
================================================================================

This file summarizes the feasibility analysis, realistic scope, and likely
criticisms for the project, to be reused in CSE471/470 reports and meetings.

--------------------------------------------------------------------------------
1. TECHNICAL FEASIBILITY
--------------------------------------------------------------------------------

Strengths
--------------------------------------------------------------------------------
- Smart contract (WorldBankReserve.sol) is implemented with:
  - Deposits, loan requests, approvals/rejections
  - Events for transparency
  - Ownable + ReentrancyGuard + pause/unpause
- Frontend (React + TS + MUI) implements:
  - User flows: Dashboard, Deposit, Loan, QR
  - Bank flows: Bank panel (1M ETH demo reserve), pending loans, approvals
  - AI/ML UI: Risk Dashboard, RiskScoreCard, XAIExplanation, RLRecommendation
  - Demo modes: Demo Bank / Demo User
- Clear separation of layers:
  - Frontend DApp
  - Blockchain contract
  - Planned AI/ML backend

Gaps / Missing Pieces
--------------------------------------------------------------------------------
- No real AI/ML backend service yet:
  - No FastAPI or REST API for fraud/anomaly/attack detection
  - No trained models (Random Forest, Isolation Forest, etc.) integrated
  - No database for features, alerts, or historical analytics
- No blockchain event listener:
  - Nothing is yet consuming contract events and forwarding them to ML
- Security depth still basic:
  - No formal audit, fuzzing, or advanced property checks

Conclusion
--------------------------------------------------------------------------------
- Technically feasible as a **research prototype**.
- Not yet production-grade (which is acceptable for a thesis).

--------------------------------------------------------------------------------
2. ECONOMIC FEASIBILITY (COST & CRYPTO)
--------------------------------------------------------------------------------

- All core work can be done on **free testnets** (Sepolia, Mumbai).
- Testnet ETH/MATIC is **free**, so no need to buy real cryptocurrency.
- AI/ML training can be done on:
  - Personal machine (16 GB RAM, 16 GB VRAM) or
  - Free cloud (Google Colab free tier).
- Hosting can use free tiers (Vercel/Netlify for frontend, Render/Railway for
  backend) or university servers.

Optional / Minimal Costs
--------------------------------------------------------------------------------
- Domain name (optional).
- Mainnet deployment only if desired after the thesis.

Conclusion
--------------------------------------------------------------------------------
- Project can be executed with **near-zero monetary cost**.
- No requirement to own or buy real cryptocurrency for the thesis phase.

--------------------------------------------------------------------------------
3. OPERATIONAL / SCOPE FEASIBILITY
--------------------------------------------------------------------------------

Realistic Scope for Thesis
--------------------------------------------------------------------------------
- Focused implementation:
  - Smart contract + frontend (already advanced).
  - **One strong AI/ML feature end-to-end** (fraud detection).
  - Optional: proof-of-concept for anomaly detection or RL.
- Remaining AI/ML features (wallet anomaly, attack detection, full RL, FL)
  treated as **future work** or partial prototypes.

Timeline Idea
--------------------------------------------------------------------------------
- Pre-Thesis 1:
  - Finalize contract + frontend + demo modes.
  - Complete feasibility + requirements + architecture docs.
- Pre-Thesis 2:
  - Implement and evaluate fraud detection pipeline.
  - Integrate with frontend (loan request risk scoring).
- Final:
  - Add one more ML experiment or robustness improvements.
  - Polish documentation, evaluation, and demo script.

--------------------------------------------------------------------------------
4. LIKELY PROFESSOR CRITICISMS & RESPONSES
--------------------------------------------------------------------------------

1) Scope is too broad
--------------------------------------------------------------------------------
- Criticism:
  - “You are trying to do blockchain + full lending platform + AI +
    security + RL + XAI – depth may suffer.”
- Response / Plan:
  - Clearly state that:
    - **Primary implementation focus**: lending DApp + one full ML feature
      (fraud detection).
    - Other AI features are **research extensions**, not all fully built.

2) AI/ML part is only UI / theory
--------------------------------------------------------------------------------
- Criticism:
  - “Where is the real ML model, dataset, and evaluation?”
- Response / Plan:
  - Implement:
    - Dataset (synthetic or public lending data).
    - Random Forest fraud model (tabular features).
    - FastAPI endpoint: `/api/fraud/check-loan`.
    - Basic metrics: accuracy, ROC-AUC, confusion matrix.
    - SHAP plots for explanation.

3) Data realism
--------------------------------------------------------------------------------
- Criticism:
  - “You don’t have real blockchain lending data. How do you evaluate?”
- Response / Plan:
  - Use public lending datasets (e.g., LendingClub, Home Credit) and map
    them to the platform’s schema.
  - Evaluate models on these datasets; use blockchain layer mainly for
    transaction logic and demo.

4) Architecture & methodology justification
--------------------------------------------------------------------------------
- Criticism:
  - “Why Solidity, why React, why Random Forest, why this architecture?”
- Response / Plan:
  - For each major choice document:
    - Alternatives (e.g., Ethereum vs Hyperledger vs traditional DB).
    - Criteria (ecosystem, familiarity, cost, tooling).
    - Justification aligned with SDLC / course expectations.

5) Security depth
--------------------------------------------------------------------------------
- Criticism:
  - “You claim security and attack detection; where is the systematic
    security analysis?”
- Response / Plan:
  - Add:
    - Threat model (list attack vectors and mitigations).
    - Hardhat tests for negative cases and reentrancy.
    - Clear statement: prototype-level security, not production.

--------------------------------------------------------------------------------
5. REAL-TIME FRAUD DETECTION – REALISM
--------------------------------------------------------------------------------

Is real-time fraud detection realistic?
--------------------------------------------------------------------------------
- Yes, for the **expected scale of a student project**:
  - Loan requests are low volume.
  - Inference latency target: ~100–500 ms per request.
  - Models like Random Forest or XGBoost on tabular features easily meet
    this on a single machine.

How it works in practice
--------------------------------------------------------------------------------
- At loan request time:
  - Frontend sends features to `/api/fraud/check-loan`.
  - Backend computes:
    - Fraud score (0–1).
    - Recommendation (approve / flag / reject).
    - SHAP explanation (top features).
  - Result is displayed to the bank before approval.

Limitations
--------------------------------------------------------------------------------
- “Real-time” here means **fast scoring** for each request, not handling
  thousands of TPS like a large bank.
- Data quality and feature engineering matter more than model complexity.

--------------------------------------------------------------------------------
6. HARDWARE REQUIREMENTS FOR MODEL TRAINING
--------------------------------------------------------------------------------

Your machine
--------------------------------------------------------------------------------
- CPU: modern desktop/laptop (assumed).
- RAM: 16 GB.
- GPU: 16 GB VRAM (9060 XT).

Feasibility on this hardware
--------------------------------------------------------------------------------
- **Tabular ML models** (Random Forest, XGBoost, Isolation Forest):
  - Train comfortably on 16 GB RAM.
  - Do not require GPU; CPU is enough.
- **Small deep models** (LSTM for sequences):
  - 16 GB VRAM is more than enough for modest sequence models.
  - You can still train on CPU if dataset is not huge (just slower).

Conclusion
--------------------------------------------------------------------------------
- Your hardware is **more than sufficient** for:
  - Training Random Forest / Isolation Forest / basic LSTM models.
  - Running real-time inference for the demo.
- No paid cloud GPU is necessary for the core thesis work.

================================================================================
End of Notes
================================================================================


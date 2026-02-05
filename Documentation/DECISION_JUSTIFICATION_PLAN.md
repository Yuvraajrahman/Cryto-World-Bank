# Decision Justification Plan

**Requirement:** For every decision (development methodologies, software architecture, interface design, release cycle, algorithm choices), first present the alternatives, then justify your first and second choices.

---

## 1. How to Use This Plan

For each decision area below:

1. **List 2–3 alternatives** (with brief description).
2. **State your chosen option** (1st choice).
3. **State your backup** (2nd choice, if 1st fails).
4. **Justify** each choice with clear criteria (cost, time, familiarity, scalability, academic fit, etc.).

Use the template at the end for each decision you document.

---

## 2. Decision Areas to Cover

### 2.1 Development Methodology

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Agile / Scrum** | Iterative sprints, frequent demos, flexible scope. |
| **B. Waterfall** | Sequential phases (requirements → design → build → test), fixed scope. |
| **C. Incremental / Spiral** | Build in increments, risk-driven iterations. |

**Your 1st choice:** [e.g. Agile / Incremental]  
**Your 2nd choice:** [e.g. Incremental / Waterfall]  
**Justification:** [e.g. Thesis has evolving scope; Agile allows demo-ready increments. Waterfall is too rigid for research. Incremental fits CSE470 SDLC phases while allowing iteration.]

---

### 2.2 Software Architecture

| Alternative | Brief Description |
|-------------|-------------------|
| **A. DApp + Off-chain AI** | Frontend → Smart Contract (on-chain) + Python API (off-chain ML). |
| **B. Fully on-chain logic** | All logic in smart contracts; no external AI service. |
| **C. Hybrid with oracle** | Chainlink or similar oracle feeds ML results on-chain. |

**Your 1st choice:** [e.g. DApp + Off-chain AI]  
**Your 2nd choice:** [e.g. Hybrid with oracle]  
**Justification:** [e.g. Off-chain AI is flexible, cheap to iterate, no gas for ML. Fully on-chain is expensive and inflexible for ML. Oracle adds complexity; can be future work.]

---

### 2.3 Frontend Framework

| Alternative | Brief Description |
|-------------|-------------------|
| **A. React + TypeScript** | Component-based, strong ecosystem, type safety. |
| **B. Vue + TypeScript** | Simpler learning curve, good for smaller teams. |
| **C. Plain HTML/JS** | No build step, minimal dependencies. |

**Your 1st choice:** [e.g. React + TypeScript]  
**Your 2nd choice:** [e.g. Vue + TypeScript]  
**Justification:** [e.g. React has best wallet/Web3 libraries (Wagmi, RainbowKit). TypeScript reduces bugs. Plain JS would be too verbose for this scope.]

---

### 2.4 Smart Contract Platform

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Ethereum / EVM (Solidity)** | Largest ecosystem, many tools, testnets free. |
| **B. Solana (Rust)** | Faster, cheaper, different programming model. |
| **C. Hyperledger** | Permissioned, enterprise-focused. |

**Your 1st choice:** [e.g. Ethereum / EVM]  
**Your 2nd choice:** [e.g. Solana]  
**Justification:** [e.g. EVM has most tutorials, Hardhat, OpenZeppelin. Free testnets (Sepolia, Mumbai). Solana has steeper learning curve. Hyperledger is less aligned with public DeFi research.]

---

### 2.5 UI Design System

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Material Design 3 (MUI)** | Google’s design system, Android 16 aesthetics. |
| **B. Tailwind CSS** | Utility-first, highly customizable. |
| **C. Custom CSS** | Full control, no framework. |

**Your 1st choice:** [e.g. Material Design 3]  
**Your 2nd choice:** [e.g. Tailwind]  
**Justification:** [e.g. MUI gives consistent, professional look with minimal effort. Matches “Android 16 aesthetics” in project spec. Tailwind would require more design decisions. Custom CSS is time-consuming for a thesis.]

---

### 2.6 Release / Deployment Cycle

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Incremental releases** | Deploy after each major feature (contract, frontend, ML). |
| **B. Big-bang at end** | Single deployment at thesis submission. |
| **C. Continuous deployment** | Auto-deploy on every merge (e.g. Vercel). |

**Your 1st choice:** [e.g. Incremental releases]  
**Your 2nd choice:** [e.g. Continuous deployment]  
**Justification:** [e.g. Incremental allows professor demos at P1, P2, Final. Big-bang is risky. CI/CD is nice but not critical for thesis scope.]

---

### 2.7 Fraud Detection Algorithm

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Random Forest** | Interpretable, works well on tabular data, SHAP-friendly. |
| **B. XGBoost** | Often better accuracy, still interpretable. |
| **C. Deep neural network** | Can capture complex patterns, less interpretable. |

**Your 1st choice:** [e.g. Random Forest]  
**Your 2nd choice:** [e.g. XGBoost]  
**Justification:** [e.g. Random Forest is simple, fast to train, works on 16GB RAM. SHAP integration is straightforward. XGBoost is backup if RF accuracy is low. DNN is overkill for tabular fraud data and harder to explain.]

---

### 2.8 Anomaly Detection Algorithm

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Isolation Forest** | Unsupervised, fast, no labels needed. |
| **B. Autoencoder** | Learns normal patterns, flags reconstruction error. |
| **C. Statistical (Z-score, IQR)** | Simple, no ML. |

**Your 1st choice:** [e.g. Isolation Forest]  
**Your 2nd choice:** [e.g. Autoencoder]  
**Justification:** [e.g. Isolation Forest handles unlabeled data, runs on CPU. Autoencoder is backup for complex patterns. Statistical methods are too simple for thesis research contribution.]

---

### 2.9 Explainability Method (XAI)

| Alternative | Brief Description |
|-------------|-------------------|
| **A. SHAP** | Shapley values, theoretically grounded, widely used. |
| **B. LIME** | Local linear approximations, simpler. |
| **C. Feature importance only** | Built-in RF/XGBoost importance, no extra library. |

**Your 1st choice:** [e.g. SHAP]  
**Your 2nd choice:** [e.g. LIME]  
**Justification:** [e.g. SHAP is gold standard in finance research. LIME is faster but less consistent. Feature importance alone is weaker for “explainable AI” thesis contribution.]

---

### 2.10 Reinforcement Learning (if implemented)

| Alternative | Brief Description |
|-------------|-------------------|
| **A. DQN** | Discrete actions (approve/reject), well-documented. |
| **B. PPO** | Policy gradient, good for continuous or mixed actions. |
| **C. Rule-based only** | No RL, fixed thresholds. |

**Your 1st choice:** [e.g. DQN]  
**Your 2nd choice:** [e.g. Rule-based]  
**Justification:** [e.g. DQN fits discrete approve/reject. PPO is backup if we add continuous actions. Rule-based is fallback if RL timeline is tight.]

---

### 2.11 Database (for ML backend)

| Alternative | Brief Description |
|-------------|-------------------|
| **A. PostgreSQL** | Relational, robust, free tiers available. |
| **B. SQLite** | File-based, no server, simple. |
| **C. MongoDB** | Document store, flexible schema. |

**Your 1st choice:** [e.g. PostgreSQL]  
**Your 2nd choice:** [e.g. SQLite]  
**Justification:** [e.g. PostgreSQL aligns with CSE370. SQLite for local dev. MongoDB is overkill for tabular loan/risk data.]

---

### 2.12 Hosting / Deployment

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Vercel (frontend) + Render (backend)** | Free tiers, easy setup. |
| **B. University server** | No cost, may have restrictions. |
| **C. Self-hosted (local)** | Full control, no public URL. |

**Your 1st choice:** [e.g. Vercel + Render]  
**Your 2nd choice:** [e.g. University server]  
**Justification:** [e.g. Free tiers sufficient for demo. University server if external hosting is not allowed.]

---

## 3. Template for Any New Decision

```markdown
### Decision: [Name]

| Alternative | Description |
|-------------|-------------|
| A. [Option 1] | [Brief] |
| B. [Option 2] | [Brief] |
| C. [Option 3] | [Brief] |

**1st choice:** [A/B/C]  
**2nd choice:** [A/B/C]  
**Justification:** [2–4 sentences: criteria used, why 1st beats others, when 2nd would be used.]
```

---

## 4. Where to Put This in Your Report

- **CSE471 (System Analysis & Design):** Architecture, methodology, interface design.
- **CSE470 (Software Engineering):** Methodology, release cycle, tooling.
- **Thesis report:** Create a **“Design Decisions”** or **“Alternatives Considered”** section that references these justifications.

---

## 5. Checklist

- [ ] Development methodology
- [ ] Software architecture
- [ ] Frontend framework
- [ ] Smart contract platform
- [ ] UI design system
- [ ] Release cycle
- [ ] Fraud detection algorithm
- [ ] Anomaly detection algorithm
- [ ] XAI method
- [ ] RL algorithm (if applicable)
- [ ] Database
- [ ] Hosting

Fill in your actual choices and justifications, then copy the relevant parts into your P1 report and thesis.

---

*Last updated: February 2025*

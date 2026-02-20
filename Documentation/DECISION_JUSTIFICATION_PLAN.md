# Decision Justification Plan

**Requirement:** For every decision (development methodologies, software architecture, interface design, release cycle, algorithm choices), first present the alternatives, then justify your first and second choices.

---

## 1. How to Use This Document

For each decision area below, the following structure is used:

1. **Alternatives listed** (with brief description).
2. **1st choice** stated with justification.
3. **2nd choice** stated as backup with rationale.
4. **Criteria** used: cost, time, familiarity, scalability, academic fit, ecosystem maturity, and project-specific requirements.

---

## 2. Completed Decision Justifications

### 2.1 Development Methodology

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Agile / Scrum** | Iterative sprints, frequent demos, flexible scope. |
| **B. Waterfall** | Sequential phases (requirements → design → build → test), fixed scope. |
| **C. Incremental / Spiral** | Build in increments, risk-driven iterations. |

**1st choice:** A. Agile / Scrum  
**2nd choice:** C. Incremental / Spiral  
**Justification:** The project has an evolving scope inherent to research-oriented academic work — requirements for the AI/ML security layer, governance framework, and blockchain integration were refined iteratively as literature review insights emerged. Agile/Scrum enables demo-ready increments at the end of each sprint, which aligns with the professor's requirement for bi-weekly progress updates and the Pre-Thesis 1/2 milestone structure. The fixed two-month window maps naturally to three sprints (Weeks 1–3, 4–6, 7–8). Waterfall is too rigid: a sequential approach would delay testing until the end, creating high-risk integration failures between the smart contract, frontend, and AI layers. The Incremental/Spiral model is the backup because it still supports phased delivery and explicit risk analysis at each increment boundary, but it lacks Scrum's ceremony structure (standups, retrospectives) that enforces team discipline.

---

### 2.2 Software Architecture

| Alternative | Brief Description |
|-------------|-------------------|
| **A. DApp + Off-chain AI** | Frontend → Smart Contract (on-chain) + Python API (off-chain ML). |
| **B. Fully on-chain logic** | All logic in smart contracts; no external AI service. |
| **C. Hybrid with oracle** | Chainlink or similar oracle feeds ML results on-chain. |

**1st choice:** A. DApp + Off-chain AI  
**2nd choice:** C. Hybrid with oracle  
**Justification:** The three-layer architecture (Presentation → Smart Contract → Off-chain Services) separates concerns optimally: financial logic that requires trust guarantees (loan lifecycle, reserve management, installment payments) lives on-chain where it is auditable and tamper-proof, while computationally intensive AI/ML inference (Random Forest, Isolation Forest, SHAP explanations) runs off-chain where iteration is fast and gas-free. Fully on-chain logic (Option B) is impractical because Solidity cannot natively execute ML inference — EVM computation costs would be prohibitive (estimated >$100 per SHAP explanation at mainnet gas prices), and model updates would require contract redeployment. The oracle hybrid (Option C) is the backup: Chainlink Functions could bridge ML results on-chain for trustless verification, adding a stronger security guarantee, but this introduces dependency on an external oracle network and additional latency — acceptable as a Phase 3 enhancement but unnecessary for the prototype.

---

### 2.3 Frontend Framework

| Alternative | Brief Description |
|-------------|-------------------|
| **A. React + TypeScript** | Component-based, strong ecosystem, type safety. |
| **B. Vue + TypeScript** | Simpler learning curve, good for smaller teams. |
| **C. Plain HTML/JS** | No build step, minimal dependencies. |

**1st choice:** A. React + TypeScript  
**2nd choice:** B. Vue + TypeScript  
**Justification:** React has the most mature Web3 library ecosystem — Wagmi (React hooks for Ethereum), RainbowKit (wallet connection UI), and Viem (TypeScript-first EVM client) are all React-first libraries with extensive documentation and community support. TypeScript provides compile-time type checking that catches contract ABI mismatches, incorrect hook parameters, and state management errors before runtime — critical when interacting with financial smart contracts where a type error could result in failed transactions. Vue + TypeScript is the backup because Vue 3's Composition API achieves similar component patterns, and ethers.js provides wallet integration, but the Web3 tooling ecosystem (wallet modals, chain switching, ENS resolution) is less polished than React's. Plain HTML/JS (Option C) would require manual state management, lack type safety, and significantly increase development time for a DApp with 10+ pages and complex wallet/blockchain interactions.

---

### 2.4 Smart Contract Platform

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Ethereum / EVM (Solidity)** | Largest ecosystem, many tools, testnets free. |
| **B. Solana (Rust)** | Faster, cheaper, different programming model. |
| **C. Hyperledger Fabric** | Permissioned, enterprise-focused. |

**1st choice:** A. Ethereum / EVM (Solidity)  
**2nd choice:** B. Solana (Rust)  
**Justification:** EVM (Ethereum Virtual Machine) has the largest smart contract developer ecosystem (>4,000 active developers monthly), battle-tested security libraries (OpenZeppelin: ReentrancyGuard, Ownable, Pausable), and the most comprehensive development tooling (Hardhat for testing/deployment, Slither for static analysis, Mythril for symbolic execution). Solidity 0.8.20 includes built-in overflow protection, eliminating an entire class of vulnerabilities. Free public testnets (Ethereum Sepolia, Polygon Mumbai/Amoy) provide production-equivalent environments at zero cost — critical for an academic prototype. Additionally, Polygon PoS offers sub-2-second finality with gas fees of $0.001–$0.01, making EVM viable for retail-segment micro-loans. Solana (Option B) offers higher throughput (65,000 TPS vs Polygon's ~7,000) but requires Rust/Anchor development — a steeper learning curve with fewer security audit tools and a smaller pool of reference implementations for lending protocols. Hyperledger Fabric (Option C) is permissioned and enterprise-focused, which contradicts the project's public DeFi and financial inclusion mission — permissionless access is a core design requirement.

---

### 2.5 UI Design System

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Material Design 3 (MUI)** | Google's design system, professional aesthetics. |
| **B. Tailwind CSS** | Utility-first, highly customizable. |
| **C. Custom CSS** | Full control, no framework dependency. |

**1st choice:** A. Material Design 3 (MUI)  
**2nd choice:** B. Tailwind CSS  
**Justification:** MUI (Material-UI v5) provides a comprehensive, production-ready component library with accessibility (ARIA) built in, responsive grid layouts, and theming that produces a professional banking application aesthetic with minimal custom CSS. For a financial platform, user trust is directly correlated with interface polish — MUI's pre-built DataGrid, Dialog, Stepper, and Card components accelerate development of complex UIs (loan dashboards, installment progress bars, admin panels) while maintaining visual consistency. Tailwind CSS (Option B) is the backup: it offers maximum flexibility and smaller bundle size, but requires more design decisions for each component — in a two-month prototype window, the time savings from MUI's pre-built components outweigh Tailwind's customization advantages. Custom CSS (Option C) would consume excessive development time on layout, responsiveness, and cross-browser compatibility that MUI handles automatically.

---

### 2.6 Release / Deployment Cycle

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Incremental releases** | Deploy after each major feature (contract, frontend, ML). |
| **B. Big-bang at end** | Single deployment at thesis submission. |
| **C. Continuous deployment** | Auto-deploy on every merge (e.g., Vercel + GitHub Actions). |

**1st choice:** A. Incremental releases  
**2nd choice:** C. Continuous deployment  
**Justification:** Incremental releases align with the Agile sprint structure — each sprint produces a deployable increment that can be demonstrated to the professor at milestone checkpoints (Pre-Thesis 1, Pre-Thesis 2, Final). This provides early feedback, reduces integration risk, and creates a natural audit trail of project progress. Sprint 1 delivers a functional blockchain + wallet flow; Sprint 2 adds lending features; Sprint 3 integrates AI/ML. Big-bang deployment (Option B) is high-risk: a single integration point at the end leaves no time to resolve cross-layer issues (e.g., event listener failures between blockchain and backend). Continuous deployment (Option C) is the backup — Vercel's GitHub integration enables auto-deploy of the frontend on every merge, which would provide the most rapid feedback loop, but the backend and smart contract layers require more controlled deployment (contract immutability means deployment errors are irreversible on testnets without redeployment to a new address).

---

### 2.7 Fraud Detection Algorithm

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Random Forest** | Interpretable ensemble, works well on tabular data, SHAP-friendly. |
| **B. XGBoost** | Gradient boosted trees, often higher accuracy. |
| **C. Deep Neural Network** | Can capture complex patterns, less interpretable. |

**1st choice:** A. Random Forest  
**2nd choice:** B. XGBoost  
**Justification:** Random Forest is selected as the primary fraud detection model because: (1) it achieves 94%+ precision on blockchain transaction classification tasks (Rahouti et al. [16]), (2) it natively produces feature importances and integrates seamlessly with SHAP for per-prediction explanations — critical for the explainability requirement, (3) training and inference are fast (sub-50ms per prediction) and require only CPU, fitting the prototype's hardware constraints (16 GB RAM). XGBoost (Option B) is the backup because it often yields 1–3% higher accuracy through gradient boosting but introduces hyperparameter sensitivity and longer training times; if Random Forest accuracy falls below acceptable thresholds during evaluation, XGBoost can be substituted with minimal code changes (both use scikit-learn-compatible APIs). Deep Neural Networks (Option C) are rejected because: (a) they require substantially more training data than available in the prototype, (b) they are inherently less interpretable, undermining the XAI research contribution, and (c) SHAP computation on DNNs is orders of magnitude slower than on tree-based models.

---

### 2.8 Anomaly Detection Algorithm

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Isolation Forest** | Unsupervised, fast, no labeled data required. |
| **B. Autoencoder** | Learns normal patterns via reconstruction error. |
| **C. Statistical (Z-score, IQR)** | Simple threshold-based, no ML. |

**1st choice:** A. Isolation Forest  
**2nd choice:** B. Autoencoder  
**Justification:** Anomaly detection in the Crypto World Bank monitors wallet behavior (unusual transaction patterns, sudden activity spikes, atypical amounts) where labeled fraud data is scarce or unavailable. Isolation Forest (Liu et al. [12]) operates in an unsupervised setting, requiring no labeled anomaly examples — it isolates anomalies by random partitioning, where anomalous points require fewer splits to isolate. It runs efficiently on CPU with O(n log n) complexity, suitable for real-time monitoring. Autoencoder (Option B) is the backup for detecting more complex behavioral patterns: it learns a compressed representation of normal wallet behavior and flags high-reconstruction-error transactions as anomalous, but it requires more training data and GPU resources for effective training. Statistical methods (Option C) are too simplistic for blockchain transaction data, which exhibits non-Gaussian distributions, heavy tails, and temporal dependencies that Z-score/IQR cannot capture — they would generate excessive false positives on legitimate high-value lending transactions.

---

### 2.9 Explainability Method (XAI)

| Alternative | Brief Description |
|-------------|-------------------|
| **A. SHAP (SHapley Additive exPlanations)** | Shapley values, theoretically grounded, widely used in finance. |
| **B. LIME (Local Interpretable Model-agnostic Explanations)** | Local linear approximations, faster computation. |
| **C. Feature importance only** | Built-in RF/XGBoost importance, no external library. |

**1st choice:** A. SHAP  
**2nd choice:** B. LIME  
**Justification:** SHAP is selected because it provides the strongest theoretical foundation for the explainability research contribution — Shapley values from cooperative game theory guarantee three mathematical properties (local accuracy, missingness, consistency) that no other method provides (Lundberg & Lee [11]). In a banking context, this is critical: Bracke et al. [17] demonstrate that SHAP explanations satisfy Bank of England regulatory requirements for credit decision explainability, directly supporting the project's claim of regulatory-compliant AI. SHAP's TreeExplainer is optimized for Random Forest, computing exact Shapley values in polynomial time (vs. exponential for general SHAP). LIME (Option B) is the backup: Adom et al. [4] show LIME runs faster but produces less consistent explanations across similar inputs — acceptable for user-facing summaries but weaker for audit-grade justifications. Feature importance alone (Option C) provides only global rankings, not per-prediction explanations — insufficient for the "why was this loan flagged?" use case that bank approvers require.

---

### 2.10 Reinforcement Learning (Planned Extension)

| Alternative | Brief Description |
|-------------|-------------------|
| **A. DQN (Deep Q-Network)** | Discrete actions (approve/reject), well-documented. |
| **B. PPO (Proximal Policy Optimization)** | Policy gradient, good for continuous or mixed actions. |
| **C. Rule-based only** | No RL, fixed borrowing limit thresholds. |

**1st choice:** A. DQN  
**2nd choice:** C. Rule-based only  
**Justification:** DQN fits the borrowing limit optimization problem because the action space is discrete (adjust limit up/down by fixed increments, or hold), the state is observable (borrower repayment history, consecutive paid loans, transaction volume), and extensive off-policy training is possible using historical transaction data. Qu et al. [5] demonstrate that offline RL outperforms static policies during stress events. However, RL implementation is designated as a Phase 3 extension due to timeline constraints. The rule-based fallback (Option C) is the current implementation: borrowing limits are computed from rolling 6-month and 1-year transaction windows with a consecutive-paid-loan multiplier. This provides a functional and interpretable baseline. PPO (Option B) would be preferred if the action space were continuous (e.g., setting exact interest rates), but the discrete limit-adjustment formulation favors DQN's value-based approach.

---

### 2.11 Database

| Alternative | Brief Description |
|-------------|-------------------|
| **A. PostgreSQL** | Relational, robust, advanced features, free tiers available. |
| **B. SQLite** | File-based, no server, simple setup. |
| **C. MongoDB** | Document store, flexible schema. |

**1st choice:** A. PostgreSQL  
**2nd choice:** B. SQLite  
**Justification:** PostgreSQL aligns with the CSE370 Database Design course requirements — the 15-table schema in Third Normal Form (3NF) with foreign key constraints, computed fields, and temporal queries (rolling 6-month/1-year borrowing limit windows) leverages PostgreSQL's advanced features: window functions, partial indexes, and JSONB columns for flexible AI/ML log storage. PostgreSQL also scales horizontally for production deployment and integrates natively with FastAPI's async ORM (SQLAlchemy/Tortoise). SQLite (Option B) is the backup for local development: it requires zero configuration and supports the same SQL dialect for basic operations, but lacks concurrent write support — problematic when the event listener and API server simultaneously update loan states. MongoDB (Option C) is rejected because the data model is inherently relational (hierarchical bank entities with foreign key relationships, normalized loan/installment/transaction tables), and a document store would require application-level join logic, increasing complexity and reducing query performance for aggregate borrowing limit calculations.

---

### 2.12 Hosting / Deployment

| Alternative | Brief Description |
|-------------|-------------------|
| **A. Vercel (frontend) + Render (backend)** | Free tiers, easy setup, CI/CD integration. |
| **B. University server** | No external cost, may have restrictions. |
| **C. Self-hosted (localhost)** | Full control, no public URL. |

**1st choice:** A. Vercel (frontend) + Render (backend)  
**2nd choice:** C. Self-hosted (localhost)  
**Justification:** Vercel provides zero-configuration deployment for React applications with automatic HTTPS, global CDN, and GitHub integration — the frontend auto-deploys on every push to the main branch. Render's free tier supports FastAPI Python applications with sufficient compute for the AI/ML inference workload. Both services cost $0 for the prototype scope, meeting the economic feasibility requirement. University server (Option B) was considered but carries restrictions: institutional firewalls may block Web3 RPC connections to Polygon/Ethereum nodes, and deployment requires IT department approval. Self-hosted localhost (Option C) is the backup for demo purposes — all three layers (frontend, smart contracts on testnet, backend API) run locally, which is sufficient for thesis defense demonstrations but lacks the public URL needed for remote professor reviews and competition submissions.

---

## 3. Summary of All Decisions

| # | Decision Area | 1st Choice | 2nd Choice | Key Criterion |
|---|---------------|------------|------------|---------------|
| 1 | Development Methodology | Agile / Scrum | Incremental / Spiral | Evolving scope, sprint milestones |
| 2 | Software Architecture | DApp + Off-chain AI | Hybrid with Oracle | Gas cost, ML flexibility |
| 3 | Frontend Framework | React + TypeScript | Vue + TypeScript | Web3 library ecosystem (Wagmi, RainbowKit) |
| 4 | Smart Contract Platform | Ethereum / EVM (Solidity) | Solana (Rust) | Largest ecosystem, free testnets, OpenZeppelin |
| 5 | UI Design System | Material Design 3 (MUI) | Tailwind CSS | Professional banking UI, development speed |
| 6 | Release Cycle | Incremental releases | Continuous deployment | Professor milestones, integration risk |
| 7 | Fraud Detection | Random Forest | XGBoost | SHAP compatibility, 94%+ precision, fast |
| 8 | Anomaly Detection | Isolation Forest | Autoencoder | Unsupervised, no labels needed |
| 9 | XAI Method | SHAP | LIME | Theoretical foundation, regulatory compliance |
| 10 | RL (planned) | DQN | Rule-based | Discrete action space, offline training |
| 11 | Database | PostgreSQL | SQLite | CSE370 alignment, 3NF schema, async support |
| 12 | Hosting | Vercel + Render | Localhost | $0 cost, public URL, CI/CD |

---

## 4. Checklist

- [x] Development methodology
- [x] Software architecture
- [x] Frontend framework
- [x] Smart contract platform
- [x] UI design system
- [x] Release cycle
- [x] Fraud detection algorithm
- [x] Anomaly detection algorithm
- [x] XAI method
- [x] RL algorithm (planned extension)
- [x] Database
- [x] Hosting

---

*Completed: February 2025*

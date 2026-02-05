# Decentralized Crypto Reserve & Lending Bank

**A Blockchain Prototype with AI/ML Security for Final Year Thesis**

---

## 1. Project Overview

This project is a **decentralized lending platform** inspired by the transparency and accountability of global financial institutions like the World Bank. It demonstrates how blockchain can act as a transparent global reserve where users deposit funds, request loans, and the bank approves or rejects requests—all recorded on-chain.

The prototype integrates **AI/ML cybersecurity features** for fraud detection, anomaly monitoring, and explainable lending decisions, making it suitable for a research-oriented final year thesis.

---

## 2. Objectives

1. **Blockchain transparency** — All deposits, loan requests, and approvals are recorded on-chain and publicly verifiable.
2. **Decentralized lending** — No central database; the smart contract holds the reserve and loan logic.
3. **AI/ML security** — Machine learning models detect fraud, anomalies, and attacks; explainable AI justifies decisions.
4. **Cross-platform** — Web-based DApp that works on desktop and mobile (responsive UI, WalletConnect support).

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React + Material Design 3)                    │
│  Dashboard • Deposit • Loan • Bank • Risk AI • QR        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  BLOCKCHAIN (Ethereum / Polygon Testnet)                 │
│  Smart Contract: WorldBankReserve.sol                    │
│  • Reserve deposits • Loan requests • Approve/Reject     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  AI/ML LAYER (Planned)                                   │
│  Fraud detection • Anomaly detection • XAI • RL policy   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Roles and Features

### User
- Connect wallet (MetaMask, WalletConnect)
- Deposit funds to the reserve
- Request loans (amount + purpose)
- View own loan status (Pending / Approved / Rejected)
- Generate and scan QR codes for sharing

### Bank
- Manages the reserve (1M ETH in demo)
- Views total reserve, reserve left, total disbursed
- Sees which users took how much (loan history)
- Reviews pending loan requests
- Approves or rejects loans
- **Sees AI/ML features:** Risk scores, fraud detection, RL recommendations, XAI explanations

### Admin
- Same as Bank (contract owner)
- Can pause/unpause the contract in emergencies

**Note:** Risk detection and security features are visible only to the Bank, not to Users.

---

## 5. Technology Stack

| Layer        | Technology                                      |
|-------------|--------------------------------------------------|
| Smart Contract | Solidity, OpenZeppelin (Ownable, ReentrancyGuard) |
| Frontend    | React 18, TypeScript, Vite, Material-UI v5       |
| Wallet      | Wagmi, RainbowKit, Viem                         |
| Build/Test  | Hardhat                                         |
| Networks    | Polygon Mumbai, Sepolia (Ethereum testnets)     |
| AI/ML (planned) | Python, FastAPI, scikit-learn, PyTorch, SHAP |

---

## 6. AI/ML Research Component

The project includes six AI/ML cybersecurity features (UI implemented; backend to be built):

| Feature                    | Purpose                                      | Model (planned)      |
|---------------------------|----------------------------------------------|----------------------|
| Fraud Detection           | Flag suspicious loan requests                | Random Forest        |
| Anomaly Detection          | Detect unusual wallet/transaction behavior   | Isolation Forest     |
| Attack Detection          | Detect smart contract attacks                | LSTM                 |
| Explainable AI (XAI)      | Explain why loans are approved/rejected      | SHAP, LIME           |
| RL Lending Policy         | Optimize approve/reject decisions            | DQN / PPO            |
| Federated Learning (optional) | Distributed learning across nodes       | FedAvg               |

---

## 7. Smart Contract Summary

**WorldBankReserve.sol** provides:

- **Deposit** — Users send ETH/MATIC to the reserve
- **Request Loan** — Users submit amount and purpose
- **Approve/Reject** — Bank (contract owner) approves or rejects pending loans
- **Events** — ReserveDeposited, LoanRequested, LoanApproved, LoanRejected
- **Security** — ReentrancyGuard, Ownable, pause/unpause

---

## 8. Current Status

| Component        | Status                                      |
|------------------|---------------------------------------------|
| Smart Contract   | ✅ Complete, tested                         |
| Frontend UI      | ✅ Complete (all pages, responsive)         |
| Wallet Connect  | ✅ MetaMask, WalletConnect                  |
| Demo Mode        | ✅ Demo Bank / Demo User role switcher      |
| AI/ML UI         | ✅ Risk dashboard, XAI, RL cards (mock data)|
| AI/ML Backend    | ⏳ Planned (Python/FastAPI)                 |
| Contract Deploy  | ⏳ Requires deployment to testnet           |

---

## 9. How to Run the Demo

1. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

2. **Start frontend**
   ```bash
   cd frontend && npm run dev
   ```

3. **Use Demo Mode** (no deployment needed)
   - Click **Demo Bank** or **Demo User** in the top bar
   - Explore the Bank panel (1M ETH reserve, loan approvals)
   - Or explore as User (deposit, request loan)

4. **Full demo with blockchain**
   - Deploy contract: `npx hardhat run scripts/deploy.ts --network sepolia`
   - Set `VITE_CONTRACT_ADDRESS` in `frontend/.env`
   - Connect wallet and use real deposits/loans

---

## 10. Research Support

The project is supported by academic literature on:
- DeFi lending (Compound, Aave)
- ML fraud detection in blockchain
- Explainable AI (SHAP/LIME) in lending
- Reinforcement learning for lending policy
- Smart contract attack detection

See `Documentation/RESEARCH_LINKS.txt` for references.

---

## 11. Future Work and Research Scope

This prototype is intentionally designed so it can grow into a larger research
platform. Possible future extensions include:

### 11.1 Product & feature extensions
- **Repayment & schedules** — Add repayment plans, partial repayments, late
  fees, and loan closure logic.
- **Multi-asset support** — Support multiple ERC‑20 tokens or stablecoins as
  reserve and loan currencies.
- **Credit history view** — Longitudinal loan history and repayment behavior
  per user to feed ML models.
- **Notifications & alerts** — Email / app / Telegram alerts for approvals,
  anomalies, and security events.

### 11.2 AI/ML and security research
- **Production-grade fraud model** — Move from mock data to a fully evaluated
  Random Forest / XGBoost model with ROC‑AUC, precision/recall, etc.
- **Wallet anomaly detection** — Isolation Forest / Autoencoder models driven
  by real or realistically simulated transaction graphs.
- **Smart contract attack lab** — Synthetic attack simulations (reentrancy,
  flash loans) and LSTM/GCN models to detect them.
- **Reinforcement learning experiments** — Compare rule-based vs RL-based
  lending policies under stress scenarios (market crash, mass default).
- **Federated / privacy-preserving learning** — Explore FL or differential
  privacy where multiple “banks” collaboratively train without sharing raw
  data.

### 11.3 Scalability and architecture
- **Multi-chain deployment** — Deploy to multiple EVM-compatible chains and
  compare fees, latency, and reliability.
- **Off-chain analytics warehouse** — Stream on-chain events into a warehouse
  (e.g. PostgreSQL) for BI dashboards and long-term analysis.
- **Microservice decomposition** — Split the AI/ML backend into separate
  services (fraud, anomaly, attack detection, RL) with clear APIs.
- **Caching and queues** — Use Redis and message queues to handle bursts of
  loan requests and perform model inference asynchronously when needed.

These directions provide ample material for extended research, future theses,
or publications while keeping the current project focused on a demonstrable,
end-to-end prototype.

---

## 12. Contact

[Your name]  
[Your email]  
[Your institution]

---

*Document prepared for thesis supervision. Last updated: February 2025.*

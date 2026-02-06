PROJECT PITCH REPORT

Decentralized Crypto Reserve and Lending Bank: A Blockchain Prototype with AI/ML Security


Project Type: Final Year Thesis
Department: Computer Science and Engineering
Institution: [Your Institution]
Student: [Your Name]
Student ID: [Your ID]
Supervisor: [Supervisor Name]
Date: February 2025


Abstract

This report presents a project proposal for a decentralized lending platform inspired by the transparency and accountability of global financial institutions. The system uses blockchain as a transparent reserve where users deposit funds, request loans, and a designated bank role approves or rejects requests, with all transactions recorded on-chain. The prototype integrates AI/ML cybersecurity features for fraud detection, anomaly monitoring, and explainable lending decisions. The scope comprises a working decentralized application (DApp) with smart contract, responsive frontend, wallet integration, and at least one fully implemented ML feature (fraud detection). The system operates on free testnets with no requirement for real cryptocurrency. This document outlines the project overview, system architecture, technical implementation, feasibility, and research scope.


1. Introduction

1.1 Background

Traditional lending systems rely on centralized databases and opaque decision-making. Blockchain technology offers an alternative: transparent, verifiable, and decentralized record-keeping. This project explores how a World Bank–inspired reserve and lending model can be implemented on a public blockchain, combined with machine learning for security and explainability.

1.2 Problem Statement

The project addresses the need for a transparent, decentralized lending system that demonstrates blockchain's potential for financial applications while incorporating AI-driven fraud detection and explainable decision-making for loan approvals.

1.3 Scope

- Working DApp with smart contract, frontend, and wallet integration
- At least one fully implemented ML feature (fraud detection with SHAP)
- Other AI components (anomaly detection, RL, attack detection) as exploratory or future work
- Operation on free testnets only; no real cryptocurrency required


2. Project Overview and Objectives

2.1 Mission

To demonstrate how blockchain can replicate the transparency, accountability, and accessibility of global financial institutions through a decentralized reserve and lending system, enhanced by AI-driven security and explainability.

2.2 Objectives

1. Blockchain transparency: All deposits, loan requests, and approvals recorded on-chain and publicly verifiable.
2. Decentralized lending: No central database; smart contract holds reserve and loan logic.
3. AI/ML security: Machine learning for fraud, anomalies, and attacks; explainable AI for decisions.
4. Cross-platform: Web DApp for desktop and mobile with responsive UI and WalletConnect support.

2.3 Target Users

- User: Deposits to reserve, requests loans, tracks loan status.
- Bank: Manages reserve, approves or rejects loans, views AI risk analysis.
- Admin: Same as Bank (contract owner); can pause or unpause the contract.


3. System Architecture and Design

3.1 Architectural Layers

Frontend layer
React, TypeScript, Material Design 3. Pages: Dashboard, Deposit, Loan, Bank, Risk AI, QR. Responsibilities: user interface, wallet connection, transaction signing, display of on-chain data and AI insights.

Blockchain layer
Ethereum and Polygon testnets. Smart contract: WorldBankReserve.sol. Responsibilities: reserve deposits, loan requests, approve/reject logic, event emission.

AI/ML layer (planned)
Python, FastAPI. Responsibilities: fraud detection, anomaly detection, explainability (SHAP), RL recommendations.

3.2 Data Flow

User or Bank to Frontend to Wallet to Smart Contract to Blockchain. The AI/ML backend is invoked from the frontend for risk checks before loan approval.


4. Technical Implementation

4.1 Technology Stack

- Smart contract: Solidity 0.8.20, OpenZeppelin (Ownable, ReentrancyGuard)
- Frontend: React 18, TypeScript, Vite, Material-UI v5
- Wallet: Wagmi, RainbowKit, Viem
- Build and test: Hardhat
- Networks: Polygon Mumbai, Sepolia
- AI/ML (planned): Python, FastAPI, scikit-learn, PyTorch, SHAP

4.2 Roles and Features

User

- Connect wallet (MetaMask, WalletConnect)
- Deposit to reserve
- Request loan (amount, purpose)
- View my loans (Pending, Approved, Rejected)
- Generate or scan QR codes

Risk detection and security features are visible only to the Bank.

Bank

- View reserve and statistics (total, left, disbursed)
- View who took how much (approved loans table)
- View pending loans
- Approve or reject loans
- View risk dashboard (alerts, scores, detections)
- View AI/ML analysis per loan (XAI, RL recommendations)

Admin

- Same as Bank (contract owner)
- Pause or unpause contract
- Emergency withdraw

4.3 Smart Contract Summary

WorldBankReserve.sol provides:

- depositToReserve: Users send ETH or MATIC to the reserve
- requestLoan(amount, purpose): Submit loan request
- approveLoan(loanId): Bank approves and releases funds
- rejectLoan(loanId): Bank rejects loan
- getStats: Total reserve, loans, pending, approved
- getPendingLoans: Pending loans (bank only)
- getUserLoans(address): Loans for a user
- pause, unpause: Admin controls

Events: ReserveDeposited, LoanRequested, LoanApproved, LoanRejected.
Security: ReentrancyGuard, Ownable, pause/unpause.


5. AI/ML Research Component

5.1 Planned Features

- Fraud detection: Flag suspicious loan requests. Model: Random Forest.
- Anomaly detection: Unusual wallet or transaction behavior. Model: Isolation Forest.
- Attack detection: Smart contract attacks. Model: LSTM.
- Explainable AI: Explain approve/reject decisions. Method: SHAP, LIME.
- RL lending policy: Optimize approve/reject decisions. Model: DQN, PPO.
- Federated learning (optional): Distributed learning. Method: FedAvg.

5.2 Implementation Priority

- Primary: Fraud detection (Random Forest + SHAP), full end-to-end implementation
- Secondary: Anomaly detection or RL, proof-of-concept
- Future: Attack detection, federated learning

5.3 Real-Time Feasibility

Random Forest inference on tabular data typically completes in under 50 ms. With a FastAPI backend, end-to-end latency of 100–500 ms is achievable, which is sufficient for a lending UI.


6. Feasibility Analysis

6.1 Technical Feasibility

Strengths: Smart contract complete and tested; frontend complete with all flows; AI/ML UI in place; demo modes for testing without deployment.
Gaps: AI/ML backend not yet implemented; no blockchain event listener; no formal security audit.
Conclusion: Feasible as a research prototype for thesis scope.

6.2 Economic Feasibility

Near-zero cost. Free testnets (Sepolia, Mumbai); no real cryptocurrency required. Hosting via free tiers (Vercel, Render) or university servers. ML training on personal PC (16 GB RAM, 16 GB VRAM) or Google Colab.

6.3 Operational Feasibility

- Pre-Thesis 1: Finalize contract, frontend, documentation
- Pre-Thesis 2: Implement fraud detection, integrate with frontend
- Final: Additional ML experiment, polish, evaluation, report


7. Design Decisions and Alternatives

For each major decision, alternatives were considered and justified:

- Development methodology: 1st Agile/Incremental, 2nd Waterfall. Justification: Evolving scope, demo-ready increments.
- Architecture: 1st DApp + off-chain AI, 2nd hybrid with oracle. Justification: Flexible, cheap to iterate, no gas for ML.
- Frontend: 1st React + TypeScript, 2nd Vue + TypeScript. Justification: Best Web3 libraries (Wagmi, RainbowKit).
- Smart contract platform: 1st Ethereum/EVM, 2nd Solana. Justification: Largest ecosystem, free testnets.
- UI design: 1st Material Design 3, 2nd Tailwind. Justification: Consistent, professional, minimal effort.
- Fraud model: 1st Random Forest, 2nd XGBoost. Justification: Interpretable, SHAP-friendly, fast.
- XAI method: 1st SHAP, 2nd LIME. Justification: Standard in finance research.

Full details in Documentation/DECISION_JUSTIFICATION_PLAN.md.


8. Current Status and Timeline

8.1 Completed

- Smart contract: Complete, tested
- Frontend UI: Complete (all pages, responsive)
- Wallet connect: MetaMask, WalletConnect
- Demo mode: Demo Bank, Demo User role switcher
- AI/ML UI: Risk dashboard, XAI, RL cards (mock data)

8.2 In Progress

- AI/ML backend: Planned (Python, FastAPI)
- Contract deployment: Requires deployment to testnet


9. Future Work and Research Scope

9.1 Product Extensions

Repayment schedules, partial repayments, late fees; multi-asset support (ERC-20, stablecoins); credit history view; notifications.

9.2 AI/ML Research

Production fraud model with evaluation; wallet anomaly detection; smart contract attack lab; RL experiments; federated or privacy-preserving learning.

9.3 Scalability

Multi-chain deployment; off-chain analytics warehouse; microservice decomposition; caching and message queues.


10. References

The project is supported by academic literature on:

- DeFi lending (Compound, Aave)
- ML fraud detection in blockchain
- Explainable AI (SHAP, LIME) in lending
- Reinforcement learning for lending policy
- Smart contract attack detection

Full references: Documentation/RESEARCH_LINKS.txt.


Appendix A: How to Run the Demo

Quick start (no deployment)
1. npm install; cd frontend && npm install; cd frontend && npm run dev
2. Open http://localhost:5173
3. Click Demo Bank or Demo User in the top bar
4. Explore Bank panel (1M ETH reserve, approvals) or User flows (deposit, request loan)

Full demo with blockchain
1. Deploy: npx hardhat run scripts/deploy.ts --network sepolia
2. Copy address from deployment-info.json
3. Create frontend/.env with VITE_CONTRACT_ADDRESS set to the deployed contract address
4. Restart frontend, connect wallet, use real deposits and loans


Appendix B: File Structure

- contracts/WorldBankReserve.sol
- scripts/deploy.ts, copy-abi.ts
- test/WorldBankReserve.test.ts
- frontend/src: pages, components, hooks, config, context
- Documentation: PROJECT_OVERVIEW_FOR_PROFESSOR.md, USE_CASE_AND_DATAFLOW_DIAGRAMS.md, DECISION_JUSTIFICATION_PLAN.md, RESEARCH_LINKS.txt
- hardhat.config.ts, package.json


End of Report

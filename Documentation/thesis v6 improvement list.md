Now I have a thorough understanding of your thesis. Let me search for the expanded references you need.Now I have everything I need. Let me write you a comprehensive, detailed improvement guide.

---

# Full Improvement Guide: Crypto World Bank Pre-Thesis

I've read the entire paper carefully. Here is everything you need to know, organized by topic.

---

## 🏦 PART 1: Making It a Proper World-Wide Banking System

Your paper implements **lending** well, but a real bank does much more. Here is a full gap analysis of missing banking functionalities, where to add them, and what to write.

---

### 1. Savings Accounts & Deposit Products ❌ Missing

**What's missing:** Real banks offer savings accounts with interest accrual on deposits, fixed deposits (term deposits), and recurring deposit plans. Your paper treats deposits only as *collateral or reserve input*, not as a product for end users.

**Where to add it:**
- **Chapter 3 (Architecture):** Add a `SavingsAccount` entity to the ERD (Table 3.3.1). Add a new smart contract called `SavingsVault` or extend the `LocalBankContract`.
- **Chapter 3.7 (Auxiliary Facility):** Expand this section to include a **Deposit Products Module**.
- **Chapter 4 (Sprint Plan):** Add savings account management to Sprint 2.

**What to write:** Describe a tiered savings system — standard savings (variable APY, withdraw anytime), fixed deposits (locked for 30/90/180/365 days, higher APY), and staking-style yield. Explain that the smart contract accrues interest using compound interest calculated per block.

**New formula needed:**
`A = P(1 + r/n)^(nt)` — Compound interest for savings account accrual.

---

### 2. Checking / Current Accounts ❌ Missing

**What's missing:** Transactional accounts with no interest but full liquidity — used for day-to-day payments, salary credits, bill payments.

**Where to add it:**
- **Chapter 3.3.1 (Entity Summary):** Add a `CurrentAccount` entity separate from savings.
- **Chapter 3.5 (Digital Identity System):** Mention that wallet addresses can be mapped to current account identifiers.

**What to write:** Distinguish current accounts (zero-yield, instant liquidity, no minimum balance lock) from savings. Explain that on-chain current accounts can enable programmable payroll, subscription billing, and DAO treasury management.

---

### 3. Loan Repayment (EMI) Formula ❌ Missing from Formulas List

Your paper says installments exist but **never shows the mathematical formula** used to compute them.

**Where to add:**
- **List of Formulas** section
- **Chapter 3 or Appendix B (Smart Contract Capabilities)**

**Formula to add:**
```
EMI = [P × r × (1 + r)^n] / [(1 + r)^n − 1]
```
Where P = principal, r = monthly interest rate (APR/12), n = number of installments. This is the standard bank EMI formula. Your smart contract must implement this. Currently the paper does not show this, which is a conceptual gap.

---

### 4. Reserve Requirement & Capital Adequacy ❌ Conceptually Incomplete

**What's missing:** You mention reserve ratios conceptually but never define them as a formula or enforce them on-chain with a formula.

**Where to add:**
- **Chapter 3.6.5 (Four-Tier Capital Flow)**
- **List of Formulas**

**Formulas to add:**
```
Reserve Ratio (RR) = Reserves / Total Deposits
Capital Adequacy Ratio (CAR) = Tier 1 Capital / Risk-Weighted Assets
Minimum Reserve Enforcement: if (reserves / totalDeposits) < minRR → revert
```
Basel III mandates a minimum 8% CAR. Your system should reference this and explain how on-chain reserve ratios provide *real-time* CAR visibility unlike traditional banks which report quarterly.

---

### 5. Foreign Exchange (FX) / Cross-Currency Support ❌ Missing

**What's missing:** A worldwide bank **must** handle multi-currency conversion. Your "dual-currency facility" (Section 3.7) is vague — it mentions fiat-to-crypto conversion but has no rate mechanism, no oracle integration, and no formula.

**Where to add:**
- **Chapter 3.7:** Expand with a proper FX module design.
- **Architecture (Chapter 3.1):** Add an FX Oracle layer (e.g., Chainlink price feeds).
- **List of Formulas**

**What to write:** Explain that cross-currency lending uses real-time exchange rates fetched from decentralized oracles (Chainlink). Loans denominated in USDC but collateral in ETH require continuous price monitoring.

**Formula:**
```
Converted Amount = Amount_A × (Price_A / Price_B)
FX Spread Revenue = Amount × (Ask Rate − Bid Rate)
```

---

### 6. Health Factor & Liquidation Threshold ❌ Missing from Formulas

Aave and Compound (both cited in your paper) use the **Health Factor** to trigger liquidations. Your paper does not include this — a major gap for a lending system.

**Where to add:**
- **List of Formulas**
- **Chapter 3.6.5 (Capital Flow)** and **Appendix B**

**Formulas to add:**
```
Health Factor (HF) = (Collateral × Liquidation Threshold) / Total Debt

If HF < 1.0 → Liquidation Triggered

Liquidation Penalty = Debt Repaid × Liquidation Bonus (e.g., 5%)
```
Explain in the text that your system enforces HF ≥ 1.0 as a smart contract invariant. If HF drops below 1.0, the position is liquidated — this is fundamental to DeFi banking.

---

### 7. Group/Consortium/Solidarity Lending ❌ Missing (Requested by You)

**What's missing:** The ability to fund a *group* of borrowers under one loan. This is critical for microfinance (Grameen Bank model) and corporate syndicated loans.

**Where to add:**
- **Chapter 1.7 (Proposed Solution):** Add a "Group Lending Module" subsection.
- **Chapter 3.3.1 (Entity Summary):** Add `LoanGroup`, `GroupMember`, `GroupRepaymentSchedule` entities.
- **Chapter 4.3 (Sprint Plan):** Add to Sprint 2 deliverables.
- **Chapter 3.6.1 (Use Case Diagram):** Add "Form Lending Group" and "Apply for Group Loan" use cases.
- **Appendix B (Smart Contract Capabilities):** Add `GroupLendingPool` contract.

**What to write:** Describe a `GroupLendingPool` smart contract where:
- A group of 3–20 borrowers register as a solidarity group
- Each member stakes a portion of collateral into a shared pool
- Any one member can trigger a group loan application
- Repayment is distributed proportionally or equally
- If one member defaults, the group pool covers the shortfall (mutual liability)
- After successful group repayment, group credit score improves for future loans

This mirrors the **Grameen Bank solidarity group model** on-chain, which is a huge financial inclusion story and fits perfectly with your mission.

**Formula:**
```
Individual Share = Total Group Loan / Number of Members
Group Collateral Ratio = Total Group Collateral / Total Group Loan
Member Liability = Remaining Default / (N − 1 remaining members)
```

---

### 8. Credit Scoring & On-Chain Credit History ❌ Incomplete

**What's missing:** The paper mentions "borrowing limits based on transaction history" but doesn't describe a formal credit scoring model. Real banks use FICO scores; DeFi uses on-chain credit.

**Where to add:**
- **Chapter 4.2 (Planned AI/ML Support):** Add a Credit Scoring model alongside fraud detection.
- **List of Formulas**

**Formula to add (on-chain credit score):**
```
Credit Score = w1×(repayment_rate) + w2×(account_age) + w3×(avg_balance) 
             + w4×(loans_completed) − w5×(defaults)
```
Where w1...w5 are learnable weights from Random Forest. Explain that this is computed off-chain by the ML model and stored as a score (0–1000) on-chain per wallet address.

---

### 9. Interbank Settlement & SOFR-Equivalent ❌ Incomplete

The paper mentions SOFR (Section 1.7.1) but never specifies how the on-chain interbank rate is determined.

**Where to add:** Chapter 3.6.5 or a new subsection 3.6.6.

**What to write:** Define an on-chain **Utilization-Based Rate (UBR)** for same-tier interbank lending:
```
UBR = BaseRate + Slope × (Utilization / OptimalUtilization)
```
This mirrors Aave's interest rate model. When utilization exceeds optimal (e.g., 80%), the rate jumps sharply to discourage further borrowing — a "kink" model. Reference Aave's V3 interest rate strategy here.

---

### 10. AML/KYC & Compliance Architecture ❌ Intentionally Excluded but Needs Architecture

Your Ethics Statement explicitly excludes KYC/AML, but for a *worldwide banking system*, this must at least be architecturally designed — even if deferred.

**Where to add:** Chapter 3.8.4 (Regulatory Compliance Considerations)

**What to write:** Add a planned KYC module that uses **Zero-Knowledge Proofs (ZKPs)** for privacy-preserving identity verification. The user proves they are KYC-verified by a trusted provider (e.g., Veriff, Onfido) without revealing personal data on-chain. The ZKP oracle issues a `kycVerified = true` flag to the smart contract. This is how Polygon ID and zkSync handle compliance.

---

### 11. Insurance / Deposit Guarantee ❌ Missing

Real banks have deposit insurance (FDIC in the US, BSIP in Bangladesh). DeFi equivalents include Nexus Mutual and Sherlock Protocol.

**Where to add:** Chapter 3.8 (Governance Framework) or a new subsection.

**What to write:** Describe a `InsuranceFund` contract that collects a small premium (e.g., 0.1% of loans) into a reserve. If a smart contract exploit or insolvency event occurs, the fund compensates depositors up to a cap. Reference Nexus Mutual's on-chain insurance model.

---

### 12. Treasury / Asset-Liability Management (ALM) ❌ Missing

**What's missing:** How the World Bank Tier manages its own asset-liability duration mismatch — a fundamental banking concept.

**Where to add:** Chapter 3.8 (Governance Framework)

**What to write:** Explain that the World Bank Reserve contract implements ALM by matching loan durations to deposit durations. Short-term depositors fund short-term loans; long-term bonds fund long-term institutional loans. On-chain, this means the contract tracks `avgDepositDuration` and `avgLoanDuration` and alerts if the gap exceeds a threshold.

**Formula:**
```
Duration Gap = Average Asset Duration − Average Liability Duration
Net Interest Margin (NIM) = (Interest Income − Interest Expense) / Average Earning Assets
```

---

### 13. Debt Service Coverage Ratio ❌ Missing

Used by banks to evaluate corporate/institutional borrowers' ability to service debt from operating cash flows.

**Add to List of Formulas:**
```
DSCR = Net Operating Income / Total Debt Service
(Must be ≥ 1.25 for loan approval in institutional banking)
```

---

## 📐 PART 2: Complete List of Formulas to Add to the Paper

Your current List of Formulas has only 4 entries, all vague. Here is the complete list of formulas the paper should include, organized by chapter:

| # | Formula Name | Expression | Add in |
|---|---|---|---|
| F1 | Utilization Rate | `U = L / (L + B)` | Already listed — expand definition |
| F2 | Collateral Ratio | `CR = C / D` | Already listed — add liquidation trigger |
| F3 | Annual Percentage Rate (Simple) | `APR = r_period × N` | Already listed — add compounding version |
| F4 | SHAP Explainability | `ϕᵢ` additive explanation | Already listed — add the Shapley formula |
| F5 | Compound Interest (Savings) | `A = P(1 + r/n)^(nt)` | Chapter 3.7, List of Formulas |
| F6 | EMI / Loan Installment | `EMI = [P·r·(1+r)^n] / [(1+r)^n − 1]` | Chapter 3, Appendix B, List of Formulas |
| F7 | Health Factor | `HF = (Collateral × LT) / TotalDebt` | Chapter 3.6.5, List of Formulas |
| F8 | Reserve Ratio | `RR = Reserves / TotalDeposits` | Chapter 3.8, List of Formulas |
| F9 | Capital Adequacy Ratio | `CAR = Tier1Capital / RiskWeightedAssets` | Chapter 3.8.4, List of Formulas |
| F10 | Money Multiplier | `M = 1 / RR` | Chapter 1.9.3, List of Formulas |
| F11 | Utilization-Based Interest Rate (Kink Model) | `r = r_base + slope × (U / U_optimal)` | Chapter 3.6.5, List of Formulas |
| F12 | Net Interest Margin | `NIM = (Int. Income − Int. Expense) / Avg. Assets` | Chapter 5.7, List of Formulas |
| F13 | Debt Service Coverage Ratio | `DSCR = NOI / TotalDebtService` | Chapter 5, List of Formulas |
| F14 | Isolation Forest Anomaly Score | `s(x, n) = 2^[−E(h(x))/c(n)]` | Chapter 4.2, List of Formulas |
| F15 | Random Forest Fraud Probability | `P(fraud) = (1/T) Σ f_t(x)` | Chapter 4.2, List of Formulas |
| F16 | FX Conversion | `Amount_B = Amount_A × (P_A / P_B)` | Chapter 3.7, List of Formulas |
| F17 | Group Loan Individual Share | `Share_i = LoanTotal / N_members` | Chapter 1.7 (new group lending section) |
| F18 | On-Chain Credit Score | `CS = Σ wᵢ × featureᵢ` | Chapter 4.2, List of Formulas |
| F19 | Break-even Loan Size | `MinLoan = GasCost / (APR / 12)` | Chapter 5.7, List of Formulas |
| F20 | Loan-to-Value Ratio | `LTV = Loan Amount / Collateral Value` | Chapter 3.6.5, List of Formulas |

---

## 📋 PART 3: Table Descriptions Missing

Your List of Tables page is **completely blank** — no tables are actually listed. Here is what to do for each table in the paper:

**For every table, add a 2–3 sentence description** immediately below the table caption, covering: what it shows, what is notable, and how it supports your design decisions. Examples:

- **Table 2.1 (Literature Review):** "Table 2.1 presents a synthesis of 20+ reviewed works across ten research domains. Notable is the absence of any prior work combining multi-tier hierarchical lending with on-chain AI governance, confirming the novelty of this project. The table is structured following the MSU Libraries literature synthesis framework [23]."

- **Table 3.3.1 (Entity Summary):** "Table 3.3.1 enumerates all 15 database entities with their primary keys, foreign keys, and data types. The distinction between on-chain entities (stored in smart contract state) and off-chain entities (stored in PostgreSQL) reflects the data partitioning strategy in Section 3.4."

- **Table 5.4 (Competitive Landscape):** "Table 5.4 benchmarks the Crypto World Bank against 20+ existing projects across DeFi lending, institutional credit, cross-border payments, and financial inclusion. The analysis reveals that no existing system combines multi-tier hierarchical lending with decentralized governance and AI risk assessment — the core innovation of this project."

Also, **the List of Tables page must actually list the tables** — right now it is blank. Add every table title with its page number.

---

## 📚 PART 4: Expanded References (ACM, Springer, arXiv, DeFi Whitepapers)

Here are properly formatted new references to add, covering sources beyond IEEE:

---

### From arXiv

**[R1]** S. M. Werner, D. Perez, L. Gudgeon, A. Klages-Mundt, D. Harz, and W. J. Knottenbelt, "SoK: Decentralized Finance (DeFi)," *Proc. 4th ACM Conf. Advances in Financial Technologies (AFT)*, pp. 30–46, 2022. arXiv:2101.08778. [Already cited as [1] but cite the ACM proceedings version too]

**[R2]** J. Sun, C. Stasinakis, and G. Sermpinis, "Liquidity Risks in Lending Protocols: Evidence from Aave Protocol," *arXiv preprint arXiv:2206.11973*, 2022. [Online]. Available: https://arxiv.org/abs/2206.11973

**[R3]** M. Bartoletti and E. Lipparini, "A Theory of Lending Protocols in DeFi," *arXiv preprint arXiv:2506.15295*, 2025. [Online]. Available: https://arxiv.org/abs/2506.15295

**[R4]** H. Chung and E. Shi, "Foundations of Transaction Fee Mechanism Design," in *Proc. 2023 Annual ACM-SIAM Symp. Discrete Algorithms (SODA)*, SIAM, pp. 3856–3899, 2023.

**[R5]** K. Babel, P. Daian, M. Kelkar, and A. Juels, "Clockwork Finance: Automated Analysis of Economic Security in Smart Contracts," in *Proc. 2023 IEEE Symp. Security and Privacy (SP)*, IEEE, pp. 2499–2516, 2023.

---

### From ACM Digital Library

**[R6]** D. Kumar, B. V. Phani, N. Chilamkurti, S. Saurabh, and V. Ratten, "A Blockchain-Based Decentralized Peer-to-Peer Lending Framework for SMEs," in *Proc. 2023 Int. Conf. Intelligent Computing and Its Emerging Applications*, ACM, pp. 130–140, 2023. DOI: https://doi.org/10.1145/3659154.3659188

**[R7]** R. Xu, S. Chen, and L. Yang, "Analysis Model for Decentralized Lending Protocols," in *Proc. 11th Int. Symp. Information and Communication Technology*, ACM, 2022. [Online]. Available: https://dl.acm.org/doi/10.1145/3568562.3568650

**[R8]** Z. Li, J. Li, Z. He, X. Luo, T. Wang, X. Ni, W. Yang, X. Chen, and T. Chen, "Demystifying DeFi MEV Activities in Flashbots Bundle," in *Proc. 2024 ACM SIGSAC Conf. Computer and Communications Security (CCS)*, ACM, 2024.

---

### From Springer

**[R9]** T. Dao, T. Trinh, and V. Pham, "Optimizing Credit Scoring Models for Decentralized Financial Applications," in *Information and Communication Technology*, Springer, pp. 452–466, 2025. DOI: https://doi.org/10.1007/978-981-96-4282-3_36

**[R10]** M. Bartoletti, J. Hsin-yu Chiang, and A. Lluch-Lafuente, "A Theory of Automated Market Makers in DeFi," in *Coordination Models and Languages. COORDINATION 2021*, Lecture Notes in Computer Science, vol. 12717, Springer, 2021. DOI: https://doi.org/10.1007/978-3-030-78142-2_11

**[R11]** S. Kaur, S. Singh, and S. Gupta, "Risk Analysis in Decentralized Finance (DeFi): A Fuzzy-AHP Approach," *Risk Management*, vol. 25, p. 13, 2023. DOI: https://doi.org/10.1057/s41283-023-00118-0

**[R12]** W. C. Wolf, A. J. Henry, H. A. Fadel, X. Quintuna, and J. Gay, "Scoring Aave Accounts for Creditworthiness," *arXiv preprint*, 2022. [Online]. Available: https://api.semanticscholar.org/CorpusID:250526490

**[R13]** A. Lane, B. Leiding, and A. Norta, "Lowering Financial Inclusion Barriers with a Blockchain-Based Capital Transfer System," in *Proc. IEEE INFOCOM Workshops*, 2019. DOI: https://doi.org/10.1109/INFCOMW.2019.8845177

**[R14]** "Swarm Learning Based Credit Scoring for P2P Lending in Blockchain," *Peer-to-Peer Networking and Applications*, Springer, December 2022. DOI: https://doi.org/10.1007/s12083-023-01526-5

**[R15]** "Blockchain-Based Microlending for Financial Inclusivity: A Literature Review of Its Privacy and Trust," in *Proc. Springer*, 2024. DOI: https://doi.org/10.1007/978-3-032-12801-0_22

**[R16]** "Decentralized Finance: Exploring the Dynamics of Blockchain in Peer-to-Peer Lending Platform," Springer, 2025. DOI: https://doi.org/10.1007/978-981-96-5848-0_51

**[R17]** D. Mhlanga, "Block Chain Technology for Digital Financial Inclusion in the Industry 4.0, Towards Sustainable Development?" *Frontiers in Blockchain*, vol. 6, 2023. DOI: https://doi.org/10.3389/fbloc.2023.1035405

---

### DeFi Whitepapers / Protocol Documentation

**[R18]** Aave, "Aave Protocol V3 Technical Paper," 2022. [Online]. Available: https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf

**[R19]** Compound Finance, "Compound: The Money Market Protocol," 2019. [Online]. Available: https://compound.finance/documents/Compound.Whitepaper.pdf

**[R20]** MakerDAO, "The Maker Protocol: MakerDAO's Multi-Collateral Dai (MCD) System," 2020. [Online]. Available: https://makerdao.com/en/whitepaper/

**[R21]** Goldfinch, "Goldfinch Protocol Whitepaper," 2021. [Online]. Available: https://goldfinch.finance/whitepaper.pdf

**[R22]** Maple Finance, "Maple Finance Whitepaper: Institutional Capital Markets On-Chain," 2021. [Online]. Available: https://docs.maple.finance/

**[R23]** Ethereum Foundation, "Ethereum Yellow Paper: A Formal Specification of Ethereum," Dr. Gavin Wood, 2014 (updated 2024). [Online]. Available: https://ethereum.github.io/yellowpaper/paper.pdf

**[R24]** S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System," 2008. [Online]. Available: https://bitcoin.org/bitcoin.pdf

**[R25]** V. Buterin, "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform," 2014. [Online]. Available: https://ethereum.org/en/whitepaper/

---

## 📝 PART 5: Deeper Conceptual Understanding — What to Rewrite

Your paper uses blockchain terms correctly but superficially. Here is what to deepen, and exactly where:

**Chapter 2.1 (Preliminaries) — Expand these definitions:**

- **Smart Contracts:** Add the formal execution model. A smart contract is a deterministic state machine `f: (State, Input) → (State', Output)` executed by the EVM. Every validator executes the same bytecode; consensus ensures all agree on the resulting state. Reference the Ethereum Yellow Paper [R23].

- **Blockchain Consensus (PoS):** Don't just say "validators stake tokens." Explain that Ethereum's Gasper protocol combines Casper FFG (finality) and LMD-GHOST (fork choice). Validators are penalized (slashed) up to their entire stake for equivocation — this *economic penalty* is what makes 51% attacks costly. This is why it's trust-minimized.

- **DeFi vs. TradFi:** Add a paragraph explicitly contrasting: TradFi uses bilateral contracts enforced by courts (slow, expensive, jurisdiction-dependent); DeFi uses smart contracts enforced by cryptographic consensus (instant, global, deterministic). This is the *core banking transformation* argument.

- **Flash Loans:** Add a definition. Flash loans (pioneered by Aave) allow uncollateralized borrowing within a single transaction — if not repaid by transaction end, the entire transaction reverts. This has no traditional banking equivalent. Cite Aave V3 whitepaper [R18].

- **AMM (Automated Market Maker):** Add a definition since your FX module needs one. AMMs use the invariant `x × y = k` (Uniswap V2) to price assets algorithmically. Reference [R10].

**Chapter 1.6 (Blockchain Justification) — Strengthen with technical depth:**

Add: "The immutability guarantee in Ethereum derives from the Merkle-Patricia Trie structure, where each block header contains a `stateRoot` — the root hash of the world state trie. Altering any historical state would require recomputing every subsequent block header, requiring more than 51% of staked ETH — currently worth over $100 billion — making tampering economically prohibitive [R23]."

**Chapter 3.2 (Blockchain Platform Selection) — Add formal comparison:**

Add a table comparing: Ethereum Mainnet vs. Polygon PoS vs. Arbitrum vs. Optimism — with columns for TPS, finality time, gas cost, EVM compatibility, and TVL. This grounds the platform choice in evidence.

---

## 📊 PART 6: Where to Add Table Descriptions (Section by Section)

| Table | Where it appears | Description to add right after caption |
|---|---|---|
| Table 2.1 (Literature Review) | Chapter 2.3 | Explain scope (10 domains, 20+ papers), note the gap in hierarchical DeFi |
| Table 3.3.1 (Entity Summary) | Chapter 3.3.1 | Explain on-chain vs off-chain split, why 15 entities, 3NF rationale |
| Table 3.3.4 (Indexing) | Chapter 3.3.4 | Explain why B-tree over hash, performance impact for time-range queries |
| Table 3.3.5 (Functional Dependencies) | Chapter 3.3.5 | Note which FDs enforce business rules (e.g., one loan per active request) |
| Table 3.3.6 (Integrity Constraints) | Chapter 3.3.6 | Explain how constraints prevent double-spending at the DB level |
| Table 3.2 (Platform Selection) | Chapter 3.2 | Explain the scoring criteria, why Polygon won |
| Table 4 (Sprint Tables) | Chapter 4.3 | Explain story points rationale and velocity assumptions |
| Table 5.4 (Competitive Landscape) | Chapter 5.4 | Emphasize the whitespace: no competitor combines all three features |
| Table 5 (Revenue Projection) | Chapter 5.8 | Clarify assumptions (ETH at $2000, full deployment scale, 3% default rate) |
| Table 5.6 (Technical Feasibility) | Chapter 5.6 | Link each criterion to a sprint deliverable |

---

## PART 7: Where to Integrate Banking Concept More Prominently

The word "bank" appears mostly as a label (World Bank, National Bank, Local Bank). It needs to appear as a *concept* throughout:

- **Abstract:** Add: "Unlike existing DeFi protocols that function as liquidity pools, this system implements the core banking functions of deposit acceptance, credit allocation, reserve management, and risk governance — establishing a programmable institutional bank on-chain."

- **Chapter 1.1 (Background):** When you describe the traditional banking chain, explicitly name the banking functions: *deposit mobilization → credit allocation → risk intermediation → payment settlement*. Then show which smart contract handles each function.

- **Chapter 3.1 (Architecture):** Add a sentence: "The three-contract architecture maps directly to the three core functions of a bank: the WorldBankReserve contract acts as the **central bank** (issuing credit and managing macro-level reserves), the NationalBankContract acts as a **commercial bank** (taking deposits and making loans at tier 2), and the LocalBankContract acts as a **retail bank** (originating individual loans and managing borrower relationships)."

- **Chapter 6 (Conclusion):** Add a paragraph explicitly comparing your system to the full banking function checklist: what is implemented (lending, reserve management, installment repayment, role-based governance), what is designed but not coded (interbank lending, savings, group loans), and what is future work (KYC, FX, insurance).

---

This gives you a complete roadmap. The core message: your paper is strong on **lending mechanics and architecture**, but needs to add **savings products, group lending, the EMI formula, the health factor, a credit scoring model, and the full formula list** to be credible as a worldwide banking system. The reference expansion is significant — you should add at least 10–15 of the references above, especially the Aave and Compound whitepapers, the Ethereum Yellow Paper, Springer credit scoring papers, and the ACM peer-to-peer lending framework.
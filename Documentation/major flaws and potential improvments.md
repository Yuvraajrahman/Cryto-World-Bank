# Crypto World Bank — Major Flaws and Potential Improvements

This document provides a comprehensive audit of the Crypto World Bank project, identifying architectural, implementation, security, and documentation gaps with specific improvement recommendations for each.

---

## 1. Smart Contract Flaws

### 1.1 Reserve Balance Desynchronization

**Flaw:** `totalReserve` in `WorldBankReserve` is updated only through `depositToReserve` and disbursements. If ETH is sent to the contract via `selfdestruct` or forced transfer, `address(this).balance` increases without updating `totalReserve`, breaking loan accounting and statistics.
**Improvement:** Reconcile `totalReserve` with actual balance on critical paths, or implement a `receive()` function that rejects unexpected transfers.

### 1.2 No Liquidity Locking on Loan Requests

**Flaw:** `requestLoan` checks `amount <= totalReserve` but does not reserve liquidity for pending loans. Multiple borrowers can each request up to the full reserve; approvals will revert when actual balance is insufficient.
**Improvement:** Maintain a `reservedAmount` counter. Reduce available reserve on request submission and refund on rejection. Cap the sum of pending request amounts.

### 1.3 Unrestricted Emergency Withdrawal

**Flaw:** The owner can drain the full contract balance via `emergencyWithdraw` with no link to `totalReserve`, no pause requirement, and no on-chain accounting for depositor claims.
**Improvement:** Tie emergency withdrawal to audited formulas (excess over liabilities). Require pause + timelock or multisig approval. Force `totalReserve = 0` on execution and emit events for off-chain creditor handling.

### 1.4 Hierarchy Not Enforced On-Chain

**Flaw:** `NationalBank.borrowFromWorldBank` and `LocalBank.borrowFromNationalBank` only increment counters without actually calling `WorldBankReserve.lendToNationalBank`, pulling ETH, or verifying upstream liquidity. The four-tier hierarchy is not functionally enforced.
**Improvement:** Implement pull/push patterns with explicit authorization between tiers. Alternatively, acknowledge that hierarchy is off-chain only in the current prototype and remove stub functions that create a false security model.

### 1.5 No Repayment, Interest, Collateral, or Default Handling

**Flaw:** The paper describes APR tiers (3%/5%/8%) and installment flows, but contracts have no `repay` function, no interest accrual, no collateral management, and no default/liquidation rules. `LoanStatus.Paid` exists in the enum but is never used in state transitions.
**Improvement:** Implement repayment hooks with interest accrual logic. Add installment schedule generation, late payment penalties, and default handling aligned with the economic model described in the thesis.

### 1.6 No Bank Deregistration

**Flaw:** National and local banks can be registered but not deactivated. There is no mechanism to remove compromised or non-performing banks from the network.
**Improvement:** Add `deactivateNationalBank` / `deactivateLocalBank` functions with cascading access revocation. Consider `Ownable2Step` for admin transfer.

### 1.7 O(n) Admin Views

**Flaw:** `getPendingLoans` and `getStats` scan all loan IDs linearly, which becomes expensive as the loan count grows.
**Improvement:** Use an enumerable set or maintain a separate array of pending loan IDs. For production, use a subgraph (The Graph) for off-chain indexing.

### 1.8 Single-Owner Centralization

**Flaw:** Single `onlyOwner` / single `approver` is a single point of failure, inconsistent with the "decentralized" positioning. If the owner key is compromised, the entire system is compromised.
**Improvement:** Implement multisig (Gnosis Safe), role-separated pauser/executor, timelock on critical operations, or a DAO-based governance mechanism.

### 1.9 UviCoin Disconnected from Lending

**Flaw:** `UviCoin.sol` (ERC-20 with mint/faucet) is not referenced by any lending contract. The owner can mint without a hard cap beyond social trust.
**Improvement:** Either integrate as the lending denomination (replace ETH) or clearly scope UVI as a non-core branding/governance token. Document mint authority and supply constraints.

### 1.10 Insufficient Test Coverage

**Flaw:** Only `WorldBankReserve` has unit tests. No tests exist for `NationalBank`, `LocalBank`, or `UviCoin`.
**Improvement:** Write full unit + integration tests for the entire hierarchy, edge cases (zero-amount deposits, unauthorized operations, re-entrancy attacks), and failure modes.

### 1.11 Incomplete Deployment

**Flaw:** `deploy.ts` deploys only `WorldBankReserve`. National and local bank contracts are not deployed or wired.
**Improvement:** Create a deployment script that deploys and interconnects all three contracts with verified addresses.

---

## 2. Frontend Flaws

### 2.1 No Hierarchical Lending in UI

**Flaw:** Only `useWorldBankContract` / `WorldBankReserve` hooks are used. No hooks exist for `NationalBank` or `LocalBank`. The four-tier hierarchy described in the thesis is completely absent from the user interface.
**Improvement:** Implement contract hooks and UI flows for all four tiers. Add National Bank and Local Bank dashboards with tier-appropriate functionality.

### 2.2 MongoDB Features Not Used in Loan UX

**Flaw:** API functions like `createLoanRequest`, `getBorrowerLoans`, and `getPendingLoans` exist but `Loan.tsx` does not call them. Loans are entirely on-chain to `WorldBankReserve`. The off-chain institutional hierarchy does not drive the borrower flow.
**Improvement:** Integrate the MongoDB-backed loan flow with on-chain transactions. Use off-chain data for enrichment (borrower profiles, income verification) while on-chain data handles financial state.

### 2.3 Bank Registration Form Likely Broken

**Flaw:** `Register.tsx` uses `bank.national_bank_id` and `bank.local_bank_id`, but the API returns Mongo `_id`. `parseInt` is used for IDs, which is incorrect for MongoDB ObjectIds.
**Improvement:** Use `bank._id` as string in `MenuItem` value/key. Send string IDs to the API as the backend expects ObjectId.

### 2.4 Misleading AI/ML Security UX

**Flaw:** Dashboard shows hardcoded chips ("3 Threats Blocked Today", "94% Detection Rate"). `analyzeFraudRisk` in `Loan.tsx` is a hand-tuned heuristic, not the Python ML model. `Admin.tsx` fraud scores are thresholds on loan amount. `RiskDashboard` displays mock data.
**Improvement:** Either label as demo/mock prominently, or wire the `ml-backend` FastAPI service and show live metrics with data provenance indicators.

### 2.5 ML Backend Not Integrated

**Flaw:** No frontend calls to FastAPI `/api/fraud/check-loan`. The default `npm run dev` script runs frontend + Express only, not the FastAPI ML service.
**Improvement:** Add API proxy configuration and integrate fraud check calls into the loan approval workflow. Update dev scripts to optionally start the ML backend.

### 2.6 Advertised Features Not Implemented

**Flaw:** Chat, income verification, and installment payment UI are not implemented despite being listed as features. `ServicesSection` on Dashboard advertises trading, staking, mining, custody, insurance — none of which exist.
**Improvement:** Remove or label unimplemented features as "Coming Soon." Implement core features (installments, chat, income verification) before advertising them.

### 2.7 Demo Mode Weakens Security Story

**Flaw:** `DemoModeContext` + `useRole` allow anyone to simulate "bank" role without being the contract owner. Academic readers may conflate demo RBAC with production security.
**Improvement:** Add clear visual indicators when in demo mode. Document the distinction between demo role simulation and production on-chain RBAC.

### 2.8 No Route Guards

**Flaw:** `/admin` relies on on-chain owner check + demo mode. `/risk` uses `useRole` only. No centralized access control or meaningful messaging when contract address is zero.
**Improvement:** Implement proper route guards with clear error messaging. Centralize access control logic.

---

## 3. Backend Flaws

### 3.1 No Authentication or Authorization

**Flaw:** Any client can hit `/api/`* and supply arbitrary `walletAddress` or `bankUserId`. Approve/reject endpoints trust `bankUserId` from the request body without wallet signature verification or session validation.
**Improvement:** Implement Sign-In with Ethereum (SIWE) for wallet-based authentication. Add JWT/session tokens for API authorization. Verify bank user matches the loan's assigned bank.

### 3.2 Permissive CORS

**Flaw:** `app.use(cors())` allows any origin by default.
**Improvement:** Restrict CORS to known frontend origins in all non-development environments.

### 3.3 Borrowing Limits Never Written

**Flaw:** `borrowing_limits` collection is only read, never written. No seed data or route populates it, so limits remain at zero defaults.
**Improvement:** Implement borrowing limit calculation based on transaction history (6-month/1-year rolling windows) as described in the thesis.

### 3.4 Installments and Chat Are Schema-Only

**Flaw:** `migrate.js` creates indexes for `installments` and `chat_messages`, but no routes implement payment schedules or messaging functionality.
**Improvement:** Implement REST endpoints for installment schedule generation, payment recording, and chat messaging.

### 3.5 Arbitrary Loan Rules

**Flaw:** `isInstallment = amount >= 100` uses a threshold described as "100 ETH" but amounts are plain floats. This is inconsistent with MATIC-first UI and unrealistic for testnet scenarios.
**Improvement:** Make thresholds configurable. Use realistic values for the target denomination. Add unit documentation to amount fields.

### 3.6 Incomplete Transaction Verification

**Flaw:** `verifyTransaction` only checks `getTransaction(txHash)` existence, not receipt success, chain ID, or target contract verification.
**Improvement:** Use `getTransactionReceipt` to verify success status. Validate chain ID and contract address in the receipt logs.

### 3.7 Dual Schema Confusion

**Flaw:** `backend/src/database/schema.sql` suggests a MySQL-style relational schema while the running app uses MongoDB. This creates documentation and onboarding confusion.
**Improvement:** Remove the SQL schema file or clearly label it as "reference design." Consolidate on MongoDB with documented collection schemas.

### 3.8 Single Database Connection (SPOF)

**Flaw:** `getDB()` singleton uses a single MongoDB connection with no replica set or health-based failover.
**Improvement:** Configure MongoDB replica set connection string. Add connection health monitoring and automatic reconnection logic.

---

## 4. ML Backend Flaws

### 4.1 Not Part of Default Application Stack

**Flaw:** The ML backend is not started by `npm run dev` and is not integrated with the main application flow.
**Improvement:** Add ML backend to orchestration scripts. Create a health check endpoint and graceful degradation when ML service is unavailable.

### 4.2 Synthetic/Default Feature Handling

**Flaw:** `check_loan_fraud` fills missing features with hardcoded defaults (e.g., wallet_age = 45 days). Training data may not match production distributions.
**Improvement:** Document required features. Return confidence intervals alongside predictions. Flag predictions made with defaulted features. Use production-representative training data.

### 4.3 Missing Isolation Forest and RL

**Flaw:** The thesis and README cite Isolation Forest and Reinforcement Learning, but only Random Forest + optional SHAP is implemented as an API endpoint.
**Improvement:** Implement Isolation Forest for anomaly detection and expose as a separate API endpoint. Scope RL as future work and document clearly.

---

## 5. Architecture Flaws

### 5.1 On-Chain Scalability

**Flaw:** Linear scans in view functions. Unbounded arrays (`nationalBankAddresses`, `localBankAddresses`) returned in full, which will fail at scale.
**Improvement:** Implement pagination. Use The Graph for indexed querying. Limit on-chain views to essential real-time data.

### 5.2 No Event Pipeline

**Flaw:** README mentions an event listener for syncing chain events to the database, but no durable listener exists in the backend.
**Improvement:** Implement an event listener service using ethers.js or web3.js that subscribes to contract events and syncs state to MongoDB. Add resilience (block number tracking, replay on restart).

### 5.3 Split Brain: Two Sources of Truth

**Flaw:** Banks and users exist in MongoDB. Roles on-chain are only `WorldBankReserve` owner. There is no reconciliation between the two data sources, creating potential for inconsistent state.
**Improvement:** Designate blockchain as the authoritative source for financial state and MongoDB for supplementary data. Implement reconciliation checks that flag discrepancies.

### 5.4 Third-Party RPC Dependency

**Flaw:** Default public RPCs (Mumbai/Sepolia) are rate-limited and single-vendor, creating reliability risks.
**Improvement:** Use redundant RPC providers (Alchemy, Infura, QuickNode). Implement RPC fallback logic. Consider self-hosted nodes for production.

### 5.5 Polygon Mumbai Sunset

**Flaw:** Hardhat config and README still target Polygon Mumbai (chain ID 80001), which has been deprecated.
**Improvement:** Migrate to Polygon Amoy testnet or focus exclusively on Ethereum Sepolia. Update all configuration and documentation.

---

## 6. Thesis Document vs. Implementation Gaps

### 6.1 Four-Tier On-Chain Lending Claim

**Flaw:** The thesis describes "four-tier, on-chain lending architecture" and a "unified smart contract environment," but Tier 2-3 contracts are not deployed from the main deploy script, and their borrow functions are stubs that do not interact with the reserve contract.
**Improvement:** Either implement the full on-chain hierarchy or clearly scope the current prototype as Tier 1 only, with Tiers 2-4 as designed but not yet integrated.

### 6.2 InterBankLendingPool and Multi-Directional Flows

**Flaw:** The thesis describes same-tier lending via `InterBankLendingPool` and upward lending mechanics. Neither exists in the codebase.
**Improvement:** Implement the interbank lending pool contract or explicitly document it as future work in the thesis.

### 6.3 FastAPI as Primary Backend

**Flaw:** The thesis sprint stack lists FastAPI as the backend technology, but the actual integrated backend is Express.js. FastAPI exists only under `ml-backend/` as an auxiliary service.
**Improvement:** Align the thesis description with reality: Express.js for the main API, FastAPI for the ML inference service.

### 6.4 Economic Model Not Implemented

**Flaw:** The thesis describes specific APR tiers (3%/5%/8%), origination fees (0.25%), and late payment penalties. None of these are implemented in smart contracts or backend logic.
**Improvement:** Implement at least basic interest calculation in the smart contracts. Add configurable rate parameters aligned with the thesis economic model.

### 6.5 Revenue Projections Without Cost Model

**Flaw:** Revenue projections assume full deployment scale but do not account for gas costs, infrastructure costs, oracle fees, or default losses in a production environment.
**Improvement:** Add a cost model alongside revenue projections. Include break-even analysis for different deployment scales and network choices.

---

## 7. Security Concerns

### 7.1 No Reentrancy Protection on ETH Transfers

**Flaw:** While OpenZeppelin's `ReentrancyGuard` is imported, not all ETH-transferring functions may be protected.
**Improvement:** Audit all functions that send ETH (loan approval, emergency withdrawal, disbursements) for reentrancy protection. Use checks-effects-interactions pattern consistently.

### 7.2 No Rate Limiting

**Flaw:** Neither the smart contracts nor the backend API implement rate limiting, making the system vulnerable to spam attacks and denial-of-service.
**Improvement:** Add on-chain cooldown periods for loan requests. Implement API rate limiting middleware (e.g., express-rate-limit).

### 7.3 No Input Validation on Backend

**Flaw:** API endpoints accept arbitrary input without comprehensive validation or sanitization.
**Improvement:** Add input validation middleware (e.g., Joi, express-validator). Validate all wallet addresses, amounts, and IDs before processing.

### 7.4 No Audit Trail for Off-Chain Decisions

**Flaw:** The thesis claims "auditable support" for AI/ML decisions, but there is no logging, model versioning, or signed API response pipeline linking off-chain predictions to on-chain decisions.
**Improvement:** Implement signed prediction responses. Store prediction inputs, outputs, model version, and timestamp in an append-only log. Consider committing prediction hashes on-chain for auditability.

---

## 8. Improvement Priorities (Recommended Order)

1. **Critical:** Fix reserve desync, liquidity locking, and emergency withdrawal constraints
2. **Critical:** Implement basic authentication on backend API endpoints
3. **High:** Deploy and wire NationalBank + LocalBank contracts with WorldBankReserve
4. **High:** Implement repayment and interest accrual logic
5. **High:** Integrate ML backend with frontend loan approval flow
6. **Medium:** Add comprehensive test coverage for all contracts
7. **Medium:** Implement event listener for chain-to-database synchronization
8. **Medium:** Fix bank registration form and resolve MongoDB/SQL schema confusion
9. **Low:** Implement installments, chat, and income verification features
10. **Low:** Add multi-chain deployment support and gas optimization


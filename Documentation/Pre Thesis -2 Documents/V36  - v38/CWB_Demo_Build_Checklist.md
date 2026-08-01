# CWB Demo Build Checklist — Four-Tier Loan + Capital Flow

**Scope of this build:** client loan request (with NID/photo) → Local Bank review/approve → ETH disbursed to client → National Bank and World Bank dashboards showing reserve state, downward capital allocation, and upward voluntary funding.

**Phase mapping:** WorldBankReserve / NationalBank / LocalBank / RBAC / MockUSDC = Phase I Must (DT-I.01–04a). LoanController + hierarchical registration = Phase II Must (DT-II.01, DT-II.02, DT-II.07). UpwardDepositFacility = Phase II, not currently numbered in your register — track it as **DT-II.17**. Deferred out of this build: DT-II.03 (installment automation) and DT-II.04 (borrowing-limit enforcement) — neither appears in the demo, add them after.

---

## 1. Smart contracts (Solidity 0.8.20, Hardhat, OpenZeppelin AccessControl)

### 1.1 `WorldBankReserve.sol` — Phase I, DT-I.01
- [ ] Role: `WORLD_BANK_ADMIN`
- [ ] `registerNationalBank(address nationalBank, string countryCode)` — admin only
- [ ] `allocateCapital(address nationalBank, uint256 amount)` — admin only, sends ETH downward, emits `CapitalAllocated`
- [ ] `requestCapital(uint256 amount)` — callable by a registered National Bank's admin address, creates a pending request World Bank can approve via `allocateCapital`
- [ ] `reserveBalance() view returns (uint256)` — `address(this).balance`, feeds the Governor dashboard
- [ ] `getNationalBanks() view returns (address[])`
- [ ] Events: `NationalBankRegistered`, `CapitalAllocated`, `CapitalRequested`

### 1.2 `NationalBank.sol` — Phase I, DT-I.02
- [ ] Role: `NATIONAL_BANK_ADMIN`
- [ ] `registerLocalBank(address localBank)` — admin only — **this is also DT-II.07 (hierarchical registration)**
- [ ] `allocateCapital(address localBank, uint256 amount)` — admin only, downward
- [ ] `requestCapital(uint256 amount)` — forwards a capital request up to `WorldBankReserve`
- [ ] `balance() view returns (uint256)`
- [ ] `getLocalBanks() view returns (address[])`
- [ ] Events: `LocalBankRegistered`, `CapitalAllocated`, `CapitalRequested`

### 1.3 `LocalBank.sol` — Phase I, DT-I.03
- [ ] Role: `LOCAL_BANK_ADMIN` (approver)
- [ ] `registerClient(address client)` — admin only, or lazily on first loan request
- [ ] `requestCapital(uint256 amount)` — forwards a capital request up to `NationalBank`
- [ ] `freezeAccount(address client)` — admin only
- [ ] Deploys and owns one `LoanController` instance in its constructor — do **not** put loan logic directly in `LocalBank`
- [ ] Events: `ClientRegistered`, `AccountFrozen`

### 1.4 `LoanController.sol` — Phase II, DT-II.01 + DT-II.02, owned by `LocalBank`
- [ ] Role check: caller must hold `RETAIL_CLIENT` (request) or `LOCAL_BANK_ADMIN` (approve/reject/disburse) on the owning `LocalBank`
- [ ] `struct LoanRequest { address client; uint256 amount; bytes32 docHash; uint8 status; uint256 requestedAt; }` — status enum `Pending / Approved / Rejected / Disbursed`
- [ ] `requestLoan(uint256 amount, bytes32 docHash) returns (uint256 requestId)` — client only, emits `LoanRequested`
- [ ] `approveLoan(uint256 requestId)` — approver only, sets status `Approved`, emits `LoanApproved`
- [ ] `rejectLoan(uint256 requestId, string reason)` — approver only, emits `LoanRejected`
- [ ] `disburseLoan(uint256 requestId)` — approver only, transfers ETH to client, sets status `Disbursed`, emits `LoanDisbursed` — can be combined with `approveLoan` in one tx for the demo if you want fewer clicks on camera
- [ ] `getRequest(uint256 requestId) view returns (LoanRequest)`
- [ ] `getPendingRequests() view returns (uint256[])`

### 1.5 `UpwardDepositFacility.sol` — Phase II, new **DT-II.17**
- [ ] `depositUpward(address parentInstitution) payable` — callable by `NATIONAL_BANK_ADMIN` (parent = `WorldBankReserve`) or `LOCAL_BANK_ADMIN` (parent = `NationalBank`); forwards `msg.value` to the parent contract and records the deposit
- [ ] Validates `parentInstitution` is a registered parent of `msg.sender`'s institution (call back into `WorldBankReserve`/`NationalBank` registry)
- [ ] `getDepositHistory(address institution) view returns (uint256[])`
- [ ] Event: `UpwardDepositMade(address from, address to, uint256 amount)`

### 1.6 `MockUSDC.sol` — Phase I, DT-I.04a
- [ ] Standard OpenZeppelin ERC-20, 6 decimals
- [ ] `mint(address to, uint256 amount)` — admin only
- [ ] Deploy regardless of whether the demo disburses ETH or MockUSDC — it's still a Gate G1 Must artifact

### 1.7 RBAC — Phase I, DT-I.04
- [ ] `WORLD_BANK_ADMIN`, `NATIONAL_BANK_ADMIN`, `LOCAL_BANK_ADMIN`, `BANK_USER`, `RETAIL_CLIENT` as `bytes32` role constants via OpenZeppelin `AccessControl`
- [ ] One deploy script (`scripts/deploy.js`) grants roles to your four demo wallet addresses right after deployment — this is the single script that makes the whole demo wiring work

---

## 2. Database — Postgres, subset of the 13 M1 tables (DT-I.12/13) actually touched by this demo

- [ ] `INSTITUTION` — `institution_id`, `institution_type` (world/national/local), `name`, `country_code`, `on_chain_address`
- [ ] `COUNTRY` — `country_code`, `name`
- [ ] `BANK_USER` — `wallet_address` (PK), `institution_id` (FK), `role`
- [ ] `BORROWER` — `borrower_id`, `wallet_address`, `kyc_level`, `nid_doc_hash`, `photo_doc_hash`
- [ ] `LOAN_REQUEST` — `request_id`, `borrower_id`, `local_bank_id`, `amount`, `status`, `requested_at`, `on_chain_tx_hash`
- [ ] `LOAN` — `loan_id`, `request_id` (FK), `disbursed_amount`, `disbursed_at`, `on_chain_tx_hash`
- [ ] `BLOCKCHAIN_EVENT_LOG` — `event_id`, `contract_address`, `event_name`, `block_number`, `tx_hash`, `payload_json`
- [ ] `AUDIT_LOGS` — `log_id`, `actor_wallet`, `action`, `timestamp`
- [ ] `ASSETS` — `asset_id`, `institution_id`, `balance`, `last_synced_block` (mirrors on-chain reserve/balances for fast dashboard reads)

Skip `INSTALLMENT` and the KYC/AML detail tables for this build — they belong to DT-II.03/DT-II.04, which you're deferring.

---

## 3. Backend — Express.js + a small ethers.js event listener

- [ ] `POST /documents/upload` — accepts NID + photo (multipart), computes SHA-256 hash of each, stores the raw files (local disk or object storage), returns the hashes for the frontend to pass into `requestLoan()`. **Never write the raw document to the chain — hash only, per your own design.**
- [ ] `GET /documents/:requestId` — bank reviewer view, returns the stored files for the pending request
- [ ] `GET /loans/pending?localBank=<address>` — reads `LOAN_REQUEST` filtered by bank, backs the Local Bank dashboard queue
- [ ] `GET /reserve/summary` — combines an on-chain call to `WorldBankReserve.reserveBalance()`/`getNationalBanks()` with `ASSETS` table data, backs the Governor dashboard
- [ ] `GET /institutions/:tier` — list of registered institutions + balances for the National/World dashboards
- [ ] `listener.js` (background worker, not an HTTP route) — subscribes via ethers.js to `LoanRequested`, `LoanApproved`, `LoanDisbursed`, `CapitalAllocated`, `CapitalRequested`, `UpwardDepositMade` and upserts into `LOAN_REQUEST` / `LOAN` / `BLOCKCHAIN_EVENT_LOG` / `ASSETS`

---

## 4. Frontend — React + Vite, ethers.js/wagmi for wallet, one dashboard per role

- [ ] `WalletConnect` component — connect MetaMask, display address, force-prompt network switch to Sepolia (DT-I.15)
- [ ] Role router — after connect, look up the wallet in `BANK_USER` (or call `hasRole()` on-chain) and route to the matching dashboard
- [ ] `/client` — loan application form (amount, NID upload, photo upload) → submit → status tracker → "Loan approved — X ETH received" confirmation screen once `LoanDisbursed` fires
- [ ] `/local-bank` — pending requests table, document viewer, Approve/Reject buttons, an "upward funding" panel calling `UpwardDepositFacility.depositUpward()` toward the National Bank
- [ ] `/national-bank` — registered Local Banks + balances, allocate-capital form, incoming capital-request list, upward-funding panel toward the World Bank
- [ ] `/world-bank` — global reserve view, registered National Banks + balances, allocate-capital form, incoming capital-request list, incoming upward-funding notifications

---

## 5. Deployment / infra

- [ ] Hardhat project, Sepolia RPC via Alchemy or Infura
- [ ] Four MetaMask accounts (one seed, four "Account N" slots is simplest), each funded from a Sepolia faucet for gas
- [ ] Run `scripts/deploy.js`: deploy `MockUSDC` → `WorldBankReserve` → `NationalBank` → `LocalBank` (which deploys its own `LoanController`) → `UpwardDepositFacility`; grant roles to the four demo addresses; register National Bank with World Bank, Local Bank with National Bank
- [ ] Send test ETH into `WorldBankReserve` so it actually has something to allocate downward — the demo stalls at "insufficient reserve" otherwise
- [ ] Record deployed addresses under `/deployments/testnet/` per your existing convention
- [ ] Optional: verify contracts on Sepolia Etherscan — costs nothing, looks good to an examiner clicking through

---

## 6. Build order

1. Contracts + Hardhat unit tests (`allocateCapital`, `requestLoan → approveLoan → disburseLoan`, `depositUpward`)
2. Deploy to Sepolia + run the role-assignment script
3. Migrate the Postgres subset above
4. Backend API + `listener.js`
5. Frontend wallet connect + role routing
6. Frontend dashboards, built in demo order: client → local bank → national bank → world bank
7. End-to-end dry run switching between the four MetaMask accounts
8. Record

---

## 7. Demo script → exact calls

| On camera | Contract call |
|---|---|
| Client connects MetaMask, applies for loan, uploads NID + photo | `POST /documents/upload` → `LoanController.requestLoan(amount, docHash)` |
| Local Bank connects MetaMask, opens the request, views documents | `GET /loans/pending`, `GET /documents/:requestId` |
| Local Bank approves | `LoanController.approveLoan(requestId)` |
| Client receives ETH + confirmation | `LoanController.disburseLoan(requestId)` → `LoanDisbursed` event → frontend shows confirmation |
| Governor connects MetaMask, views reserve | `WorldBankReserve.reserveBalance()`, `getNationalBanks()` |
| Governor sees a National Bank's capital request, approves | `WorldBankReserve.allocateCapital(nationalBank, amount)` |
| Governor sees a National Bank voluntarily funding the reserve | `UpwardDepositFacility.depositUpward(worldBankReserveAddress)` fired from the National Bank side, reflected on the Governor dashboard |
| Same pattern, National Bank ↔ Local Bank | `NationalBank.allocateCapital(...)` / `UpwardDepositFacility.depositUpward(nationalBankAddress)` |

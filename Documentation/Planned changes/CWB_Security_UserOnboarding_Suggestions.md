# Crypto World Bank — Security Architecture & User Onboarding
## Full Research Analysis + Suggestions for Pre-thesis v13

> **Scope of this document:** Two-part deep research synthesis covering (1) the complete security architecture most suited to this project, including for the university lab prototype demo, and (2) a full new-user onboarding and ecosystem conversion plan, with login system design, database architecture, KYC/verification flows, role management, and on-chain vs off-chain data distribution. All suggestions are grounded in 2025–2026 research and are framed as additions or improvements to the existing thesis.

---

# PART ONE — SECURITY ARCHITECTURE

## 1.1 The Right Mental Model: Defense-in-Depth for a Hierarchical Banking Platform

Your thesis already correctly identifies smart contract security (reentrancy, access control, CEI pattern) as the primary concern. What it underspecifies is the **surrounding security stack** — the five layers that protect the system beyond the Solidity code itself.

The correct mental model for a blockchain banking prototype in 2025 is a **five-layer defense-in-depth architecture**:

```
Layer 5 — Operational Security (admin key management, multi-sig governance)
Layer 4 — Runtime Monitoring   (Tenderly alerts, anomaly detection)
Layer 3 — AI/ML Security Layer (fraud detection, behavioral analytics)
Layer 2 — Application Security (API security, JWT, input validation, CORS)
Layer 1 — Smart Contract Security (ReentrancyGuard, RBAC, formal verification)
```

Each layer is necessary. Breaching Layer 1 (contracts) requires defeating all layers above it for a well-designed system. The thesis currently has a solid Layer 1 design and a planned Layer 3, but Layers 2, 4, and 5 are almost entirely absent from the architecture documentation. The recommendations below fill these gaps.

---

## 1.2 Layer 1 — Smart Contract Security (Expand the Existing Work)

### What the thesis already has right
The thesis correctly implements: OpenZeppelin `ReentrancyGuard`, Checks-Effects-Interactions (CEI) pattern, Solidity 0.8.20 built-in overflow protection, role-based access modifiers, and has planned Slither + Mythril static analysis.

### Additions recommended

**A. Upgrade the audit pipeline to a full stack**

The 2025–2026 industry standard for smart contract auditing uses a four-tool pipeline, not just Slither + Mythril. Research from Trail of Bits and Cyfrin (2026) shows that each tool catches different vulnerability classes with minimal overlap:

| Tool | Type | Best for | Run when |
|------|------|----------|----------|
| **Slither** | Static analysis | 80+ vulnerability types, AST-level | Every commit (CI) |
| **Mythril** | Symbolic execution | Reentrancy, overflow, unreachable code | Every PR |
| **Echidna** | Property-based fuzzer | Invariant breaking, edge cases | Weekly |
| **Halmos / Certora** | Formal verification | Mathematical proofs of critical properties | Pre-demo milestone |

For the **university demo**, running Slither and Mythril is sufficient and achievable in a gaming PC lab environment. Add Echidna for the final thesis. Certora/Halmos is optional but academically impressive.

**B. Add the Foundry test suite explicitly**

Foundry (now the dominant Solidity testing framework as of 2025) integrates fuzz testing natively through `forge fuzz`. Every lending function — `disburseLoan`, `processInstallment`, `allocateCapital` — should have a corresponding fuzz test that throws random input ranges at the function. This is a concrete, demonstrable security feature for the demo.

```solidity
// Example Foundry fuzz test
function testFuzz_DisburseLoan(uint256 amount) public {
    vm.assume(amount > 0 && amount <= pool.availableCapital());
    vm.expectRevert(); // should revert on unauthorized caller
    localBank.disburseLoan(attacker, amount);
}
```

**C. Add the SWC Registry explicitly**

The thesis cites Atzei et al. (2017) for attack vectors. Supplement this with the **Smart Contract Weakness Classification (SWC) Registry**, the current industry-standard taxonomy of 37 documented vulnerability classes. For the thesis, map each contract function to its SWC risk class and document the mitigation. This is a table that belongs in the security section and adds significant academic rigor.

**D. TimeLock for governance actions**

Any privileged governance action (changing interest rates, assigning roles, pausing the system) should go through a **TimeLock contract** — a delay of at least 24–48 hours between proposal and execution. This is a standard pattern used by Compound, Aave, and every serious DeFi protocol. It gives time to detect and cancel malicious governance proposals before they execute.

```solidity
// TimeLock pattern: governance actions have a 48-hour delay
contract CWBTimeLock is TimelockController {
    constructor(address[] memory proposers, address[] memory executors)
        TimelockController(172800, proposers, executors, address(0)) {}
    // 172800 seconds = 48 hours
}
```

---

## 1.3 Layer 2 — Application Security (FastAPI Backend + React Frontend)

This layer is almost entirely absent from the thesis and must be added. The backend is the **second most critical attack surface** after the smart contracts.

### A. API Security (FastAPI)

**JWT Authentication with Short Expiry**
All protected API endpoints must require a signed JWT token. The token should be issued when the user connects their wallet and signs a challenge (EIP-712 typed message). Token lifetime should be **15 minutes with a refresh token mechanism** — not the hours-long sessions common in web2 apps. Financial APIs require aggressive token rotation.

```python
# FastAPI endpoint: wallet-signed authentication
@app.post("/auth/wallet-login")
async def wallet_login(request: WalletAuthRequest):
    message = f"CWB Login: {request.wallet_address} at {timestamp}"
    recovered = recover_address(message, request.signature)
    if recovered.lower() != request.wallet_address.lower():
        raise HTTPException(401, "Invalid signature")
    token = create_jwt(subject=request.wallet_address, role=get_role(request.wallet_address))
    return {"access_token": token, "expires_in": 900}  # 15 min
```

**Rate Limiting**
All endpoints must have rate limiting. Use `slowapi` (FastAPI middleware) with differentiated limits:
- Authentication endpoints: 5 requests/minute per IP
- Read endpoints (loan status, balance): 60 requests/minute
- Write endpoints (loan application, repayment): 10 requests/minute

**CORS Configuration**
Never use `allow_origins=["*"]` in production or demo. Restrict to the known frontend origin:

```python
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # demo frontend
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"])
```

**Input Validation (Pydantic)**
FastAPI + Pydantic naturally handles input validation, but ensure all financial inputs enforce explicit range constraints:

```python
class LoanApplicationRequest(BaseModel):
    amount: Decimal = Field(..., gt=0, le=10, description="ETH amount, max 10 ETH")
    wallet_address: str = Field(..., regex=r'^0x[a-fA-F0-9]{40}$')
    income_hash: str = Field(..., min_length=64, max_length=64)
```

### B. Frontend Security (React/TypeScript)

**Content Security Policy (CSP)**
Add a strict CSP header to the React app to prevent XSS attacks. This is critical when the frontend handles wallet interactions:

```
Content-Security-Policy: default-src 'self'; 
    script-src 'self' 'unsafe-inline'; 
    connect-src 'self' https://polygon-amoy.infura.io wss://polygon-amoy.infura.io;
    frame-ancestors 'none';
```

**Wallet Interaction Safety**
Never display raw transaction calldata to users without decoding it first. Use `ethers.js` transaction decoding to show users a human-readable summary of what they're signing. This prevents blind-signing attacks.

**Environment Variables**
Never commit API keys or contract addresses to git. Use `.env.local` for all configuration and document in `.env.example`. For the demo PC specifically, rotate all testnet API keys before and after the presentation.

---

## 1.4 Layer 3 — AI/ML Security Layer (Strengthen the Existing Design)

The thesis already plans Random Forest for fraud detection and Isolation Forest for anomaly detection. These are the right choices. The following additions make this layer more robust and more academically interesting.

### A. Behavioral Biometrics as a Soft Signal

Add a behavioral biometrics module that tracks interaction patterns — loan application frequency, repayment timing, session duration — and feeds a low-weight soft signal into the Isolation Forest. This is a 2025 research-backed approach for DeFi fraud detection that requires no additional user data and doesn't conflict with privacy.

Features to extract per session:
- Time between wallet connection and loan application submission
- Number of page views before applying (unusually few = bot, unusually many = hesitation/impersonation)
- Whether the user accepted the loan terms in under 3 seconds (never happens for legitimate users reading terms)
- IP geolocation consistency with declared jurisdiction (off-chain only, never on-chain)

### B. Transaction Graph Analysis

Supplement the Isolation Forest with a **transaction graph feature** — a measure of how many hops away the current wallet is from known flagged addresses (Chainalysis/TRM Labs watchlists). This is computed off-chain and stored as a risk score in the PostgreSQL database, not on-chain. It directly improves AML screening without exposing user data.

### C. SHAP Explainability for Loan Rejections

The thesis mentions SHAP. Make this concrete in the architecture documentation:

1. Each loan decision (approve/reject) produces a SHAP values vector
2. The top 3 contributing features are stored in `AI_ML_SECURITY_LOG` with the decision
3. The borrower-facing UI displays a plain-language explanation: *"Your application was declined primarily because: (1) no on-chain repayment history (60%), (2) requested amount exceeds income estimate (30%), (3) group membership not verified (10%)"*
4. This is an EU AI Act Article 86 requirement for AI-assisted financial decisions and a genuine novelty for a DeFi platform

---

## 1.5 Layer 4 — Runtime Monitoring (Critical Gap to Fill)

**This is the most underspecified security layer in the thesis.** Real-time on-chain monitoring is what gives the team visibility into attacks as they happen.

### Tenderly Integration (Free Tier, Perfect for University Demo)

Tenderly's free tier supports full smart contract monitoring for testnet deployments, making it ideal for the lab prototype. Set up the following alerts:

| Alert Trigger | Threshold | Response |
|---|---|---|
| Single loan disbursement | > 5 ETH in one tx | Immediate email + Slack |
| Multiple loan requests from same wallet | > 3 in 60 minutes | Flag for review, rate limit |
| Reserve ratio drop | Below 20% | Governance notification |
| Failed function calls | Any `revert` on `disburseLoan` | Log for analysis |
| Role assignment | Any `ROLE_GRANTED` event | Immediate review |
| Pause/unpause | Any governance action | Full team notification |

Tenderly also provides **transaction simulation** — before deploying any contract change on the demo PC, simulate it in Tenderly's fork environment to verify it behaves correctly. This prevents embarrassing live demo failures.

### The Graph for Subgraph Indexing

For the frontend dashboard to display real-time lending statistics without hammering a node with RPC calls, deploy a **subgraph** on The Graph's hosted service (Polygon Amoy supported). Define entities for `Loan`, `Repayment`, `ReserveBalance`, and `AIRiskEvent`. The dashboard queries the subgraph via GraphQL, keeping the demo performant even on campus networks.

---

## 1.6 Layer 5 — Operational Security (Admin Key Management)

This is the **highest-impact security decision for the entire project** and is completely absent from the thesis. How admin keys are managed determines whether the system can be controlled or catastrophically exploited.

### A. Safe (formerly Gnosis Safe) Multi-Signature Wallet — Essential for Demo

The `WorldBankAdmin` role (Owner of the top-level contract) must never be held by a single EOA private key during the demo. Instead, transfer ownership to a **Safe 2-of-3 multi-sig wallet** before the demo:

- Signer 1: Team member 1's MetaMask on the demo PC
- Signer 2: Team member 2's MetaMask on a laptop (or phone)
- Signer 3: Backup key (paper wallet, held by advisor)

Any governance action (changing interest rates, assigning bank roles, pausing contracts) requires 2 of 3 signatures. This prevents a single compromised key from destroying the demo. It also demonstrates institutional-grade governance to examiners, which is a genuine differentiator.

**OpenZeppelin Defender** (free tier) integrates with Safe and provides a UI for proposing and approving governance actions. For the demo, this means examiners can watch a governance proposal being submitted and approved through a professional-looking interface.

### B. Key Rotation Policy

Document a formal key rotation schedule in the thesis:

- **Demo keys** (testnet only): Rotate before and after each public presentation
- **Development keys**: Each team member uses a dedicated development wallet, never the admin wallet
- **Emergency keys**: The Safe guardian key is stored offline (printed QR code in sealed envelope held by supervisor)

### C. Hardware Wallet Consideration for Final Thesis

While a hardware wallet (Ledger Nano Gen5 or Trezor Safe 7, both 2025 releases with improved multisig support) is not strictly necessary for a testnet prototype, using one for the WorldBankAdmin Safe signer is academically notable and worth one paragraph in the thesis. The Ledger Nano Gen5 specifically introduced **Ledger Multisig** to address blind-signing vulnerabilities in multisig workflows — relevant to cite given the thesis's governance design.

---

## 1.7 Security for the University Lab Demo (Gaming PC Specific)

Given the context — a high-end gaming PC in a university lab, showing a testnet prototype — here is a concrete, prioritized checklist:

### Before the demo day

- [ ] Transfer all contract ownership to a 2-of-3 Safe multisig
- [ ] Deploy fresh testnet contracts (Polygon Amoy) with a clean state — no test junk transactions
- [ ] Run Slither on all three contracts; fix all HIGH severity findings
- [ ] Set up Tenderly monitoring with alerts to your phone/email
- [ ] Rotate all API keys (Infura/Alchemy, any backend secrets)
- [ ] Run the full frontend + backend on the demo PC in offline mode once (ensure it works without internet)
- [ ] Create a demo account with pre-funded test wallets for each tier (World Bank, National Bank, Local Bank, Borrower)
- [ ] Screenshot/record a Tenderly dashboard showing contract activity for the presentation

### During the demo

- [ ] Use a dedicated demo browser profile (no personal accounts logged in)
- [ ] Keep MetaMask on Polygon Amoy testnet; disable mainnet access
- [ ] Have a backup laptop with the same environment (USB drive with codebase and pre-funded wallets)
- [ ] Pre-sign the first few transactions before the demo to show instant approval flow

### What to show examiners specifically on security

1. The Tenderly dashboard showing real-time transaction monitoring
2. A Safe multisig showing a governance proposal requiring 2 signatures
3. The Slither audit report summary (show clean results after fixes)
4. The AI/ML risk score with SHAP explanation for a sample loan decision
5. The ZKP KYC flow (even if mocked with Circom testnet proofs)

---

## 1.8 Security Architecture Summary Table

| Layer | Component | Status in Thesis | Recommendation |
|-------|-----------|-----------------|----------------|
| Smart Contract | ReentrancyGuard, CEI | Implemented | Add TimeLock for governance |
| Smart Contract | Slither + Mythril | Planned | Add Echidna fuzzing |
| Smart Contract | Formal verification | Planned (Certora) | Add Foundry fuzz tests for demo |
| Smart Contract | Access control | RBAC via OpenZeppelin | Keep; add role expiry timestamps |
| Application | API authentication | Not specified | Add EIP-712 wallet-signed JWT |
| Application | Rate limiting | Not specified | Add slowapi middleware |
| Application | Input validation | Not specified | Explicit Pydantic range constraints |
| AI/ML | Fraud detection | Random Forest (planned) | Add behavioral biometrics features |
| AI/ML | Anomaly detection | Isolation Forest (planned) | Add tx graph distance feature |
| AI/ML | Explainability | SHAP (planned) | Add borrower-facing SHAP output |
| Monitoring | Runtime alerts | Not specified | Integrate Tenderly (free tier) |
| Monitoring | Event indexing | Not specified | Add The Graph subgraph |
| Operational | Admin key management | Not specified | Safe 2-of-3 multisig — essential |
| Operational | Key rotation | Not specified | Document formal rotation policy |
| Operational | Demo environment | Not specified | Dedicated demo wallets, clean state |

---

# PART TWO — USER ONBOARDING & ECOSYSTEM CONVERSION

## 2.1 The Core Problem: Crypto Is Not Accessible to the 1.4 Billion Unbanked

The thesis targets populations in developing economies who currently lack banking access. These users almost certainly:
- Do not own a cryptocurrency wallet
- Have never signed a blockchain transaction
- May not have a government-issued NID (common in rural Bangladesh, target market)
- Have a smartphone but potentially limited internet

The current thesis design (MetaMask/WalletConnect, raw Ethereum wallet interaction) assumes a user who already understands DeFi. This is a contradiction with the stated mission. The recommendations below resolve this by designing a **layered onboarding system** where technical complexity is hidden from new users and progressively revealed as they gain confidence.

---

## 2.2 User Taxonomy — Five Types of Users

The thesis identifies Borrower, Local Bank, National Bank, World Bank Admin, and Approver. This taxonomy is incomplete. A full user taxonomy for a banking platform has seven distinct user types:

| User Type | Description | Tier | KYC Level | Wallet Type | DB Location |
|-----------|-------------|------|-----------|-------------|-------------|
| **Anonymous Visitor** | Reads platform info, no account | None | None | None | Off-chain session only |
| **Registered Retail User (Borrower)** | Individual seeking microloans | Tier 4 | Basic (NID + selfie) | Abstracted (email/Google) | Off-chain primary, on-chain role |
| **Group Borrower** | Part of a solidarity lending group | Tier 4 | Basic + group verification | Abstracted | Off-chain + on-chain group contract |
| **Local Bank Operator** | Staff of a registered local bank | Tier 3 | Full institutional KYC | MetaMask (institutional) | Off-chain + on-chain role binding |
| **Local Bank Approver** | Loan approval authority at Local Bank | Tier 3 | Full institutional + background check | MetaMask + Safe co-signer | Off-chain + on-chain role |
| **National Bank Admin** | Tier 2 bank administrator | Tier 2 | Full institutional + regulatory license | Safe multisig mandatory | Off-chain + on-chain role |
| **World Bank Admin (Governance)** | Platform governor | Tier 1 | Founding team + academic supervisor | Safe 3-of-5 multisig | On-chain governance only |

---

## 2.3 Account Abstraction — The Key to Onboarding New Users

The single most important technical change to improve user onboarding is implementing **ERC-4337 Account Abstraction** for retail borrowers. This is a well-researched, production-ready standard (deployed March 2023, extended by EIP-7702 in Ethereum's Pectra upgrade in May 2025) that removes all barriers to entry.

### What Account Abstraction enables for CWB

**For retail borrowers:**
- Sign up with email or Google account (social login via Firebase/Auth0)
- No need to understand seed phrases or private keys
- Wallet is created automatically in the background as a smart contract account
- Gas fees paid by the platform (Paymaster contract) — user never needs to buy ETH
- Account recovery via trusted contacts (social recovery) instead of a seed phrase

**For the thesis:**
- This is a genuinely novel architectural contribution — applying ERC-4337 to a hierarchical development banking platform
- It directly resolves the accessibility contradiction in the current design
- The Paymaster model can be modeled as a subsidy mechanism (World Bank Reserve subsidizes onboarding costs for new borrowers — an on-chain financial inclusion mechanism)

### Implementation for the demo

For the demo prototype, use **Biconomy SDK** or **Alchemy's Account Kit** (both free tier, testnet support) as the Account Abstraction infrastructure layer. These SDKs handle UserOperation bundling, Paymaster gas sponsorship, and social recovery out of the box.

```typescript
// React frontend: account abstraction onboarding
import { createSmartAccountClient } from "@biconomy/account";

const smartAccount = await createSmartAccountClient({
  signer: emailSigner, // from Firebase Auth
  bundlerUrl: "https://bundler.biconomy.io/api/v2/80002/...",
  paymasterUrl: "https://paymaster.biconomy.io/api/v1/80002/..." // gas sponsorship
});

const smartAccountAddress = await smartAccount.getAccountAddress();
// This address is the user's on-chain identity — permanent, recoverable
```

---

## 2.4 New User Registration Flow — Full Step-by-Step Design

### Phase 1: Anonymous Access (No Registration Required)
The platform should be explorable without any account. Users can see:
- Market data (crypto prices, interest rates)
- Platform overview and tier structure
- AI chatbot for general questions (no personal data required)
- Sample loan calculator

**Database:** Session-only (Redis/in-memory). Nothing persisted.

### Phase 2: Soft Registration (Email/Social — Retail Borrower)
User wants to create an account but doesn't have a crypto wallet.

**Step-by-step flow:**

1. User clicks "Get Started" → chooses "I'm new to crypto"
2. Email/Google sign-in (Firebase Auth handles OAuth)
3. System creates an ERC-4337 smart account wallet in background
4. User sees: *"Your CWB account is ready. Your wallet address is 0x..."*
5. User prompted to set a **backup guardian** (trusted email or phone for recovery)
6. Off-chain profile created in PostgreSQL (status: `REGISTERED_UNVERIFIED`)

**Off-chain DB record created:**
```sql
INSERT INTO users (
  user_id, email, wallet_address, account_type,
  kyc_status, registration_date, guardian_contact,
  auth_provider, smart_account_address
) VALUES (
  gen_uuid(), 'user@email.com', '0xAA...', 'RETAIL_BORROWER',
  'UNVERIFIED', NOW(), 'guardian@email.com',
  'GOOGLE', '0xSA...'
);
```

**On-chain state:** Not yet created. Wallet address recorded off-chain only.

### Phase 3: Identity Verification (KYC)
User wants to apply for a loan — KYC required.

**Tiered KYC (risk-based approach, as recommended by Persona 2025 research):**

| Risk Level | Required Documents | Borrowing Limit | Verification Time |
|---|---|---|---|
| **Level 0 (Unverified)** | None | None — view only | Instant |
| **Level 1 (Basic)** | NID photo + selfie liveness check | Up to 0.1 ETH | 2–5 minutes (automated) |
| **Level 2 (Standard)** | NID + proof of income + bank statement | Up to 2 ETH | 24 hours (human review) |
| **Level 3 (Enhanced)** | Full document set + video interview | Up to 10 ETH | 48–72 hours |

**KYC Implementation Options (ranked by suitability for academic prototype):**

1. **Simulated KYC flow** (for demo): A mock KYC provider API that accepts a document upload and returns a signed credential after 30 seconds. Sufficient for the demo.
2. **Veriff or Persona SDK** (for final thesis): Both offer free sandbox tiers for student projects. Full document verification, liveness check, and sanctions screening in a single API call.
3. **ZKP-based KYC** (planned extension — already in thesis): The Circom 2.0 ZKP KYC layer converts the credential from Option 1 or 2 into a privacy-preserving proof submitted on-chain.

**After KYC approval:**
```sql
UPDATE users SET
  kyc_status = 'VERIFIED_LEVEL_1',
  kyc_provider = 'MOCK_KYC_V1',
  kyc_verified_at = NOW(),
  nid_hash = sha256('NID_NUMBER'),  -- NEVER store raw NID
  country = 'BD',
  age_over_18 = TRUE
WHERE user_id = '...';
```

**On-chain state created (ZKP path):**
```solidity
// User submits ZKP proof to contract
KYCVerifier.verify(proof, [walletAddress, countryCode, ageOver18]) → true
// Contract sets:
kycVerified[walletAddress] = true;
kycLevel[walletAddress] = 1;
kycExpiry[walletAddress] = block.timestamp + 365 days;
```

### Phase 4: Role Binding (On-Chain Assignment)
After KYC passes, the local bank operator reviews the application and assigns the `BORROWER` role:

```solidity
// LocalBank contract: operator assigns borrower role
function registerBorrower(address wallet, uint8 kycLevel)
    external onlyRole(BANK_OPERATOR_ROLE) {
    _grantRole(BORROWER_ROLE, wallet);
    borrowerKYCLevel[wallet] = kycLevel;
    borrowerRegisteredAt[wallet] = block.timestamp;
    emit BorrowerRegistered(wallet, kycLevel, msg.sender);
}
```

This event is indexed by The Graph subgraph and appears in the borrower's dashboard within seconds.

---

## 2.5 Bank Registration Flow (Institutional Onboarding)

Banks joining the network require a different, more rigorous flow. This is currently absent from the thesis and must be added.

### Local Bank Registration

**Pre-conditions:**
- Registered legal entity (company registration number)
- Nominated Local Bank Operator (the wallet that will interact with contracts)
- Signed agreement with the National Bank above them

**Registration flow:**

1. **Off-chain application**: Bank submits institutional KYC packet via a secure form — company registration docs, authorized signatory NID, regulatory license (if applicable). Stored encrypted in PostgreSQL + S3-compatible storage (MinIO for self-hosted demo).

2. **National Bank review**: The national bank operator reviews the application off-chain and approves or rejects within a set SLA.

3. **On-chain role grant**: Upon approval, the National Bank operator calls `LocalBankContract.registerBank(bankWalletAddress, bankMetadataHash)`. The `bankMetadataHash` is a SHA-256 hash of the off-chain institution record — creating an immutable link between on-chain identity and off-chain documents.

4. **Multi-sig requirement**: All Local Bank admin functions should require a Safe 2-of-3 wallet (not a single EOA). This is a governance requirement that should be checked on-chain:
```solidity
modifier onlyMultiSig() {
    require(
        IMultiSig(msg.sender).getThreshold() >= 2,
        "Bank admin must use multisig"
    );
    _;
}
```

5. **Database record**:
```sql
INSERT INTO banks (
  bank_id, bank_name, wallet_address, bank_type,
  national_bank_id, registration_status, kyc_approved_at,
  company_reg_number, reg_country, multisig_address,
  on_chain_hash, created_at
) VALUES (...);
```

**Off-chain documents** → encrypted in S3 storage, never on-chain
**On-chain state** → wallet address + role + metadata hash + registration timestamp

---

## 2.6 Database Architecture — On-Chain vs Off-Chain Decision Framework

This is one of the most important architectural questions. The thesis has a good starting table but needs more precision. Here is the complete framework:

### Decision rule

> **Put on-chain:** Anything that needs to be verified by a smart contract, is subject to dispute, or must be publicly auditable without trusting a third party.
> **Put off-chain:** Anything containing personal data, anything that changes frequently (market data, session state), anything that would cost prohibitive gas to store.

### Full data classification table

| Data Category | On-Chain | Off-Chain (PostgreSQL) | Off-Chain (Cache/Redis) | Notes |
|---|---|---|---|---|
| Wallet address → role binding | ✅ | ✅ (indexed copy) | ❌ | On-chain is authoritative |
| KYC status flag (`kycVerified`, `kycLevel`) | ✅ | ✅ | ❌ | ZKP proof on-chain; details off-chain |
| User personal data (name, DOB, address) | ❌ | ✅ (encrypted) | ❌ | Never on-chain — immutable privacy violation |
| NID number | ❌ | ❌ | ❌ | Store only SHA-256 hash, never raw NID |
| KYC document files | ❌ | ✅ (S3/MinIO, encrypted) | ❌ | Hash of file stored on-chain as reference |
| Loan amount, status, timestamps | ✅ | ✅ (indexed) | ❌ | On-chain authoritative; DB for fast queries |
| Loan approval/rejection events | ✅ | ✅ | ❌ | Emitted as events, indexed by The Graph |
| Repayment schedule | ✅ | ✅ | ❌ | On-chain enforced, DB for UI display |
| Reserve balances | ✅ | ✅ (cached) | ✅ (30s TTL) | On-chain authoritative |
| Interest rate parameters | ✅ | ✅ | ✅ (5min TTL) | Governance-controlled on-chain |
| AI/ML risk score | ❌ | ✅ | ❌ | Oracle submits only approve/reject signal |
| SHAP explanation values | ❌ | ✅ | ❌ | Used for UI display only |
| Chat messages (AI chatbot) | ❌ | ✅ | ❌ | PII concern; off-chain only |
| Income verification documents | ❌ | ✅ (encrypted) | ❌ | Hash reference on-chain |
| Group membership | ✅ | ✅ | ❌ | On-chain multi-sig group contract |
| Session tokens (JWT) | ❌ | ❌ | ✅ (15min TTL) | Redis, never persisted to DB |
| Crypto market prices | ❌ | ❌ | ✅ (60s TTL) | External API cached |
| Audit logs (security events) | ✅ (events) | ✅ | ❌ | Both — on-chain events + DB for ML training |
| Bank registration documents | ❌ | ✅ (encrypted S3) | ❌ | Hash on-chain |
| Bank operational metrics | ❌ | ✅ | ✅ (5min TTL) | For dashboard display |

### PostgreSQL Schema Additions Recommended

**1. Add a `kyc_credentials` table** (separate from `users` for data minimization):
```sql
CREATE TABLE kyc_credentials (
  credential_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  kyc_level SMALLINT NOT NULL,
  provider VARCHAR(50),
  document_type VARCHAR(50),
  document_country CHAR(2),
  document_hash VARCHAR(64),  -- SHA-256 of document, not document itself
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  zkp_proof_hash VARCHAR(64),  -- hash of the ZKP proof submitted on-chain
  revoked BOOLEAN DEFAULT FALSE,
  CONSTRAINT one_active_kyc UNIQUE(user_id, kyc_level, revoked)
);
```

**2. Add a `session_events` table** (for behavioral analytics):
```sql
CREATE TABLE session_events (
  event_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  session_id UUID,
  event_type VARCHAR(50),   -- 'LOAN_VIEW', 'TERMS_ACCEPT', 'APPLICATION_SUBMIT'
  duration_ms INTEGER,
  ip_country CHAR(2),      -- geolocation from IP, not stored raw IP
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- This feeds the behavioral biometrics ML model
```

**3. Add role audit trail**:
```sql
CREATE TABLE role_changes (
  change_id UUID PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  role_granted VARCHAR(50),
  role_revoked VARCHAR(50),
  granted_by VARCHAR(42),  -- operator wallet
  tx_hash VARCHAR(66),     -- on-chain transaction hash proving the change
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
-- This is the off-chain mirror of on-chain RoleGranted/RoleRevoked events
```

---

## 2.7 Role Management — On-Chain vs Off-Chain Decision

### What must be on-chain

All **permissioned actions** in smart contracts must check on-chain roles. The OpenZeppelin `AccessControl` module handles this. The thesis already has this. The key roles and their on-chain representation:

```solidity
// From OpenZeppelin AccessControl
bytes32 public constant WORLD_BANK_ADMIN = keccak256("WORLD_BANK_ADMIN");
bytes32 public constant NATIONAL_BANK_ROLE = keccak256("NATIONAL_BANK");
bytes32 public constant LOCAL_BANK_ROLE = keccak256("LOCAL_BANK");
bytes32 public constant BANK_APPROVER_ROLE = keccak256("BANK_APPROVER");
bytes32 public constant BORROWER_ROLE = keccak256("BORROWER");
bytes32 public constant GROUP_BORROWER_ROLE = keccak256("GROUP_BORROWER");
```

On-chain role assignment is the **authoritative source of truth**. The PostgreSQL database mirrors this for UI display but the contract always verifies the on-chain role.

### Role hierarchy and inheritance

```
WORLD_BANK_ADMIN
    └── NATIONAL_BANK_ADMIN (can grant LOCAL_BANK_ROLE)
            └── LOCAL_BANK_OPERATOR (can grant BANK_APPROVER_ROLE and BORROWER_ROLE)
                    └── BANK_APPROVER (can approve/reject loan applications)
                    └── BORROWER (can apply for loans)
                            └── GROUP_BORROWER (extension of BORROWER with group contract)
```

**Role grant requires the granting account to have the parent role** — this is enforced by the `onlyRole(PARENT_ROLE)` modifier on every `grantRole` call.

### What can be off-chain

- **Permission labels and descriptions** (UI display names for roles)
- **Role metadata** (institution name associated with a bank role)
- **Role expiry timestamps** (not currently in the thesis — recommend adding an expiry field that the contract checks: `require(roleExpiry[msg.sender] > block.timestamp, "Role expired")`)
- **Audit history** of role changes (mirrored from on-chain events to PostgreSQL for analytics)

---

## 2.8 Conversion Strategy — How Non-Crypto Users Adopt This System

This is the question at the heart of the thesis's financial inclusion mission. Here is a realistic adoption funnel:

### Stage 1: Information Browsing (Zero friction)
- No account required
- Platform information, interest rates, loan calculator
- AI chatbot answers questions in Bengali + English
- Goal: Build trust before asking for any data

### Stage 2: Account Creation (Minimal friction)
- Email or phone number sign-up
- Smart account (ERC-4337) created automatically in background
- User gets a wallet address without knowing what that means
- Gas fees are sponsored by the platform (Paymaster)
- Goal: User has an identity on the platform

### Stage 3: KYC Verification (Medium friction, high value)
- Upload NID photo via phone camera
- Liveness check (blink, turn head)
- Automated AI verification in 2–5 minutes
- User is now eligible for basic loans
- Goal: Regulatory compliance + borrowing capability

### Stage 4: First Loan (High value, teach crypto as a by-product)
- User applies for first loan (under 0.1 ETH)
- Platform explains in simple language: "Your loan will be processed by Smart City Local Bank"
- User receives a notification when approved
- Repayment schedule shown in local currency equivalent
- Goal: User experiences the full loan lifecycle without ever manually using MetaMask

### Stage 5: Power User (Optional, for those who want it)
- User can connect MetaMask/hardware wallet to replace the abstracted account
- User can see their on-chain transaction history on a block explorer
- User can participate in group lending with other members
- Goal: Progressive decentralization of user experience

---

## 2.9 Group Borrower (Solidarity Lending) — Onboarding Specifics

This is the thesis's most novel feature. The group onboarding flow needs dedicated attention.

**Group formation flow:**

1. A designated group leader registers and passes Level 1 KYC
2. Leader creates a group in the UI (off-chain first): group name, description, target members
3. Leader shares an invitation link with potential group members
4. Each member clicks the link, registers, and passes KYC
5. When the minimum group size (e.g., 5 members) is reached, leader proposes group loan
6. Each member digitally signs their consent (wallet signature — `eth_sign` even on abstracted accounts)
7. The `SolidarityGroup` smart contract is deployed with all member wallet addresses
8. Group loan is applied for, collectively approved/rejected by the Local Bank

**On-chain group contract stores:**
- Member wallet addresses
- Multi-sig consent threshold (all members must sign)
- Liability distribution formula
- Group loan status

**Off-chain stores:**
- Group name, description, history
- Member profiles and communication records
- Group meeting minutes (for Grameen-style discipline tracking)

---

## 2.10 Anti-Patterns to Avoid in User Management

These are common mistakes in blockchain banking platforms that the thesis should explicitly avoid:

| Anti-Pattern | Risk | Correct Approach |
|---|---|---|
| Storing raw NID/passport numbers in DB | GDPR violation, catastrophic breach | Store only SHA-256 hash of document number |
| Using a single EOA as World Bank Admin | Single point of failure | Safe 2-of-3 multisig mandatory |
| Issuing long-lived JWT tokens (>1 hour) | Session hijacking | 15-minute tokens with refresh |
| Allowing role self-assignment | Privilege escalation attack | Role grants always require parent-role holder to call |
| Storing KYC documents on IPFS (public) | Privacy violation | Encrypted S3/MinIO with access control |
| Using `block.timestamp` for loan expiry | Miner manipulation (slight risk on PoS) | Use block numbers + timestamp as corroboration |
| Granting BORROWER role before KYC | KYC bypass | Smart contract checks `kycVerified[wallet]` before any loan function |
| Reusing wallet addresses across tiers | Role confusion attack | Each tier uses a distinct wallet; users register new wallets for tier upgrades |

---

# SUMMARY — PRIORITY ADDITIONS TO THE THESIS

## Immediate (Before Demo)

1. **Implement Safe 2-of-3 multisig for WorldBankAdmin** — the single highest-impact security action, zero cost
2. **Set up Tenderly monitoring** with 6 critical alerts on the deployed contracts — free, takes 1 hour
3. **Run Slither on all three contracts and fix HIGH severity findings** — document results in the thesis
4. **Add EIP-712 wallet-signed JWT authentication** to the FastAPI backend — replaces any password-based auth
5. **Add rate limiting middleware** to all API endpoints — `pip install slowapi`

## For the Final Thesis

6. **Account Abstraction (ERC-4337)** for retail borrowers — resolves the DeFi accessibility contradiction
7. **Tiered KYC system** (Levels 0–3) with corresponding borrowing limits — makes the ZKP KYC story complete
8. **Complete role audit trail** in PostgreSQL mirroring on-chain `RoleGranted` events
9. **SHAP explainability output to borrowers** — connects the planned AI/ML layer to consumer protection
10. **TimeLock contract** for all governance actions — standard for any serious DeFi protocol
11. **Behavioral biometrics features** for Isolation Forest — novel, research-backed, no additional user data required
12. **Full group onboarding flow** for solidarity lending — the thesis's most novel feature needs a concrete UX design
13. **Foundry fuzz test suite** for all three core contracts — demonstrable, academically rigorous
14. **The Graph subgraph** for efficient frontend data indexing — removes RPC polling bottleneck

## Academic Additions (New Sections to Write)

15. **Section: Security Architecture Overview** — present the five-layer defense-in-depth model as a figure (Layer 1–5 diagram)
16. **Section: User Taxonomy and Onboarding Flows** — full flowcharts for each user type
17. **Section: Data Privacy Architecture** — the on-chain/off-chain decision table expanded with GDPR/Bangladesh PDPA analysis
18. **Section: Operational Security and Key Management** — Safe multisig governance model, key rotation policy
19. **Update the Threat Model table** (Table 3.9 equivalent) to include application-layer threats (API abuse, JWT attacks, social engineering) in addition to smart contract threats

---

*Research synthesized from: Piper et al. (2025) on ZKP performance; ERC-4337 EIP specification; EIP-7702 (Pectra upgrade, May 2025); Trail of Bits/Cyfrin audit tooling research (2026); Tenderly monitoring documentation; Persona KYC tactics guide (2025); Blockchain-AI-Geolocation MFA study (MDPI, Nov 2025); RBAC-SC smart contract access control literature; Banking Expert Analysis attached to this thesis (May 2026); Hacken smart contract audit tools review (2026); OpenZeppelin Defender + Safe multisig documentation.*

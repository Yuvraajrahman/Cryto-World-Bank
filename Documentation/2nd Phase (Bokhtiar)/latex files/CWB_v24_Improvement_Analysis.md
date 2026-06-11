# Crypto World Bank — v24 Comprehensive Improvement Analysis
### Synthesised from: Binance Architecture Research · Binance SE Architecture · Exchange DB Normalization · Crypto Ecosystem Dashboard · Feature Checklist · AI Agent Design Session
> **Prepared:** May 2026 | **For:** Pre-Thesis v24 — Crypto World Bank (CWB)
> **Supersedes:** CWB_Improvement_Analysis.md (v23 pass)
> **New in this document:** Autonomous agent architecture (Part 1), Chainlink oracle stack (Part 2), FATF/SAR compliance (Part 3), full actor-permission matrix (Part 4), DB normalization additions (Part 5), revenue model (Part 6), consolidated sprint plan (Part 7)

---

## Table of Contents

1. [Autonomous AI Agent System — Full Architecture](#1-autonomous-ai-agent-system--full-architecture)
2. [Protocol & Oracle Infrastructure Upgrades](#2-protocol--oracle-infrastructure-upgrades)
3. [Compliance & Regulatory Architecture](#3-compliance--regulatory-architecture)
4. [Actor Taxonomy & Permission Matrix](#4-actor-taxonomy--permission-matrix)
5. [Database Schema Improvements](#5-database-schema-improvements)
6. [Revenue Model & Tokenomics Discipline](#6-revenue-model--tokenomics-discipline)
7. [Retained Improvements from v23 (Do Not Lose)](#7-retained-improvements-from-v23-do-not-lose)
8. [Consolidated Sprint Plan — v24 Additions](#8-consolidated-sprint-plan--v24-additions)
9. [What to Specify Only — No Code Required](#9-what-to-specify-only--no-code-required)
10. [Summary Reference Table](#10-summary-reference-table)

---

## 1. Autonomous AI Agent System — Full Architecture

This is the standout differentiator for the CWB demo and a genuine research contribution. No existing DeFi platform or CEX offers a locally hosted, privacy-preserving AI agent that can both answer questions and autonomously execute on-chain banking operations with a human confirmation gate.

### 1.1 The Six-Step Agent Pipeline

```
User message
    │
    ▼
Agent brain (Qwen3-8B + live on-chain context injection)
    │
    ├──[Q&A]──────────► RAG from policy docs → Reply
    │
    └──[Action request]─► Requirements (docs, KYC, timeline)
                                │
                                ▼
                         Confirmation gate: "Shall I proceed?"
                                │
                            YES ▼
                         Execute action (calls bank API → on-chain tx)
                                │
                                ▼
                         Monitor status → Reply to client
```

The Express.js backend already injects the client's on-chain state (loan status, SBT risk tier, pool utilisation) as structured JSON into every system prompt (v22 Improvement 5). The agent has full context before it reads a single word from the user.

### 1.2 MCP Tool Server — 16 Restricted Banking Tools

The agent interacts with CWB exclusively through a defined tool schema, never through arbitrary code execution. This is the safety boundary.

```
MCP TOOL SERVER — CWB Banking Tools
│
├── READ TOOLS (no state change, always permitted)
│   ├── get_account_state        → SBT tier, loan count, savings balance
│   ├── get_credit_score         → current score, tier, next threshold
│   ├── get_loan_status          → all active loans + next installment
│   ├── get_installment_schedule → full repayment calendar
│   ├── get_pool_utilisation     → current Local Bank capacity
│   ├── get_interest_rate        → rate for client's current credit tier
│   ├── get_market_data          → ETH/USD, BDT/USD, 30d volatility
│   └── get_requirements         → documents + KYC needed for a given amount
│
└── WRITE TOOLS (require human confirmation gate before execution)
    ├── submit_loan_application   → POST /api/loan/apply
    ├── submit_deposit            → POST /api/savings/deposit
    ├── submit_fixed_deposit      → POST /api/savings/fixed-deposit
    ├── pay_installment           → POST /api/installment/pay
    ├── join_group_pool           → POST /api/group/join
    ├── submit_kyc_upgrade        → POST /api/kyc/upgrade
    ├── schedule_payment_reminder → POST /api/reminder/set
    └── submit_group_application  → POST /api/group/apply
```

All write tools follow the **human-gate pattern**: the agent assembles the full parameter set, presents a summary to the client, waits for explicit confirmation (`"Yes, proceed"` or equivalent), then executes. No write tool is ever called without a confirmation step in the conversation history.

### 1.3 EIP-7702 Session Keys — Scoped Agent Wallet

The agent needs a wallet to sign transactions on the client's behalf after confirmation. EIP-7702 provides this cleanly without requiring the client to hand over their main private key.

```
How EIP-7702 session keys work for CWB:

1. Client authorises a session key at login:
   - Scoped to: submit_loan_application, pay_installment only
   - Time-bound: 24-hour expiry
   - Value-capped: max 500 USDC per transaction
   - Revocable: client can invalidate at any time

2. Agent uses session key to sign the specific transaction
   the client confirmed in the chat.

3. The session key CANNOT:
   - Transfer funds to external addresses
   - Exceed the value cap
   - Perform any operation not in the approved scope
   - Execute after the TTL expires

4. Every session key usage is logged to AI_CHATBOT_LOG
   with the conversation turn ID as the audit reference.
```

This is architecturally superior to ERC-4337 paymasters for agent-controlled operations because the scope restriction is enforced at the key level, not just at the application level.

### 1.4 Authority Brief UI — SHAP Breakdown for Bank Approvers

When the agent submits a loan application to a Local Bank, the bank approver does not just see a raw application. The agent prepares a structured brief:

```
AGENT AUTHORITY BRIEF — Loan Application #4821
─────────────────────────────────────────────
Client tier:        Silver (score: 512)
Requested amount:   150 USDC
Duration:           6 months
Collateral:         75 USDC (50% LTV)

ML Risk Score:      0.23 (LOW RISK)
SHAP breakdown:
  + On-time repayment rate:   +0.41 (reduces risk)
  + Loan-to-income ratio:     +0.18 (within safe range)
  - Wallet age:               -0.09 (account < 6 months)
  - No prior completed loans: -0.27 (no repayment history)

Agent recommendation:   APPROVE
Suggested interest:     Base rate − 0.5% (Silver tier)

[ APPROVE ]   [ REQUEST MORE INFO ]   [ DECLINE ]
```

The one-click approve/decline interface means the bank approver never needs to navigate away from the authority brief. The agent monitors for the approval event and notifies the client automatically.

### 1.5 Extended Agent Capabilities Beyond the Loan Flow

Beyond deposit/loan/withdrawal automation, the same tool-calling architecture provides:

**Proactive installment reminders** — a cron job checks `get_installment_schedule` daily. Three days before due date, the agent sends: "Your next installment of 17.50 USDC is due in 3 days. Would you like me to process it now?" If the client says yes, `pay_installment` is called with the session key.

**Credit Passport coaching** — the agent explains exactly what the client needs to reach the next tier: "You need 2 more on-time payments to reach Gold tier. Your borrowing rate will then drop by 1.0%."

**Loan calculator** — before submitting, the agent runs the EMI formula inline and shows the full repayment schedule in USDC and BDT equivalent (via `get_market_data` for the live FX rate).

**Group lending coordination** — a group leader can ask the agent to collect group member signatures. The agent tracks which members have signed and sends reminders to those who have not.

**Market intelligence** — the agent fetches live price and volatility data and gives contextual guidance with an explicit regulatory disclaimer (handled by the refusal layer already specified in the hallucination guard).

**KYC tier upgrade guidance** — the agent identifies exactly which documents are needed for a KYC upgrade and walks the client through the phone-camera capture flow.

### 1.6 Per-User Personalisation — Shared Model, Per-User Context

Every client receives a personalised experience without deploying a separate model per user. The personalisation lives entirely in the per-user context namespace:

```json
{
  "client_id": "0xABC...",
  "language": "Bengali",
  "credit_tier": "Silver",
  "credit_score": 512,
  "active_loans": [
    { "loan_id": "L-4821", "amount": 100, "next_due": "2026-06-15", "installment": 17.5 }
  ],
  "savings_balance": 250.0,
  "pool_utilisation": 0.67,
  "kyc_tier": 1,
  "conversation_history": [ ... last 10 turns ... ]
}
```

This JSON is prepended to every system prompt by the Express.js context injection layer. The result is indistinguishable from a per-user model — at a fraction of the cost and with no additional infrastructure.

---

## 2. Protocol & Oracle Infrastructure Upgrades

### 2.1 Upgrade: Polygon zkEVM Testnet (Replace Amoy PoS)

**Current state:** Polygon Amoy PoS testnet.

**Recommended upgrade:** Polygon zkEVM Cardona testnet for the primary deployment.

| Dimension | Amoy PoS | zkEVM Cardona |
|---|---|---|
| Security model | Validator set (PoS) | ZK validity proofs |
| Thesis claim | "Blockchain-based banking" | "ZK-secured banking" |
| Gas costs | ~$0.001–0.01 | Comparable on testnet |
| Academic credibility | Moderate | High (ZK is research frontier) |
| Ethereum alignment | Partial (sidechain) | Full (L2 inherits ETH security) |

The stronger security story matters for a financial system targeting institutional trust. "ZK rollup-secured reserve ratios" is a more compelling thesis claim than "PoS-secured reserve ratios."

### 2.2 Upgrade: Chainlink Functions — Trustless ML Oracle

**Current state:** Custom commit-reveal oracle relaying AI/ML risk scores (v23 architecture). This requires trusting the operator running the oracle node.

**Recommended upgrade:** Chainlink Functions for trustless ML score commitment.

```javascript
// Chainlink Functions source (runs in decentralised DON)
const clientId = args[0];
const response = await Functions.makeHttpRequest({
  url: `https://your-ml-service.com/score/${clientId}`,
  method: "POST"
});
const score = response.data.risk_score;
return Functions.encodeUint256(Math.round(score * 1e6)); // 6 decimal precision
```

The DON (Decentralised Oracle Network) runs this code across multiple independent nodes. A malicious single node cannot manipulate the risk score — consensus is required. This closes the oracle trust assumption that v23 notes as a limitation (2-of-3 Safe multisig was the mitigation; Chainlink Functions removes the need for that mitigation entirely).

### 2.3 Upgrade: Chainlink Automation — Time-Based Triggers

Currently, installment due-date checks and interest accrual require manual triggering or a centralised cron job. Chainlink Automation replaces both with a trustless, decentralised trigger:

```solidity
// In LocalBankPool.sol
function checkUpkeep(bytes calldata) external view override
    returns (bool upkeepNeeded, bytes memory performData) {
    // Check if any installments are overdue
    uint256[] memory overdueLoans = getOverdueLoans();
    upkeepNeeded = overdueLoans.length > 0;
    performData = abi.encode(overdueLoans);
}

function performUpkeep(bytes calldata performData) external override {
    uint256[] memory overdueLoans = abi.decode(performData, (uint256[]));
    for (uint i = 0; i < overdueLoans.length; i++) {
        _markInstallmentOverdue(overdueLoans[i]);
    }
}
```

This removes the last centralised component from the loan lifecycle. The entire process from application to overdue flagging runs without a trusted operator.

### 2.4 Add: Chainlink Price Feeds — BDT/USD and ETH/USD

The current architecture uses a "forex oracle approved by governance." Replace this with Chainlink's production-grade price feed contracts:

```solidity
// In LocalBankPool.sol — BDT/USD for retail loan display
AggregatorV3Interface internal bdtUsdFeed;
AggregatorV3Interface internal ethUsdFeed;

constructor() {
    // Polygon zkEVM Cardona testnet addresses (use Chainlink docs for current)
    bdtUsdFeed = AggregatorV3Interface(0x...);
    ethUsdFeed = AggregatorV3Interface(0x...);
}

function getBdtEquivalent(uint256 usdcAmount) public view returns (uint256) {
    (, int bdtRate,,,) = bdtUsdFeed.latestRoundData();
    // USDC tracks USD 1:1, so USDC amount × BDT/USD rate = BDT amount
    return usdcAmount * uint256(bdtRate) / 1e8; // Chainlink uses 8 decimals
}
```

This is cited in the feature checklist as a Sprint 1 item. Every BDT display in the frontend flows through this function.

### 2.5 Add: The Graph Subgraph — Real-Time Event Indexing

The current architecture uses TimescaleDB for analytics. The Graph adds a GraphQL query layer over on-chain events:

```graphql
# schema.graphql — CWB subgraph
type LoanApplication @entity {
  id: ID!
  clientId: Bytes!
  localBankId: Bytes!
  amount: BigInt!
  status: String!
  riskScore: BigDecimal
  timestamp: BigInt!
}

type ReserveRatioSnapshot @entity {
  id: ID!
  tier: Int!
  ratio: BigDecimal!
  block: BigInt!
}
```

The reserve transparency dashboard (from CWB_Improvement_Analysis.md Section 2.4) queries this subgraph rather than polling the contract directly. This gives sub-second dashboard refresh without any backend infrastructure.

### 2.6 Upgrade: Chainlink Proof of Reserve

The feature checklist lists this as a Sprint 1 build item. The `WorldBankReserve` contract publishes its reserve balance to Chainlink PoR, making it cryptographically verifiable by any external system without trusting CWB's admin:

```solidity
// WorldBankReserve.sol
bytes32 public constant RESERVE_JOB_ID = "...";  // Chainlink PoR job

function getReserveSummary() external view returns (
    uint256 totalDeposited,
    uint256 totalLoaned,
    uint256 reserveRatio,   // scaled by 1e4 (e.g. 5000 = 50%)
    uint256 insuranceFundBalance
) {
    return (
        totalDeposited,
        totalLoaned,
        (totalDeposited - totalLoaned) * 1e4 / totalDeposited,
        insuranceFund.balance()
    );
}
```

This function is the "free PoR" advantage over FTX described in CWB_Improvement_Analysis.md Section 3.7. Adding Chainlink's PoR job on top turns it into a market-standard verifiable proof.

---

## 3. Compliance & Regulatory Architecture

This section synthesises the Binance SE Architecture (Sections 4.7 and 6.5) and the Binance Architecture Research (Section 6.3) to add formal compliance flows that strengthen the thesis's institutional credibility.

### 3.1 FATF Travel Rule Compliance (R.16)

The Financial Action Task Force Travel Rule requires that transfers above a threshold (USD 1,000 in most jurisdictions) include originator and beneficiary information. For CWB's cross-tier transfers (Local Bank → National Bank → World Bank), this applies to inter-tier capital flows.

**What to add to the thesis:**

The `InterBankLendingPool` and `UpwardDepositFacility` contracts should include an off-chain Travel Rule data packet alongside the on-chain transfer. The packet is stored in the PostgreSQL `audit_logs` table and is available to regulators via the audit request workflow.

```
Travel Rule Packet (off-chain, linked to on-chain tx hash):
{
  "originator_institution": "LocalBank-BD-042",
  "originator_tier": 3,
  "beneficiary_institution": "NationalBank-BD-001",
  "beneficiary_tier": 2,
  "amount_usdc": 5000,
  "purpose": "IBLP_REPAYMENT",
  "onchain_tx_hash": "0xABC...",
  "timestamp": "2026-06-01T10:00:00Z"
}
```

Scope this to Future Work for Bangladesh deployment (Travel Rule compliance is jurisdiction-specific and not required for testnet). Include the data structure as a specification contribution.

### 3.2 SAR (Suspicious Activity Report) Workflow

The Binance SE architecture (Section 4.7, AML Activity) shows a formal SAR filing path triggered when a transaction risk score exceeds 70. CWB's Isolation Forest anomaly detection should feed this same workflow:

```
ANOMALY DETECTION → SAR WORKFLOW
──────────────────────────────────
1. Isolation Forest flags wallet: anomaly_score > 0.75
2. AI_ML_LOG records: {wallet_id, score, timestamp, features}
3. Express.js backend emits Kafka topic: aml-alert
4. Admin dashboard shows alert in compliance queue
5. Bank officer reviews:
   ├── FALSE POSITIVE → dismiss + document reason (audit trail)
   └── CONFIRMED → generate SAR record in audit_logs
                   → notify tier above (National Bank)
                   → freeze wallet via LocalBank.freezeAccount(clientId)
```

The `freezeAccount` function must exist in `LocalBankPool.sol` with an `onlyApprover` modifier. The freeze prevents new loan disbursements and installment payments from the frozen wallet until unfrozen by the tier above.

### 3.3 Regulator Audit Request Flow

Based on Binance SE Architecture Section 6.5. Add a formal regulator interface to the thesis architecture:

```
REGULATOR AUDIT REQUEST SEQUENCE
─────────────────────────────────
Regulator submits signed request (off-chain)
    │
    ▼
World Bank admin verifies mandate (multi-sig confirmation)
    │
    ▼
System extracts:
  - Client loan history (loans table)
  - Installment payment records
  - AI/ML risk score log (AI_ML_LOG)
  - On-chain transaction hashes
  - SAR history if applicable
    │
    ▼
Encrypted data package (regulator's public key)
    │
    ▼
Audit response logged in audit_logs (immutable)
```

This workflow does not need to be implemented — specifying it in the Architecture chapter adds significant credibility to the institutional trust bootstrapping strategy.

### 3.4 Failed Attempt Lockout — Withdrawal Protection

From Binance's activity diagram (Section 4.6): after 5 failed 2FA attempts, the account is locked for 30 minutes and the user is notified. Apply this to CWB's loan application confirmation gate:

```
After 3 failed confirmation responses (unclear consent) → agent pauses for 10 minutes
After suspicious command injection attempt → session terminated + logged
Address whitelisting: loan disbursement addresses are fixed at KYC time and cannot be changed without a 24-hour delay + 2FA re-verification
```

---

## 4. Actor Taxonomy & Permission Matrix

The Binance SE Architecture (Section 2) provides a formal actor model that CWB's architecture chapter should mirror. This is standard systems analysis that examiners expect.

### 4.1 CWB Actor Taxonomy

```
CWB SYSTEM — ALL ACTORS
│
├── PRIMARY ACTORS (initiate actions)
│   ├── A1 · RETAIL CLIENT
│   │   ├── Basic (pre-KYC, browsing only)
│   │   ├── KYC Tier 1 (Bronze/Silver credit tier, small loans)
│   │   └── KYC Tier 2 (Gold/Platinum/Diamond, larger limits)
│   │
│   ├── A2 · LOCAL BANK ADMIN (Approver)
│   │   ├── Loan approver (approve/decline/request docs)
│   │   └── Risk officer (reviews AML alerts)
│   │
│   ├── A3 · NATIONAL BANK ADMIN
│   │   ├── Capital allocator (manages Local Bank borrowing caps)
│   │   └── Compliance officer (SAR review, freeze authority)
│   │
│   ├── A4 · WORLD BANK ADMIN (Governance)
│   │   ├── Parameter governor (reserve ratios, base rates)
│   │   └── System operator (contract upgrades via multi-sig)
│   │
│   └── A5 · AI AGENT (Autonomous Actor)
│       ├── Read-only tools: always permitted
│       └── Write tools: permitted only after human confirmation gate
│
└── SECONDARY ACTORS (external systems)
    ├── A6 · REGULATORY AUTHORITY (read-only audit access)
    ├── A7 · CHAINLINK DON (oracle, price feeds, automation)
    ├── A8 · BLOCKCHAIN VALIDATOR (Polygon zkEVM)
    └── A9 · EXTERNAL AUDITOR (PoR verification)
```

### 4.2 CWB Actor Permission Matrix

```
ACTION                       │ Client │ LB Admin │ NB Admin │ WB Admin │ AI Agent
─────────────────────────────┼────────┼──────────┼──────────┼──────────┼──────────
View own loan status         │  YES   │   YES*   │  YES*    │   YES*   │  READ
Submit loan application      │  YES   │    NO    │   NO     │    NO    │ WRITE†
Pay installment              │  YES   │    NO    │   NO     │    NO    │ WRITE†
Submit KYC documents         │  YES   │    NO    │   NO     │    NO    │  NO
Approve loan application     │  NO    │   YES    │   NO     │    NO    │  NO
Reject loan application      │  NO    │   YES    │   NO     │    NO    │  NO
Freeze client account        │  NO    │   YES    │   YES    │   YES    │  NO
Set borrowing rate           │  NO    │    NO    │   YES    │   YES    │  NO
Change reserve ratio         │  NO    │    NO    │    NO    │   YES    │  NO
Upgrade LB borrowing cap     │  NO    │    NO    │   YES    │   YES    │  NO
Deploy new Local Bank        │  NO    │    NO    │   YES    │   YES    │  NO
View audit logs (all)        │  NO    │   YES*   │   YES*   │   YES    │  NO
Generate SAR report          │  NO    │   YES    │   YES    │   YES    │  NO
View reserve summary (public)│  YES   │   YES    │   YES    │   YES    │  READ
─────────────────────────────┴────────┴──────────┴──────────┴──────────┴──────────
* own tier only   † requires explicit human confirmation gate in conversation
```

---

## 5. Database Schema Improvements

This section synthesises the Binance DB normalization research (Sections 9–10) and the exchange DB normalization interactive reference to identify gaps in the CWB PostgreSQL schema.

### 5.1 Add: Formal `sessions` Table

The CWB schema has `CHAT_MESSAGE` and `AI_ML_LOG` but no formal session management table. Add:

```sql
CREATE TABLE sessions (
  session_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID         NOT NULL REFERENCES client(client_id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  device_hash   VARCHAR(256),
  ip_address    INET         NOT NULL,
  session_key_hash VARCHAR(256),        -- EIP-7702 session key hash (if active)
  session_key_scope JSONB,              -- {"tools": ["pay_installment"], "cap_usdc": 500}
  session_key_expires_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ  NOT NULL,
  revoked       BOOLEAN      NOT NULL DEFAULT FALSE
);
```

### 5.2 Add: `agent_action_log` Table

Separate from `AI_CHATBOT_LOG` (which logs Q&A turns), this table records every write-tool execution:

```sql
CREATE TABLE agent_action_log (
  action_id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID         NOT NULL REFERENCES sessions(session_id),
  client_id       UUID         NOT NULL REFERENCES client(client_id),
  tool_name       VARCHAR(50)  NOT NULL,   -- 'submit_loan_application', 'pay_installment'
  parameters      JSONB        NOT NULL,
  confirmation_turn_id UUID,              -- FK to chat_message.message_id (the "yes" message)
  onchain_tx_hash VARCHAR(128),
  status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
                               -- PENDING | SUBMITTED | CONFIRMED | FAILED
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  confirmed_at    TIMESTAMPTZ
);
-- This table is append-only: no UPDATE or DELETE via DB policy
```

### 5.3 Add: `interest_rate_tier` Table (Normalisation Fix)

Currently, interest rate parameters are columns in each bank-tier table. This creates a transitive dependency. Extract to a separate table:

```sql
CREATE TABLE interest_rate_tier (
  tier_id          SMALLINT     PRIMARY KEY,  -- 1=WorldBank, 2=NatBank, 3=LocBank
  base_rate        NUMERIC(8,6) NOT NULL,
  kink_utilization NUMERIC(5,4) NOT NULL,
  rate_above_kink  NUMERIC(8,6) NOT NULL,
  max_rate         NUMERIC(8,6) NOT NULL,
  last_updated     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

### 5.4 Add: `collateral_asset` FK in `LOAN` Table

Applying the Binance DB normalization pattern (assets table → orders): the LOAN table should reference a collateral asset by FK rather than storing the asset symbol inline:

```sql
-- Add to existing LOAN table:
ALTER TABLE loan ADD COLUMN collateral_asset_id UUID REFERENCES assets(asset_id);
ALTER TABLE loan ADD COLUMN loan_asset_id       UUID REFERENCES assets(asset_id);
-- Remove any inline collateral_symbol VARCHAR column if it exists.

-- New assets table for CWB (maps to Binance's normalized assets table):
CREATE TABLE assets (
  asset_id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol        VARCHAR(20)  UNIQUE NOT NULL,  -- USDC, USDT, wETH
  name          VARCHAR(100) NOT NULL,
  asset_type    VARCHAR(20)  NOT NULL,          -- STABLECOIN | CRYPTO | RWA
  network       VARCHAR(50),
  decimals      SMALLINT     NOT NULL DEFAULT 6,  -- USDC uses 6 decimals
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE
);
```

### 5.5 Enforce Append-Only on `audit_logs`

From the Binance schema (Section 10.2): audit logs are immutable by DB policy:

```sql
-- Create restricted write-only role:
CREATE ROLE audit_writer;
GRANT INSERT ON audit_logs TO audit_writer;
REVOKE UPDATE, DELETE ON audit_logs FROM audit_writer;
REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;

-- Enforce via row-level security (no admin can delete):
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_insert_only ON audit_logs
  FOR INSERT WITH CHECK (TRUE);
-- No SELECT policy = only audit_writer role can insert; admin reads via separate view
```

### 5.6 Composite Index Strategy (From Binance Schema)

```sql
-- Loan lifecycle queries (most common pattern):
CREATE INDEX idx_loan_bank_status   ON loan(local_bank_id, status, created_at DESC);
CREATE INDEX idx_loan_client_active ON loan(client_id, status) WHERE status = 'ACTIVE';
CREATE INDEX idx_installment_due    ON installment(due_date, status) WHERE status = 'PENDING';

-- Agent action log queries:
CREATE INDEX idx_agent_client_date  ON agent_action_log(client_id, created_at DESC);
CREATE INDEX idx_agent_status       ON agent_action_log(status) WHERE status = 'PENDING';

-- AML alert queries:
CREATE INDEX idx_aiml_score         ON ai_ml_log(anomaly_score DESC) WHERE anomaly_score > 0.5;
```

---

## 6. Revenue Model & Tokenomics Discipline

### 6.1 CWB Revenue Streams (From Ecosystem Dashboard Analysis)

The cryptocurrency exchange ecosystem dashboard identifies the following revenue streams for major platforms. CWB's equivalents:

| Revenue Stream | Binance | CWB Equivalent |
|---|---|---|
| Trading fees (spot/derivatives) | Primary (0.1%) | Loan origination fee (0.5–1%) |
| Native token ecosystem | BNB utility + burn | Deferred to Future Work (FTX lesson) |
| Staking & yield products | Binance Earn | SavingsVault + FixedDeposit |
| Listing & launchpad fees | $500K+ per listing | Local Bank registration fee |
| OTC & institutional desk | Dedicated desk | Syndicated Loan / Tranched Pool |
| Data feeds & analytics | API subscriptions | Reserve transparency API (Phase 3) |
| Interest spread | Savings-to-lending spread | PRIMARY — already fully modelled |

The interest spread is CWB's primary revenue mechanism and is already fully modelled. The above table confirms CWB has a diversified revenue path even without a native token.

### 6.2 Native Token — Hard Deferred Rule

From the FTX collapse analysis and the ecosystem dashboard comparison:

```
HARD RULE: No native CWB governance token in the thesis prototype.

Reasons:
1. FTX lesson: self-minted tokens as collateral = systemic failure risk
2. Binance's BNB took 7 years and $16.8B/year revenue to build legitimately
3. A thesis token introduces tokenomics complexity that distracts from the
   core four-tier banking contribution
4. The Credit Passport SBT already provides on-chain reputation without
   creating a speculative asset

Future Work framing: "A native governance token with quarterly burn mechanics
and fee-discount utility (analogous to BNB's model) is specified in Appendix X.
Issuance is scoped to Phase 3 following institutional trust bootstrapping,
with explicit anti-FTX collateral hard rules encoded at contract level."
```

### 6.3 300-Client Simulation (From Feature Checklist)

The feature checklist specifies a Foundry script stress test with 300 clients shown live on the dashboard during the demo. This replaces the Mesa ABM (already removed in v19):

```javascript
// Hardhat simulation script — 300 clients, 6 banks
const NUM_CLIENTS = 300;
const NUM_BANKS = 6;
const SEED = 42; // deterministic

async function runSimulation() {
    // Deploy 6 Local Banks under 2 National Banks under 1 World Bank
    // Seed 300 client wallets with testnet USDC
    // Randomly distribute loan applications (normal distribution)
    // Run 12 months of installment payments (compressed to 12 blocks)
    // Log: default rate, reserve ratio per bank, gas costs per operation
    // Output: CSV for RQ5 evaluation
}
```

The live dashboard during the demo shows this simulation running: new loans being created, installments being paid, reserve ratios fluctuating. This is far more compelling than a static diagram.

---

## 7. Retained Improvements from v23 (Do Not Lose)

These were fully specified in CWB_Improvement_Analysis.md. They remain valid and should be preserved in v24:

| Item | Location in v23 doc | Status |
|---|---|---|
| SAFU-inspired InsuranceFund contract | Section 2.3 | Retain — Sprint 1 build |
| Tiered Hot/Cold/MPC wallet architecture | Section 2.2 | Retain — specify for Tier 1/2 |
| Credit Score Tier schedule (Bronze→Diamond) | Section 2.8 | Retain — Sprint 2 build |
| getReserveSummary() view function | Section 3.7 | Retain — Sprint 1 build |
| Kinked interest rate model (IBLP rate bound) | Section 3.5 | Retain — enforced Sprint 2 |
| No self-minted token collateral (hard rule) | Section 3.2 | Retain — invariant test |
| No backdoors — enforceSolvency() pattern | Section 3.4 | Retain — Foundry test |
| FTX commingling safeguard (separate contracts) | Section 3.1 | Retain — architectural rule |
| Cross-tier Credit Passport portability | Section 8.2 | Retain — specify |
| GroupLendingPool group reputation score | Section 4.4 | Retain — Sprint 2 |
| Microservices decomposition (4 services) | Section 2.1 | Retain — Sprint 3 |
| Apache Kafka loan lifecycle topics | Section 2.6 | Retain — Sprint 2 |
| TimescaleDB analytics pipeline | Section 2.9 | Retain — Sprint 3 |
| GDPR Art. 17 pseudonymity / off-chain deletion | v23 Improvement 8 | Retain — thesis paragraph |
| Academic pilot → BRAC trust bootstrapping | v23 Improvement 9 | Retain — governance section |

---

## 8. Consolidated Sprint Plan — v24 Additions

This builds on the existing Sprint 1/2/3 plan and adds the v24 improvements.

### Sprint 1 (Foundation)

**Already planned:**
- Four-tier smart contract scaffold
- Wallet authentication + ERC-4337
- PostgreSQL schema

**v24 additions:**
- ✅ `InsuranceFund` contract (5% interest capture)
- ✅ `getReserveSummary()` view on each tier contract
- ✅ Chainlink Price Feeds integration (BDT/USD, ETH/USD)
- ✅ Chainlink Proof of Reserve for WorldBankReserve
- ✅ Append-only `audit_logs` DB role
- ✅ `sessions` table + EIP-7702 session key schema
- ✅ `assets` table (normalised from LOAN collateral)
- ✅ Composite indexes (loan + installment + agent)

### Sprint 2 (Lending Features)

**Already planned:**
- Loan application, approval, installment generation
- SavingsVault, FixedDeposit
- GroupLendingPool

**v24 additions:**
- ✅ MCP tool server — 16 banking tools wired to Express.js
- ✅ Agent chat interface (Qwen3-8B + tool calling)
- ✅ Human-gate confirmation pattern in agent conversation flow
- ✅ EIP-7702 session key management (scope + TTL enforcement)
- ✅ Authority brief UI (SHAP breakdown for bank approver dashboard)
- ✅ Chainlink Automation for installment due-date checks
- ✅ EMI reminder cron → agent push notification (3 days + 1 day before due)
- ✅ Credit Tier schedule in Credit Passport (Bronze → Diamond)
- ✅ `agent_action_log` table + `interest_rate_tier` table

### Sprint 3 (AI/ML Security + Demo Polish)

**Already planned:**
- Random Forest + SHAP oracle wiring
- Isolation Forest anomaly detection
- Foundry invariant suite

**v24 additions:**
- ✅ Chainlink Functions oracle replacing commit-reveal relay
- ✅ The Graph subgraph (loan events + reserve ratio snapshots)
- ✅ SAR workflow (anomaly → compliance queue → freeze + log)
- ✅ Reserve Transparency Dashboard (React, queries subgraph)
- ✅ 300-client Foundry simulation (live during demo)
- ✅ No-privileged-exemption Foundry test (all accounts = same liquidation logic)
- ✅ Pool-level Isolation Forest (portfolio anomaly, not just per-loan)
- ✅ `freezeAccount` function with `onlyApprover` modifier + test

---

## 9. What to Specify Only — No Code Required

These earn full academic credit as Phase 2/3 Future Work. Design them rigorously in the thesis; the implementation boundary is clearly stated.

| Feature | Design Depth Required | Key References |
|---|---|---|
| **Groth16 zkKYC circuit** | Circuit design, input/output spec | Polygon ID, zk-X509 for Bangladesh NID |
| **FATF Travel Rule compliance** | Data packet spec, cross-tier protocol | FATF R.16, OpenVASP protocol |
| **Federated learning module** | Architecture + privacy proof sketch | PrivChain-AI (Nature 2025) |
| **On-device AI (Qwen3-0.6B)** | Split inference architecture, NPU profile | ExecuTorch + Snapdragon NPU |
| **Polygon CDK sovereign chain** | Phase 3 architecture diagram | Polygon CDK docs |
| **World ID anti-Sybil** | Integration point in GroupLendingPool | World ID developer docs |
| **On-chain AI model registry** | Training hash commitment scheme | EU AI Act Article 13 |
| **Chainlink CCIP bridge** | Cross-NB capital transfer protocol | Chainlink CCIP docs |
| **SPDI banking charter path** | Regulatory pathway for Bangladesh | Bangladesh Bank FinTech policy 2025 |
| **CBDC integration (Phase 3)** | Digital Taka bridge architecture | BB CBDC pilot documentation |

---

## 10. Summary Reference Table

| Domain | Improvement | Priority | Sprint | Source |
|---|---|---|---|---|
| **AI Agent** | MCP tool server — 16 restricted banking tools | Critical | Sprint 2 | Feature checklist |
| **AI Agent** | Human-gate confirmation pattern | Critical | Sprint 2 | Design session |
| **AI Agent** | EIP-7702 session keys (scoped, time-bound) | High | Sprint 2 | Feature checklist |
| **AI Agent** | Authority brief UI with SHAP breakdown | High | Sprint 2 | Feature checklist |
| **AI Agent** | EMI reminder cron + push notification | Medium | Sprint 2 | Design session |
| **AI Agent** | Per-user context namespace (not per-user model) | High | Sprint 2 | Design session |
| **Protocol** | Polygon zkEVM Cardona (replace Amoy PoS) | High | Sprint 1 | Feature checklist |
| **Protocol** | Chainlink Functions oracle (replace commit-reveal) | High | Sprint 3 | Feature checklist |
| **Protocol** | Chainlink Automation (time-based triggers) | High | Sprint 2 | Feature checklist |
| **Protocol** | Chainlink Price Feeds (BDT/USD, ETH/USD) | High | Sprint 1 | Feature checklist |
| **Protocol** | Chainlink Proof of Reserve (WorldBankReserve) | High | Sprint 1 | Feature checklist |
| **Protocol** | The Graph subgraph (event indexing) | Medium | Sprint 3 | Feature checklist |
| **Compliance** | FATF Travel Rule data packet (specify only) | Medium | Future Work | Binance SE Architecture |
| **Compliance** | SAR workflow (Isolation Forest → freeze → log) | High | Sprint 3 | Binance SE Architecture |
| **Compliance** | Regulator audit request flow (specify only) | Medium | Future Work | Binance SE Architecture |
| **Compliance** | `freezeAccount` with `onlyApprover` + Foundry test | High | Sprint 3 | Binance SE Architecture |
| **Compliance** | Failed-attempt lockout (3 attempts → 10 min pause) | Low | Sprint 2 | Binance SE Architecture |
| **Actors** | Formal 5-actor taxonomy + permission matrix | Medium | Pre-thesis | Binance SE Architecture |
| **Actors** | AI Agent as formal system actor (A5) | High | Pre-thesis | Design session |
| **Database** | `sessions` table + EIP-7702 session key schema | High | Sprint 1 | Binance DB schema |
| **Database** | `agent_action_log` table (append-only) | High | Sprint 2 | Design session |
| **Database** | `interest_rate_tier` table (normalisation fix) | Medium | Sprint 1 | v23 improvement |
| **Database** | `assets` table + collateral_asset_id FK in LOAN | Medium | Sprint 1 | Binance DB schema |
| **Database** | Append-only `audit_logs` via DB role + RLS | Critical | Sprint 1 | Binance DB schema |
| **Database** | Composite indexes (loan, installment, agent) | Medium | Sprint 1 | Binance DB schema |
| **Simulation** | 300-client Foundry script (live demo) | High | Sprint 3 | Feature checklist |
| **Revenue** | No native token in prototype (FTX rule) | Critical | Architectural | Ecosystem dashboard |
| **Revenue** | InsuranceFund contract (5% interest capture) | High | Sprint 1 | v23 improvement |
| **Specify only** | Groth16 zkKYC circuit | — | Future Work | Feature checklist |
| **Specify only** | Federated learning module | — | Future Work | Feature checklist |
| **Specify only** | World ID anti-Sybil for GroupLendingPool | — | Future Work | Feature checklist |
| **Specify only** | Polygon CDK sovereign chain (Phase 3) | — | Future Work | Feature checklist |

---

*Document compiled: May 2026*
*Sources: CWB Pre-thesis v23 · CWB_Improvement_Analysis.md · cwb_final_feature_checklist.html · Binance Architecture Research · Binance Software Engineering Architecture · Exchange DB Normalization Reference · Crypto Exchange Ecosystem Dashboard · AI Agent Design Session (May 2026)*

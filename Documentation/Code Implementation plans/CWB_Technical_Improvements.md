# Crypto World Bank — Technical Improvements
## Making the Prototype Practically Viable

> **Context:** This document analyzes Pre-thesis v13 (the full LaTeX source) and the Banking Expert Analysis attachment against current 2025–2026 research. It targets the gap between the project's conceptual design and what it takes to function as a runnable, demonstrable, and academically credible system. The improvements are organized by system layer and marked by effort level: 🟢 Low (hours), 🟡 Medium (days), 🔴 High (weeks).

---

## The Honest Gap Diagnosis

Before jumping to solutions, it helps to name what's actually incomplete. From reading the thesis carefully:

**What is fully built and testnet-verified:** World Bank Reserve contract, loan request/approval workflow, role-based access control, database schema (15 tables), basic frontend dashboard with wallet connection.

**What is designed but not integrated:** The AI/ML models (Random Forest, Isolation Forest, SHAP) exist as standalone scripts but aren't connected to the API or the contracts. The commit-reveal oracle relay is documented but not coded. The Express.js backend is scaffolded but the ML inference endpoints aren't wired up.

**What is planned but not started:** National Bank and Local Bank full contract implementations, SavingsVault, FixedDeposit, GroupLendingPool, InterBankLendingPool, Chainlink integration, ZKP KYC, and the 9B fine-tuned LLM.

The most impactful improvements are therefore not in the planned features but in **completing the integration of what's already built** and **making the architecture production-grade where it's half-done.**

---

## 1. Smart Contract Layer

### 1.1 🟡 Complete the Cross-Tier Fund Transfer — The Single Biggest Gap

The thesis lists cross-tier fund transfer as "designed, unimplemented." This is the backbone of the entire four-tier banking model. Without it, the National Bank and Local Bank contracts are isolated islands — a World Bank admin cannot allocate capital downward, and surplus cannot flow back up. This must be implemented before the demo is credible.

**What to build:**

```solidity
// WorldBankReserve.sol — add allocateToNationalBank
function allocateToNationalBank(
    address nationalBank,
    uint256 amount
) external onlyRole(WORLD_BANK_ADMIN) nonReentrant {
    require(amount > 0 && amount <= getAvailableReserve(), "Invalid amount");
    require(hasRole(NATIONAL_BANK_ROLE, nationalBank), "Not a registered NB");
    
    allocatedToNationalBank[nationalBank] += amount;
    totalAllocated += amount;
    
    (bool success, ) = payable(nationalBank).call{value: amount}("");
    require(success, "Transfer failed");
    
    emit CapitalAllocated(nationalBank, amount, block.timestamp);
}

// NationalBankContract.sol — add allocateToLocalBank (mirror pattern)
// LocalBankContract.sol — add disburseLoanToUser (with AI risk gate)
// All three — add surplus repatriation: returnSurplusToParent()
```

**The surplus repatriation function** is equally important — it's what allows the "self-regulating capital cycle" claim to be empirically demonstrated during the demo.

### 1.2 🟢 UUPS Proxy Pattern for All Contracts

The thesis mentions the Proxy/Upgradeable Pattern as a design decision but doesn't specify which variant. **Use UUPS (Universal Upgradeable Proxy Standard, ERC-1822) rather than Transparent Proxy.** OpenZeppelin now recommends UUPS for all new projects because it's cheaper to deploy (no ProxyAdmin contract needed) and the upgrade logic lives in the implementation, making it governable via the existing RBAC.

```solidity
// Each contract becomes:
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract WorldBankReserve is 
    Initializable, 
    UUPSUpgradeable, 
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable 
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address admin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // Only WORLD_BANK_ADMIN can authorize upgrades
    function _authorizeUpgrade(address) internal override onlyRole(WORLD_BANK_ADMIN) {}
}
```

**Why this matters practically:** Without upgradeability, any bug found after the demo requires redeploying from scratch and migrating all state. With UUPS + Safe multisig governance, you can patch a bug and propose the upgrade for team approval in minutes, with full on-chain audit trail.

### 1.3 🟡 TimeLock Controller for All Governance Actions

Any call that changes a system-level parameter (interest rates, reserve ratios, role assignments above Local Bank level) should go through a minimum 24-hour TimeLock. This is standard practice in production DeFi since at least 2021.

```solidity
// Deploy once, referenced by all contracts
import "@openzeppelin/contracts/governance/TimelockController.sol";

// In deployment script:
address[] memory proposers = [teamMultiSig]; // Safe wallet
address[] memory executors = [teamMultiSig];
TimelockController timelock = new TimelockController(
    86400,     // 24-hour minimum delay
    proposers,
    executors,
    address(0) // no admin (decentralized)
);
```

For the university demo specifically, a 24-hour TimeLock can be set to 5 minutes for the demo environment without changing the architecture — show examiners the governance proposal queued and executed, which is itself impressive.

### 1.4 🟢 Add Role Expiry to All Role Grants

Currently roles are permanent once granted. Banks can have their license revoked in real life. Borrowers should have KYC re-verified annually. Add an expiry timestamp to every role binding:

```solidity
mapping(address => mapping(bytes32 => uint256)) public roleExpiry;

function grantRoleWithExpiry(
    bytes32 role,
    address account,
    uint256 expiryTimestamp
) external onlyRole(getRoleAdmin(role)) {
    grantRole(role, account);
    roleExpiry[account][role] = expiryTimestamp;
}

modifier roleNotExpired(bytes32 role) {
    require(
        roleExpiry[msg.sender][role] == 0 || 
        roleExpiry[msg.sender][role] > block.timestamp,
        "Role has expired"
    );
    _;
}
```

Apply `roleNotExpired(BORROWER_ROLE)` to all loan request functions. This is a 30-minute addition that resolves a real regulatory concern the banking expert raised (ongoing compliance, not just one-time KYC).

### 1.5 🟡 Pause Circuit Breaker with Granularity

The thesis mentions an "emergency pause mechanism" but doesn't specify it. The naive implementation (`Pausable` on the whole contract) is too coarse — pausing the entire World Bank Reserve when only one Local Bank has a problem causes unnecessary disruption. Use **per-function** and **per-tier** pause controls:

```solidity
// Fine-grained pause: pause only loans, not withdrawals
mapping(bytes32 => bool) public functionPaused;

bytes32 public constant LOAN_DISBURSEMENT = keccak256("LOAN_DISBURSEMENT");
bytes32 public constant DEPOSITS = keccak256("DEPOSITS");
bytes32 public constant WITHDRAWALS = keccak256("WITHDRAWALS");

modifier notPaused(bytes32 functionId) {
    require(!functionPaused[functionId], "Function paused");
    _;
}

// Governance can pause specific functions
function pauseFunction(bytes32 functionId) external onlyRole(WORLD_BANK_ADMIN) {
    functionPaused[functionId] = true;
    emit FunctionPaused(functionId, msg.sender, block.timestamp);
}
```

### 1.6 🟡 Gas Optimization — Storage Layout and Event Design

A gaming PC can run tests easily, but gas cost is still a real metric that appears in the feasibility chapter. Three concrete optimizations:

**Pack storage variables** — Solidity packs variables that fit in the same 32-byte slot. Group `uint128` pairs together instead of using `uint256` for every variable:

```solidity
// Before (wastes 2 slots)
uint256 public loanAmount;
uint256 public loanTimestamp;

// After (shares 1 slot — saves ~20,000 gas per SSTORE)
uint128 public loanAmount;
uint128 public loanTimestamp;
```

**Index events correctly** — Only index parameters you'll actually filter on. Over-indexing wastes gas. Under-indexing makes The Graph subgraph impossible to build correctly:

```solidity
// Correct indexing for a lending platform:
event LoanRequested(
    uint256 indexed loanId,      // index: needed for loan-specific queries
    address indexed borrower,    // index: needed for user-specific queries
    address indexed localBank,   // index: needed for bank-specific queries
    uint256 amount,              // not indexed: read from event data
    uint256 timestamp            // not indexed: read from block
);
```

**Use `calldata` not `memory` for read-only array parameters:**

```solidity
// Costs less gas for external functions reading arrays
function batchRegisterBorrowers(address[] calldata borrowers) external {...}
```

---

## 2. Backend (Express.js + FastAPI) Layer

### 2.1 🔴 Wire the AI/ML Models to the Oracle — The Critical Integration Gap

This is the most consequential unfinished integration in the prototype. The thesis describes a well-thought-out commit-reveal oracle pattern, and the ML models are trained. But they're not connected. Here is the complete integration path:

**Step 1 — FastAPI ML inference endpoint (what needs to exist):**

```python
# fastapi/routes/risk_score.py
@app.post("/api/v1/risk-score")
async def get_risk_score(request: LoanApplicationRequest):
    features = feature_engineer(request)
    
    # Random Forest fraud score
    fraud_prob = rf_model.predict_proba([features])[0][1]
    
    # Isolation Forest anomaly score  
    anomaly_score = -if_model.score_samples([features])[0]  # higher = more anomalous
    
    # Composite risk score (0-1, higher = riskier)
    risk_score = 0.7 * fraud_prob + 0.3 * min(anomaly_score / 0.5, 1.0)
    
    # SHAP explanation
    shap_values = explainer.shap_values([features])[0]
    top_factors = get_top_shap_factors(shap_values, feature_names, n=3)
    
    # Commit hash for oracle (score + nonce)
    nonce = secrets.token_hex(16)
    commitment = keccak256(encode(risk_score, nonce))
    
    # Store commitment temporarily in Redis (TTL: loan decision window)
    await redis.setex(f"commitment:{request.loan_id}", 3600, json.dumps({
        "score": risk_score, "nonce": nonce, "commitment": commitment
    }))
    
    return {
        "loan_id": request.loan_id,
        "risk_score": risk_score,
        "commitment": commitment,
        "shap_factors": top_factors,
        "recommendation": "APPROVE" if risk_score < 0.4 else "REVIEW" if risk_score < 0.7 else "REJECT"
    }

@app.post("/api/v1/risk-score/reveal/{loan_id}")
async def reveal_risk_score(loan_id: str):
    """Called by the Express backend after the commitment is on-chain"""
    data = await redis.get(f"commitment:{loan_id}")
    if not data:
        raise HTTPException(404, "Commitment not found or expired")
    return json.loads(data)  # Returns score + nonce for on-chain reveal
```

**Step 2 — Express.js orchestration (the missing glue):**

```javascript
// express/routes/loan.js — add the oracle relay workflow
router.post('/loans/:id/evaluate', authenticate, async (req, res) => {
    const { loanId } = req.params;
    
    // 1. Get loan details from DB
    const loan = await db.loans.findById(loanId);
    
    // 2. Request ML risk score from FastAPI
    const riskResponse = await axios.post(`${FASTAPI_URL}/api/v1/risk-score`, {
        loan_id: loanId,
        wallet_address: loan.borrower_wallet,
        amount_eth: loan.amount,
        loan_duration_months: loan.duration,
        on_chain_history: await fetchOnChainHistory(loan.borrower_wallet),
        income_hash: loan.income_hash
    });
    
    // 3. Submit commitment to smart contract
    const tx = await loanContract.commitRiskScore(
        loanId,
        riskResponse.data.commitment
    );
    await tx.wait();
    
    // 4. Store commitment tx hash in DB
    await db.loans.update(loanId, {
        risk_commitment_tx: tx.hash,
        risk_score_pending: true,
        shap_explanation: riskResponse.data.shap_factors
    });
    
    // 5. After block confirmation, reveal the score
    setTimeout(async () => {
        const revealData = await axios.post(
            `${FASTAPI_URL}/api/v1/risk-score/reveal/${loanId}`
        );
        await loanContract.revealRiskScore(
            loanId,
            revealData.data.score,
            revealData.data.nonce
        );
    }, 15000); // wait 15 seconds for block finality
    
    res.json({ status: 'evaluation_started', commitment: riskResponse.data.commitment });
});
```

This is the integration that transforms the project from "ML models exist separately" to "AI-integrated on-chain lending decision system" — which is one of the core research claims.

### 2.2 🟡 WebSocket Event Listener Service — Real-Time Dashboard

Currently the frontend likely polls the blockchain via RPC calls, which is slow and wastes requests. Replace with a WebSocket event listener service running in the Express.js backend:

```javascript
// express/services/blockchain-listener.js
import { ethers } from 'ethers';
import { Server } from 'socket.io';

const wsProvider = new ethers.WebSocketProvider(
    `wss://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_KEY}`
);

export function startEventListeners(io: Server) {
    const localBankContract = new ethers.Contract(
        LOCAL_BANK_ADDRESS, LOCAL_BANK_ABI, wsProvider
    );

    // Listen for loan events and push to connected frontend clients
    localBankContract.on('LoanRequested', (loanId, borrower, amount, event) => {
        io.to(`bank:${LOCAL_BANK_ADDRESS}`).emit('loan:new', {
            loanId: loanId.toString(),
            borrower,
            amount: ethers.formatEther(amount),
            txHash: event.log.transactionHash,
            timestamp: Date.now()
        });
    });

    localBankContract.on('LoanApproved', (loanId, borrower, amount) => {
        // Push notification to borrower's socket room
        io.to(`user:${borrower}`).emit('loan:approved', { loanId, amount });
        // Also trigger ML evaluation
        triggerRiskEvaluation(loanId, borrower, amount);
    });

    localBankContract.on('RepaymentReceived', (loanId, installmentNum, amount) => {
        io.to('admin:dashboard').emit('repayment:received', { loanId, installmentNum, amount });
    });

    // Reconnect on drop
    wsProvider.on('error', () => {
        setTimeout(() => startEventListeners(io), 5000);
    });
}
```

**Frontend React hooks to consume this:**

```typescript
// hooks/useLoanEvents.ts
export function useLoanEvents(userWallet: string) {
    const [events, setEvents] = useState<LoanEvent[]>([]);
    
    useEffect(() => {
        const socket = io(BACKEND_URL);
        socket.emit('join', `user:${userWallet}`);
        
        socket.on('loan:approved', (data) => {
            setEvents(prev => [...prev, { type: 'APPROVED', ...data }]);
            toast.success(`Loan approved: ${data.amount} ETH`);
        });
        
        socket.on('loan:new', (data) => {
            setEvents(prev => [...prev, { type: 'NEW_APPLICATION', ...data }]);
        });
        
        return () => socket.disconnect();
    }, [userWallet]);
    
    return events;
}
```

This transforms the dashboard from a static page requiring manual refresh into a live banking dashboard — loans appear and update in real-time as they're processed on-chain.

### 2.3 🟡 Redis — Implement Properly with TTL Strategy

The thesis mentions Redis as a cache but gives no specification. A concrete caching strategy for the three data access patterns in this project:

| Cache Key Pattern | TTL | What's Cached | Invalidation |
|---|---|---|---|
| `market:ETH_USD` | 60 seconds | CoinGecko price | TTL expiry |
| `user:roles:{wallet}` | 300 seconds | On-chain role state | Evict on RoleGranted event |
| `loan:status:{loanId}` | 30 seconds | Current loan state | Evict on any loan event |
| `bank:reserve:{address}` | 15 seconds | Reserve balance | Evict on CapitalAllocated event |
| `ai:risk:{loanId}` | 3600 seconds | ML risk score | Never update; create-once |
| `session:{jwt_id}` | 900 seconds | JWT validity (blacklist) | Add on logout |

```javascript
// express/middleware/cache.js
export const cacheMiddleware = (keyFn: Function, ttl: number) => 
    async (req, res, next) => {
        const key = keyFn(req);
        const cached = await redis.get(key);
        
        if (cached) {
            res.json(JSON.parse(cached));
            return;
        }
        
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            redis.setex(key, ttl, JSON.stringify(data));
            originalJson(data);
        };
        next();
    };

// Usage in routes
router.get('/api/market/price/:symbol', 
    cacheMiddleware(req => `market:${req.params.symbol}`, 60),
    async (req, res) => {
        const price = await coingecko.getPrice(req.params.symbol);
        res.json(price);
    }
);
```

**JWT blacklist pattern** — when a user logs out or a key is revoked, add the `jti` (JWT ID) to a Redis set with expiry matching the token's remaining lifetime. Every authenticated request checks this set:

```javascript
// On logout:
await redis.setex(`blacklist:${jwt_id}`, remaining_ttl, '1');

// On each request:
const isBlacklisted = await redis.exists(`blacklist:${decoded.jti}`);
if (isBlacklisted) throw new UnauthorizedError('Token revoked');
```

### 2.4 🟢 Structured Logging with Correlation IDs

Currently there's no mention of logging strategy. For a banking prototype, every request should carry a correlation ID from frontend → Express → FastAPI → on-chain, so that when an examiner asks "what happened to loan 0x42?", you can trace the entire journey:

```javascript
// express/middleware/logger.js
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

export const requestLogger = (req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    res.setHeader('x-correlation-id', req.correlationId);
    
    logger.info({
        correlationId: req.correlationId,
        method: req.method,
        path: req.path,
        walletAddress: req.user?.wallet,
        role: req.user?.role,
        timestamp: new Date().toISOString()
    });
    next();
};
```

All downstream services (FastAPI, the ML inference) receive this `correlationId` in their headers and include it in their own logs. This makes debugging during the demo dramatically easier — instead of "something went wrong," you can say "here's the exact trace from loan application to on-chain transaction."

---

## 3. Database (PostgreSQL) Layer

### 3.1 🟡 Add Proper Database Migration System

The thesis mentions "migration scripts and seed data" but with no specification of the migration system. Without a proper migration system, the database gets out of sync between team members and between development and demo environments. Use **node-pg-migrate** (lightweight, no ORM required):

```javascript
// migrations/001_initial_schema.js
exports.up = pgm => {
    pgm.createTable('users', {
        user_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
        wallet_address: { type: 'varchar(42)', notNull: true, unique: true },
        role: { type: 'varchar(50)', notNull: true },
        kyc_status: { type: 'varchar(20)', default: 'UNVERIFIED' },
        created_at: { type: 'timestamptz', default: pgm.func('NOW()') }
    });
    pgm.addIndex('users', 'wallet_address');
};

// migrations/002_add_role_expiry.js — add new column without breaking existing data
exports.up = pgm => {
    pgm.addColumn('users', {
        role_expires_at: { type: 'timestamptz', allowNull: true }
    });
};
```

**Why this matters:** Without migrations, demoing the project on a fresh PC (as is typical for a university presentation) requires manually running SQL scripts in the right order. With migrations, it's one command: `npm run migrate up`.

### 3.2 🟡 PostgreSQL Indexes for Every Query Pattern

The thesis database schema has 15 tables in 3NF, which is architecturally correct. But without indexes on the columns that the application actually queries, the borrowing limit rolling-window queries will be slow (a full table scan on the loans table every time a user applies for a loan).

These indexes must be added:

```sql
-- Loans table: every dashboard query filters by borrower and status
CREATE INDEX CONCURRENTLY idx_loans_borrower ON loans(borrower_wallet, status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_loans_local_bank ON loans(local_bank_id, status);
CREATE INDEX CONCURRENTLY idx_loans_created_at ON loans(created_at DESC);  -- for rolling window queries

-- Repayments: queried by loan_id for installment schedules
CREATE INDEX CONCURRENTLY idx_repayments_loan ON repayments(loan_id, due_date);

-- AI/ML security logs: queried by wallet for risk history
CREATE INDEX CONCURRENTLY idx_aiml_wallet ON ai_ml_security_log(wallet_address, created_at DESC);

-- Bank users: looked up by wallet address on every authenticated request
CREATE INDEX CONCURRENTLY idx_bank_users_wallet ON bank_users(wallet_address);
```

The `CONCURRENTLY` keyword is important — it creates indexes without locking the table, which matters even in development when you're running tests while the DB is active.

### 3.3 🟡 The Rolling Borrowing Limit Query — Implement Correctly

The thesis mentions a "6-month and 1-year rolling window" for borrowing limits but doesn't show the SQL. This is non-trivial and must be correct for the demo:

```sql
-- 6-month rolling window borrowing limit check
-- Returns how much a borrower has borrowed in the last 180 days
WITH rolling_loans AS (
    SELECT 
        SUM(amount_eth) as total_borrowed,
        COUNT(*) as loan_count
    FROM loans
    WHERE 
        borrower_wallet = $1
        AND status IN ('ACTIVE', 'COMPLETED', 'PENDING_APPROVAL')
        AND created_at >= NOW() - INTERVAL '180 days'
)
SELECT 
    COALESCE(total_borrowed, 0) as borrowed_180d,
    COALESCE(loan_count, 0) as loan_count_180d,
    ($2 - COALESCE(total_borrowed, 0)) as remaining_limit  -- $2 = tier limit
FROM rolling_loans;
```

Cache this in Redis with a 30-second TTL keyed to `limit:{wallet}`. Invalidate the cache when a new loan is issued to that wallet. This prevents the loan approval logic from hammering the database on every approval check.

### 3.4 🟢 Add `ON DELETE` Cascade Rules and NOT NULL Constraints

The current schema description doesn't mention cascade delete rules or explicit NOT NULL constraints. For a financial system, these are critical:

```sql
-- Orphaned repayments (loan deleted, repayment record remains) are a data integrity disaster
ALTER TABLE repayments 
    ADD CONSTRAINT fk_repayments_loan 
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id) 
    ON DELETE RESTRICT;  -- prevent loan deletion if repayments exist, not CASCADE

-- AI/ML logs should be preserved even if user is deleted (audit trail)
ALTER TABLE ai_ml_security_log
    ADD CONSTRAINT fk_aiml_loan
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id)
    ON DELETE SET NULL;  -- preserve log entry, just null the loan reference
```

**Use `ON DELETE RESTRICT` not `CASCADE` for financial records** — you never want to silently delete loan or repayment data. If something tries to delete a loan with active repayments, the database should throw an error, not quietly cascade.

---

## 4. Frontend (React + TypeScript) Layer

### 4.1 🟡 Replace Polling with The Graph Subgraph

Currently the frontend likely fetches loan data by calling the smart contract's getter functions directly (via Wagmi's `useContractRead`). This approach has two problems: it hammers the RPC endpoint (rate limits hit quickly), and it can't efficiently query historical data ("show me all loans in the last 30 days").

Deploy a **subgraph** on The Graph's hosted service (supports Polygon Amoy, free for student projects) to index every event your contracts emit:

```typescript
// subgraph/schema.graphql — define queryable entities
type Loan @entity {
    id: ID!                    # loanId from contract
    borrower: Bytes!           # wallet address
    localBank: Bytes!
    amount: BigDecimal!
    status: String!            # PENDING, ACTIVE, REPAID, DEFAULTED
    riskScore: BigDecimal      # from oracle reveal
    requestedAt: BigInt!
    approvedAt: BigInt
    installments: [Installment!]! @derivedFrom(field: "loan")
}

type Installment @entity {
    id: ID!
    loan: Loan!
    installmentNumber: Int!
    amount: BigDecimal!
    dueDate: BigInt!
    paidAt: BigInt
}

type BankReserve @entity {
    id: ID!                    # bank address
    totalDeposited: BigDecimal!
    totalLent: BigDecimal!
    reserveRatio: BigDecimal!
    lastUpdated: BigInt!
}
```

```typescript
// subgraph/src/mapping.ts — transform contract events into entities
export function handleLoanRequested(event: LoanRequested): void {
    let loan = new Loan(event.params.loanId.toHexString());
    loan.borrower = event.params.borrower;
    loan.amount = event.params.amount.toBigDecimal().div(BigDecimal.fromString('1e18'));
    loan.status = 'PENDING';
    loan.requestedAt = event.block.timestamp;
    loan.save();
}
```

**Frontend queries become simple and fast:**

```typescript
// hooks/useUserLoans.ts
const USER_LOANS_QUERY = gql`
    query UserLoans($borrower: Bytes!, $skip: Int!) {
        loans(
            where: { borrower: $borrower }
            orderBy: requestedAt
            orderDirection: desc
            first: 10
            skip: $skip
        ) {
            id, amount, status, riskScore, requestedAt
            installments { installmentNumber, dueDate, paidAt }
        }
    }
`;

export function useUserLoans(wallet: string) {
    return useQuery(USER_LOANS_QUERY, {
        variables: { borrower: wallet.toLowerCase(), skip: 0 },
        pollInterval: 30000  // refresh every 30s as fallback to WebSocket
    });
}
```

This approach is used by Uniswap, Aave, Compound, and virtually every serious DeFi protocol. It's the correct solution for the "dashboard shows live data" requirement.

### 4.2 🟡 Error Boundary and Transaction State Machine

The thesis doesn't mention error handling for failed blockchain transactions, which is one of the most common UX failures in DeFi prototypes during demos. Add a proper transaction state machine:

```typescript
// hooks/useTransaction.ts
type TxState = 
    | { status: 'idle' }
    | { status: 'pending_signature' }
    | { status: 'submitted'; hash: string }
    | { status: 'confirming'; hash: string; confirmations: number }
    | { status: 'success'; hash: string }
    | { status: 'error'; message: string; code?: number };

export function useTransaction() {
    const [txState, setTxState] = useState<TxState>({ status: 'idle' });
    
    const sendTransaction = async (txFn: () => Promise<ContractTransactionResponse>) => {
        try {
            setTxState({ status: 'pending_signature' });
            const tx = await txFn();
            
            setTxState({ status: 'submitted', hash: tx.hash });
            
            const receipt = await tx.wait(1);  // wait for 1 confirmation
            setTxState({ status: 'success', hash: receipt!.hash });
            
        } catch (error: any) {
            // Handle user rejection vs. revert vs. network error
            if (error.code === 4001) {
                setTxState({ status: 'error', message: 'Transaction rejected by user' });
            } else if (error.code === 'CALL_EXCEPTION') {
                const reason = error.reason || 'Contract execution failed';
                setTxState({ status: 'error', message: reason });
            } else {
                setTxState({ status: 'error', message: 'Network error. Please try again.' });
            }
        }
    };
    
    return { txState, sendTransaction };
}
```

**This solves the most common demo-day problem:** MetaMask opens, user confirms, transaction fails silently, dashboard shows nothing. With this state machine, every step is visible to the examiner.

### 4.3 🟢 Add a Risk Dashboard That Actually Shows SHAP Values

The thesis has "Risk dashboard with real-time AI/ML scores" as a Sprint 3 user story. Make this concrete — it should display SHAP values as a horizontal bar chart (positive = increases risk, negative = decreases risk):

```typescript
// components/RiskExplanation.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface ShapFactor {
    feature: string;
    value: number;  // positive = increases risk, negative = decreases risk
    contribution: string;  // human-readable explanation
}

export function RiskExplanation({ loanId, riskScore, shapFactors }: Props) {
    return (
        <Card>
            <Typography variant="h6">Why this risk score?</Typography>
            <Typography>
                Risk Score: <strong>{(riskScore * 100).toFixed(1)}%</strong>
                {' — '}{riskScore < 0.4 ? '✅ Low Risk' : riskScore < 0.7 ? '⚠️ Medium Risk' : '❌ High Risk'}
            </Typography>
            
            <BarChart data={shapFactors} layout="vertical" width={400} height={200}>
                <XAxis type="number" domain={[-0.3, 0.3]} tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" width={150} />
                <Tooltip formatter={(v: number) => `${(v*100).toFixed(1)}% risk contribution`} />
                <Bar dataKey="value">
                    {shapFactors.map((entry, i) => (
                        <Cell key={i} fill={entry.value > 0 ? '#ef4444' : '#22c55e'} />
                    ))}
                </Bar>
            </BarChart>
            
            <Divider />
            {shapFactors.slice(0, 3).map(f => (
                <Typography key={f.feature} variant="body2">
                    • {f.contribution}
                </Typography>
            ))}
        </Card>
    );
}
```

This widget — a horizontal SHAP waterfall chart with plain-language explanations — is exactly what the EU AI Act requires for AI-assisted financial decisions, and it's visually impressive for an examiner audience.

---

## 5. Testing — The Missing Layer

### 5.1 🟡 Upgrade to a Hardhat + Foundry Dual Pipeline

The thesis describes 12+ Hardhat unit tests. This is a start but far below the coverage expected for a financial system. The 2025–2026 industry standard uses Hardhat for integration tests (JavaScript ecosystem, mainnet forking) and Foundry for unit tests and fuzzing (faster, Solidity-native):

```
Hardhat: integration tests, deployment scripts, CI pipeline
Foundry: unit tests, fuzz tests, invariant tests (write in Solidity — faster, better for math)
```

**Add these specific test categories:**

**Invariant tests (Foundry)** — properties that must always hold:
```solidity
// test/invariants/LendingInvariants.t.sol
contract LendingInvariant is Test {
    // Invariant: total loans outstanding can never exceed total reserve deposits
    function invariant_solvency() public view {
        assertLe(
            localBank.totalOutstandingLoans(),
            localBank.getTotalReserve(),
            "Bank is insolvent"
        );
    }
    
    // Invariant: a BORROWER_ROLE holder can never also hold BANK_APPROVER_ROLE
    function invariant_roleSegregation() public view {
        for (uint i = 0; i < actors.length; i++) {
            bool isBorrower = localBank.hasRole(BORROWER_ROLE, actors[i]);
            bool isApprover = localBank.hasRole(BANK_APPROVER_ROLE, actors[i]);
            assertFalse(isBorrower && isApprover, "Role conflict detected");
        }
    }
}
```

**Fuzz tests (Foundry)** — random input testing:
```solidity
function testFuzz_DisburseLoan_CannotExceedBorrowingLimit(
    uint256 amount,
    uint256 existingDebt
) public {
    amount = bound(amount, 0.01 ether, 100 ether);
    existingDebt = bound(existingDebt, 0, 10 ether);
    
    // Setup: borrower has some existing debt
    vm.assume(existingDebt < BORROWING_LIMIT);
    setBorrowerDebt(testBorrower, existingDebt);
    
    if (amount + existingDebt > BORROWING_LIMIT) {
        vm.expectRevert("Exceeds borrowing limit");
    }
    localBank.disburseLoan(testBorrower, amount);
}
```

**Mainnet fork tests (Hardhat)** — test against real Polygon state:
```javascript
// test/fork/PolygonFork.test.js
describe("Polygon Amoy Fork Tests", () => {
    before(async () => {
        await network.provider.request({
            method: "hardhat_reset",
            params: [{ forking: { jsonRpcUrl: POLYGON_AMOY_RPC, blockNumber: 12345678 } }]
        });
    });
    
    it("should correctly read existing testnet state", async () => {
        // Test against actual deployed contracts on Amoy testnet
        const reserve = await worldBankReserve.getReserveBalance();
        expect(reserve).to.be.gt(0);
    });
});
```

### 5.2 🟢 CI/CD Pipeline with GitHub Actions

Every code push should automatically: compile contracts, run all tests, run Slither, check coverage. This is a 30-minute setup that makes the project professional:

```yaml
# .github/workflows/ci.yml
name: Smart Contract CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1
      
      - name: Install Node.js dependencies
        run: npm ci
      
      - name: Compile contracts
        run: npx hardhat compile
      
      - name: Run Foundry unit tests
        run: forge test -vvv
      
      - name: Run Hardhat integration tests
        run: npx hardhat test
      
      - name: Run Slither static analysis
        uses: crytic/slither-action@v0.4.0
        with:
          fail-on: high  # fail CI on HIGH severity findings only
      
      - name: Check coverage (must be > 80%)
        run: |
          forge coverage --report lcov
          npx lcov --summary lcov.info | grep -E 'Lines.*: ([0-9]+)' | awk '{if($2 < 80) exit 1}'
```

This means every time you push to GitHub, you get automatic feedback on whether you broke anything. This also generates a paper trail of test results that can be referenced in the thesis.

---

## 6. Chainlink Integration — Replacing the Centralized Oracle Relay

The thesis plans to replace the custom commit-reveal relay with Chainlink Functions. Here's the concrete implementation path:

### 6.1 🔴 Chainlink Functions for ML Score Delivery

Chainlink Functions allows a smart contract to call any external API (including your own FastAPI endpoint) and receive the result on-chain, with cryptographic guarantees from the Chainlink node network:

```solidity
// LoanController.sol with Chainlink Functions
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";

contract LoanController is FunctionsClient {
    // Chainlink Functions request: call FastAPI and get risk score
    function requestRiskScore(uint256 loanId, address borrower) external {
        string memory source = 
            "const response = await Functions.makeHttpRequest({"
            "url: 'https://cwb-api.render.com/api/v1/risk-score',"
            "method: 'POST',"
            "data: { loanId: args[0], borrower: args[1] }"
            "});"
            "return Functions.encodeUint256(Math.round(response.data.risk_score * 1e18));";
        
        bytes memory encodedArgs = abi.encode(loanId.toString(), borrower);
        bytes32 requestId = _sendRequest(source, subscriptionId, gasLimit, donId);
        pendingRequests[requestId] = loanId;
    }
    
    // Chainlink calls this with the result
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) 
        internal override 
    {
        uint256 loanId = pendingRequests[requestId];
        uint256 riskScore = abi.decode(response, (uint256));
        riskScores[loanId] = riskScore;
        emit RiskScoreReceived(loanId, riskScore);
    }
}
```

**Note:** Chainlink Functions costs approximately $0.20–$0.50 per call on Polygon. For a testnet demo, use the Chainlink Functions subscription with test LINK tokens (free from faucet). For the thesis, this replaces the trust assumption of the centralized FastAPI relay with Chainlink's decentralized oracle network — a significant upgrade to the system's trustlessness claim.

### 6.2 🟡 Chainlink Price Feeds for ETH/USD Display

Simpler than Functions and already tested at massive scale, Chainlink Price Feeds give you manipulation-resistant, decentralized ETH/USD (and other pairs) directly in the smart contract:

```solidity
// PriceFeed.sol — used by the FX module and loan sizing interface
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract CWBPriceFeed {
    AggregatorV3Interface internal ethUsdFeed;
    
    constructor() {
        // Polygon Amoy testnet ETH/USD feed address
        ethUsdFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }
    
    function getETHUSDPrice() public view returns (uint256 price, uint256 updatedAt) {
        (, int256 answer, , uint256 updateTime, ) = ethUsdFeed.latestRoundData();
        require(block.timestamp - updateTime < 3600, "Stale price feed"); // heartbeat check
        require(answer > 0, "Invalid price");
        return (uint256(answer), updateTime);
    }
    
    // Convert loan amount from ETH to USD equivalent for display
    function ethToUSD(uint256 ethAmount) external view returns (uint256) {
        (uint256 price, ) = getETHUSDPrice();
        return (ethAmount * price) / 1e8;  // Chainlink prices have 8 decimals
    }
}
```

This single contract enables the frontend to show loan amounts in both ETH and USD, which is crucial for the financial inclusion use case (a borrower in Bangladesh thinks in BDT, not ETH).

---

## 7. The 9B LLM — Making It Actually Work on the Gaming PC

The thesis plans a Qwen3.5-9B-Instruct model with QLoRA fine-tuning on an AMD Radeon RX 9060 XT 16GB. This is actually very achievable — here's the concrete path:

### 7.1 🔴 llama.cpp Backend Instead of PyTorch for Demo

For the demo specifically, running a full PyTorch inference stack on a gaming PC adds latency and complexity. Use **llama.cpp** (CPU+GPU inference, highly optimized) with the GGUF-quantized model instead. The 4-bit quantized (Q4_K_M) version of Qwen3.5-9B runs at ~5 tokens/second on an RX 9060 XT with ROCm support:

```bash
# Install llama.cpp with ROCm/HIP for AMD GPU
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make LLAMA_HIP=1  # AMD GPU support

# Download the model (GGUF format)
# Qwen3.5-9B-Instruct-Q4_K_M.gguf (~5.5GB)

# Start the inference server
./llama-server \
    --model models/Qwen3.5-9B-Instruct-Q4_K_M.gguf \
    --ctx-size 4096 \
    --n-gpu-layers 40 \  # offload 40 layers to GPU
    --port 8080 \
    --api-key cwb-secret  # Basic auth for the demo
```

The FastAPI service then calls this local server, keeping all inference on the gaming PC with no cloud dependency:

```python
# fastapi/services/llm_client.py
async def chat_completion(messages: list, max_tokens: int = 500):
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://localhost:8080/v1/chat/completions",
            headers={"Authorization": f"Bearer {LLM_API_KEY}"},
            json={
                "model": "qwen3.5-9b",
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.7,
                "stream": True  # streaming for responsive UX
            }
        ) as response:
            async for chunk in response.content:
                yield chunk
```

### 7.2 🟡 RAG Implementation with ChromaDB

The thesis mentions RAG over architecture and policy documents. Use **ChromaDB** (a local vector database, zero cost, no API needed) for the retrieval component:

```python
# fastapi/services/rag.py
import chromadb
from sentence_transformers import SentenceTransformer

class CWBKnowledgeBase:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="./data/chroma")
        self.collection = self.client.get_or_create_collection("cwb_docs")
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')  # small, fast, free
    
    def index_documents(self, documents: list[dict]):
        """Index thesis chapters, policy docs, loan terms"""
        embeddings = self.encoder.encode([d['text'] for d in documents]).tolist()
        self.collection.add(
            ids=[d['id'] for d in documents],
            embeddings=embeddings,
            documents=[d['text'] for d in documents],
            metadatas=[{'source': d['source']} for d in documents]
        )
    
    def retrieve(self, query: str, n_results: int = 3) -> list[str]:
        """Get relevant context for a user query"""
        query_embedding = self.encoder.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=n_results
        )
        return results['documents'][0]

# Documents to index: thesis chapters, loan policy docs, interest rate tables
```

**What to index:** the thesis PDF (extract text, chunk by section), the banking product specifications, the interest rate model parameters, and the FAQ content. This costs zero — ChromaDB stores everything locally.

---

## 8. The Three Things That Will Most Impress Examiners

If time is short before the demo, focus effort in this order:

**First — Complete the cross-tier capital flow (Section 1.1).** Nothing else demonstrates the four-tier banking model if capital can't actually flow between tiers.

**Second — Wire up the ML oracle relay (Section 2.1).** The AI/ML models already exist. Connecting them to the loan approval workflow makes the entire project's AI claim credible. This is a day of work with the code above.

**Third — Add WebSocket real-time events to the dashboard (Section 2.2).** A dashboard where loan statuses update live, without page refresh, is the single most visually impressive feature for an examiner watching the demo. It immediately communicates "this is a real system, not a static mockup."

---

## Summary Prioritization Matrix

| Improvement | Layer | Impact | Effort | Priority |
|---|---|---|---|---|
| Cross-tier fund transfer | Smart Contract | 🔴 Critical | 🟡 Medium | **P0** |
| ML oracle integration | Backend | 🔴 Critical | 🟡 Medium | **P0** |
| WebSocket real-time dashboard | Frontend/Backend | 🔴 Critical | 🟡 Medium | **P0** |
| UUPS proxy pattern | Smart Contract | 🟡 High | 🟢 Low | **P1** |
| The Graph subgraph | Frontend | 🟡 High | 🟡 Medium | **P1** |
| TimeLock controller | Smart Contract | 🟡 High | 🟢 Low | **P1** |
| SHAP risk dashboard UI | Frontend | 🟡 High | 🟢 Low | **P1** |
| Foundry fuzz + invariant tests | Testing | 🟡 High | 🟡 Medium | **P1** |
| Redis caching strategy | Backend | 🟡 Medium | 🟢 Low | **P2** |
| Role expiry timestamps | Smart Contract | 🟡 Medium | 🟢 Low | **P2** |
| Granular pause controls | Smart Contract | 🟡 Medium | 🟢 Low | **P2** |
| GitHub Actions CI/CD | Testing | 🟡 Medium | 🟢 Low | **P2** |
| DB migration system | Database | 🟡 Medium | 🟢 Low | **P2** |
| PostgreSQL indexes | Database | 🟡 Medium | 🟢 Low | **P2** |
| Transaction state machine | Frontend | 🟡 Medium | 🟢 Low | **P2** |
| Structured logging | Backend | 🟢 Low | 🟢 Low | **P3** |
| Chainlink Functions (full) | Smart Contract | 🟢 Low | 🔴 High | **P3** |
| llama.cpp inference server | AI | 🟢 Low | 🟡 Medium | **P3** |
| ChromaDB RAG | AI | 🟢 Low | 🟡 Medium | **P3** |

*P0 = must have before demo | P1 = strong improvement | P2 = polish | P3 = final thesis phase*

---

*Research synthesized from: Foundry documentation (2026); Hardhat testing best practices (nadcab.com, 2026); OpenZeppelin UUPS and TimelockController documentation; The Graph Protocol Q3 2025 (Messari); Chainlink Functions documentation and DeFi integration guide; Redis caching strategy research (2026); ethers.js WebSocket event listener patterns; llama.cpp ROCm/HIP documentation; ChromaDB documentation; Smart contract audit tools review (Hacken, Cyfrin, 2026).*

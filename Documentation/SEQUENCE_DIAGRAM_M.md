# Sequence Diagrams

## Crypto World Bank System

---

### Sequence Diagram 1: Loan Request, AI Risk Check, and Approval Decision

> **UML Fragments used:** This flow contains an **alt [Approve / Reject]** fragment at the approver decision point (step 36). The Approve path is shown in steps 36–50 and the Reject alternative in steps 36b–46b. A **loop** for installment payments follows in **Diagram 2**.

```mermaid
sequenceDiagram
    participant B as Borrower
    participant F as Frontend
    participant MM as MetaMask
    participant LB as LocalBank.sol
    participant PP as Polygon PoS
    participant BA as Backend API
    participant AI as AI/ML Service
    participant AU as Approver UI
    participant AW as Approver Wallet

    B->>F: 1. Open DApp
    B->>F: 2. Click Connect Wallet
    F->>MM: 3. Request accounts
    MM-->>F: 4. Return wallet address

    B->>F: 5. Enter loan amount: 50 ETH, purpose: Business
    F->>BA: 6. Check borrowing limit via API
    BA-->>F: 7. Return: limit OK, 6m_remaining: 200

    F->>MM: 8. Prepare unsigned requestLoan(50 ETH, Business)
    MM-->>B: 9. MetaMask popup — Confirm tx? Gas: 0.003 MATIC
    B-->>MM: 10. User clicks Confirm

    Note over MM: 11. Sign tx with private key
    MM->>LB: 12. Broadcast signed tx

    Note over LB: 13. require(amount > 0)<br/>14. require(purpose != "")<br/>15. require(amount <= totalReserve)
    Note over LB: 16. loanCounter++<br/>17. Store Loan(id, borrower, amount,<br/>purpose, Pending, now, 0)<br/>18. userLoans[sender].push(loanId)

    LB->>PP: 19. emit LoanRequested(loanId, borrower, amount, purpose)
    Note over PP: 20. Block validated (~2 sec)
    PP-->>F: 21. Tx confirmed — hash: 0xabc...
    F-->>B: 22. Loan Requested Successfully!

    PP->>BA: 23. Event listener detects event
    Note over BA: 24. INSERT INTO LOAN_REQUEST (off-chain DB)
    BA->>AI: 25. Trigger AI/ML risk assessment

    Note over AI: 26. Extract features:<br/>- loan amount<br/>- borrower history<br/>- wallet age<br/>- tx frequency
    Note over AI: 27. Random Forest predict(features)<br/>fraud_score: 0.12
    Note over AI: 28. SHAP explain(prediction)<br/>top features returned
    Note over AI: 29. Isolation Forest<br/>anomaly_score: -0.3

    AI-->>BA: 30. Return: fraud_score: 0.12, anomaly: normal, shap_features
    Note over BA: 31. INSERT INTO AI_ML_SECURITY_LOG

    Note over AU: 32. Approver opens pending loans page
    AU->>BA: 33. GET /loans/pending + risk scores
    BA-->>AU: 34. Return loan list with risk data
    Note over AU: 35. Display: Loan #5: 50 ETH<br/>Risk: LOW (0.12)<br/>SHAP: amount down, history up

    alt Approve
        AU->>AW: 36. Click Approve
        Note over AW: 37. Sign approveLoan(5)
        AW->>LB: approveLoan(5)

        Note over LB: 38. require(onlyApprover)<br/>39. require(status == Pending)<br/>40. require(balance >= amount)
        Note over LB: 41. loan.status = Approved<br/>42. loan.approvedAt = block.timestamp<br/>43. totalReserve -= loan.amount<br/>44. Transfer 50 ETH to borrower via call

        LB-->>B: 45. 50 ETH received in wallet
        LB->>PP: 46. emit LoanApproved(5, borrower, 50)
        PP->>BA: 47. Event listener detects event
        Note over BA: 48. UPDATE LOAN_REQUEST status = approved<br/>49. INSERT INTO TRANSACTION<br/>50. UPDATE BORROWING_LIMIT

    else Reject
        AU->>AW: 36b. Click Reject — reason: High fraud risk
        Note over AW: 37b. Sign rejectLoan(5, High fraud risk)
        AW->>LB: rejectLoan(5, High fraud risk)

        Note over LB: 38b. require(onlyApprover)<br/>39b. require(status == Pending)<br/>40b. loan.status = Rejected<br/>41b. loan.rejectedAt = block.timestamp

        LB->>PP: 42b. emit LoanRejected(5, borrower, 50, High fraud risk)
        PP->>BA: 43b. Event listener detects event
        Note over BA: 44b. UPDATE LOAN_REQUEST<br/>status = rejected<br/>rejected_reason = High fraud risk
        BA->>F: 45b. Push notification
        F-->>B: 46b. Display: Loan #5 Rejected — Reason: High fraud risk
    end
```

> **UML Fragments:** Steps 36–50 above show the **[Approve]** path of an **alt [Approve / Reject]** fragment. The **[Reject]** alternative is also shown above and expanded in Diagram 1B below. A **loop** fragment for installment repayments follows in Diagram 2.

---

### Sequence Diagram 1B: Reject Path — alt [Reject]

> Continues from step 35 of Diagram 1 (approver reviews loan with AI risk data). This shows the alternative path where the approver **rejects** the loan request.

```mermaid
sequenceDiagram
    participant AU as Approver UI
    participant AW as Approver Wallet
    participant LB as LocalBank.sol
    participant PP as Polygon PoS
    participant BA as Backend API
    participant FB as Frontend / Borrower

    Note over AU, FB: alt [Reject] — continues from Diagram 1, step 35

    AU->>AW: 36b. Click Reject — enter reason: High fraud risk

    Note over AW: 37b. Sign rejectLoan(5, High fraud risk)
    AW->>LB: rejectLoan(5, High fraud risk)

    Note over LB: 38b. require(onlyApprover)<br/>39b. require(status == Pending)
    Note over LB: 40b. loan.status = Rejected<br/>41b. loan.rejectedAt = block.timestamp

    LB->>PP: 42b. emit LoanRejected(5, borrower, 50, High fraud risk)
    PP->>BA: 43b. Event listener detects event

    Note over BA: 44b. UPDATE LOAN_REQUEST<br/>status = rejected<br/>rejected_reason = High fraud risk

    BA->>FB: 45b. Push notification
    Note over FB: 46b. Display:<br/>Loan #5 Rejected<br/>Reason: High fraud risk
```

---

### Sequence Diagram 2: Installment Payment Loop

> After a loan is approved (Diagram 1, steps 36–50), the borrower repays through installments. This diagram uses a **loop** fragment to show the repeating payment cycle and an **opt** fragment for the loan completion check.

```mermaid
sequenceDiagram
    participant B as Borrower
    participant F as Frontend
    participant MM as MetaMask
    participant LB as LocalBank.sol
    participant PP as Polygon PoS
    participant BA as Backend API

    B->>F: 1. Open My Loans
    F->>BA: 2. GET /loans/active + installments
    BA-->>F: 3. Return loan list with schedule
    F-->>B: 4. Display loan with installment progress (X of Y paid)

    loop For each installment until loan is fully repaid
        B->>F: 5. Select next due installment
        B->>F: 6. Click Pay Installment

        F->>MM: 7. Prepare unsigned payInstallment(loanId, installmentNo)
        MM-->>B: 8. MetaMask popup — Pay 10 ETH? Gas: 0.002 MATIC
        B-->>MM: 9. User clicks Confirm
        MM->>LB: 10. Sign and broadcast

        Note over LB: 11. require(installment exists<br/>and status = pending)<br/>12. require(msg.value ==<br/>installmentAmount)
        Note over LB: 13. Mark installment as paid<br/>14. totalRepaid += amount

        LB->>PP: 15. emit InstallmentPaid(loanId, number, amount)
        PP->>BA: 16. Event listener detects event
        Note over BA: 17. UPDATE INSTALLMENT status = paid<br/>18. INSERT INTO TRANSACTION

        PP-->>F: 19. Tx confirmed
        F-->>B: 20. Installment Paid! Progress: X of Y

        opt All installments paid
            Note over LB: 21. loan.status = Repaid
            LB->>PP: 22. emit LoanFullyRepaid(loanId, borrower)
            PP->>BA: 23. Event detected
            Note over BA: 23. UPDATE LOAN_REQUEST status = repaid<br/>24. UPDATE BORROWING_LIMIT (increase)
            F-->>B: 25. Loan Fully Repaid!
        end
    end
```

---

### Sequence Diagram 3: Income Verification

> **Participants:** Borrower, Frontend, FastAPI, PostgreSQL, FileStorage, BankApprover. This diagram covers the full income-proof upload lifecycle — from the borrower uploading a document, through server-side validation and storage, to a bank approver reviewing and deciding on the proof.

```mermaid
sequenceDiagram
    participant B as Borrower
    participant F as Frontend
    participant API as FastAPI
    participant DB as PostgreSQL
    participant FS as FileStorage
    participant BA as BankApprover

    B->>F: 1. Open Income Verification page
    F->>API: 2. GET /income-proof/status (borrower_id)
    API->>DB: 3. Query INCOME_PROOF table
    DB-->>API: 4. Return status (or empty)
    API-->>F: 5. Return verification status
    F-->>B: 6. Show upload form (if no verified proof exists)

    B->>F: 7. Select file + Upload
    Note over F: 8. Client-side validation<br/>(type, size <= 5MB)
    F->>API: 9. POST /income-proof/upload (file, borrower_id)

    Note over API: 10. Server-side validation<br/>+ SHA-256 hash
    API->>FS: 11. Store encrypted file
    FS-->>API: 12. Return file_path
    API->>DB: 13. INSERT INTO INCOME_PROOF (status = pending)
    DB-->>API: 14. Confirm insert
    API-->>F: 15. Return success
    F-->>B: 16. Show Pending Review status

    Note over B, BA: Bank Review Phase

    BA->>F: 17. View pending income proofs
    F->>API: 18. GET /income-proofs/pending
    API->>DB: 19. Query pending INCOME_PROOF records
    DB-->>API: 20. Return pending proofs
    API-->>F: 21. Return proofs list
    F->>BA: 22. Display proofs for review

    BA->>F: 23. Approve/Reject with notes
    F->>API: 24. PATCH /income-proof/id (status, notes)
    API->>DB: 25. UPDATE INCOME_PROOF SET status, reviewed_by, reviewed_at
    DB-->>API: 26. Confirm update
    API-->>F: 27. Return updated status
    F->>BA: 28. Show confirmation
```

---

### Sequence Diagram 4: Chat System

> **Participants:** Borrower, Frontend, WebSocket, FastAPI, PostgreSQL, BankApprover. This diagram covers the real-time chat between a borrower and a bank approver on a specific loan request, including chat history loading, typing indicators, real-time message delivery, and read receipts.

```mermaid
sequenceDiagram
    participant B as Borrower
    participant F as Frontend
    participant WS as WebSocket
    participant API as FastAPI
    participant DB as PostgreSQL
    participant BA as BankApprover

    B->>F: 1. Open loan details → Click Chat
    F->>API: 2. GET /chat/history (loan_request_id)
    API->>DB: 3. Query CHAT_MESSAGE WHERE loan_request_id ORDER BY sent_at
    DB-->>API: 4. Return messages
    API-->>F: 5. Return formatted chat history
    F-->>B: 6. Display chat window with history

    B->>F: 7. Type message
    F->>WS: 8. Emit typing event
    WS->>BA: 9. Forward typing indicator

    B->>F: 10. Send message
    F->>API: 11. POST /chat/send (loan_request_id, sender_id, message)
    API->>DB: 12. INSERT INTO CHAT_MESSAGE
    DB-->>API: 13. Confirm insert
    API->>WS: 14. Emit new_message event
    WS->>BA: 15. Deliver real-time notification
    API-->>F: 16. Return success

    BA->>F: 17. View notification → Open chat
    BA->>F: 18. Read message
    F->>API: 19. PATCH /chat/read (message_id)
    API->>DB: 20. UPDATE CHAT_MESSAGE SET is_read = true
```

---

### Sequence Diagram 5: AI Chatbot Interaction

> **Participants:** Borrower, Frontend, ChatbotService, NLPEngine, PostgreSQL. This diagram shows the AI chatbot session lifecycle — initialisation with user context, natural-language question processing via the NLP engine (intent classification and entity extraction), conditional data retrieval based on intent, and response formatting.

```mermaid
sequenceDiagram
    participant B as Borrower
    participant F as Frontend
    participant CS as ChatbotService
    participant NLP as NLPEngine
    participant DB as PostgreSQL

    B->>F: 1. Open AI Chatbot
    F->>CS: 2. Initialize session (borrower_id)
    CS->>DB: 3. Load user context (BORROWER, LOAN_REQUEST, BORROWING_LIMIT)
    DB-->>CS: 4. Return user data
    CS-->>F: 5. Return welcome message + context summary
    F-->>B: 6. Display chatbot interface

    B->>F: 7. Ask question (e.g. What is my borrowing limit?)
    F->>CS: 8. POST /chatbot/ask (session_id, message)
    CS->>NLP: 9. Tokenize + Remove stop words

    Note over NLP: 10. Classify intent<br/>(loan_limit / payment_due /<br/>bank_info / general)
    Note over NLP: 11. Extract entities

    NLP-->>CS: 12. Return intent + entities

    alt intent = loan_limit
        CS->>DB: 13a. Query BORROWING_LIMIT
        DB-->>CS: 13a. Return limit data
    else intent = payment_due
        CS->>DB: 13b. Query INSTALLMENT WHERE status = pending
        DB-->>CS: 13b. Return pending installments
    else intent = bank_info
        CS->>DB: 13c. Query LOCAL_BANK / NATIONAL_BANK
        DB-->>CS: 13c. Return bank data
    end

    Note over CS: 14. Format response with data
    CS->>DB: 15. INSERT INTO AI_CHATBOT_LOG
    CS-->>F: 16. Return formatted response
    F-->>B: 17. Display response
```

---

### Sequence Diagram 6: Hierarchical Banking (World Bank → National Bank → Local Bank → Borrower)

> **Participants:** WorldBankAdmin, Frontend, SmartContract (WorldBankReserve.sol), Blockchain, NationalBank, SmartContract (NationalBank.sol), LocalBank, SmartContract (LocalBank.sol), Borrower. This diagram illustrates the three-tier fund flow — deposit into the world-bank reserve, cascading loan approvals down through national and local banks, and repayment cascading back up.

```mermaid
sequenceDiagram
    participant WBA as WorldBankAdmin
    participant F as Frontend
    participant WBR as WBReserve.sol
    participant BC as Blockchain
    participant NB as NationalBank
    participant NBS as NationalBank.sol
    participant LBk as LocalBank
    participant LBS as LocalBank.sol
    participant Br as Borrower

    WBA->>F: 1. Deposit funds to reserve
    F->>WBR: 2. deposit() with value: amount
    WBR->>BC: 3. Record transaction
    BC-->>WBR: 4. Confirm

    NB->>F: 5. Request loan from World Bank
    F->>WBR: 6. requestLoan(amount)
    Note over WBR: 7. Check available reserve

    WBA->>F: 8. Approve NB loan
    F->>WBR: 9. approveLoan(nb_address, amount)
    WBR->>BC: 10. Transfer funds to NB contract
    BC->>NBS: 11. Receive funds

    LBk->>F: 12. Request loan from National Bank
    F->>NBS: 13. requestLoan(amount)
    NB->>F: 14. Approve LB loan
    F->>NBS: 15. approveLoan(lb_address, amount)
    Note over NBS: 16. Transfer to LB contract
    BC->>LBS: 17. Transfer on-chain
    LBS->>Br: 18. Receive funds

    Note over WBA, Br: Repayment cascades back up

    Br->>LBS: 19. payInstallment()
    LBS->>LBk: 20. Forward share
    LBk->>NBS: 21. Forward share to NB
    NBS->>WBR: 22. Forward share to WB
```

---

### Sequence Diagram 7: Market Data Retrieval

> **Participants:** Borrower, Frontend, FastAPI, RedisCache, PostgreSQL, CoinGeckoAPI. This diagram shows how live cryptocurrency prices are fetched (with a Redis caching layer and CoinGecko as the external source), how historical chart data is queried, and the auto-refresh polling mechanism.

```mermaid
sequenceDiagram
    participant B as Borrower
    participant F as Frontend
    participant API as FastAPI
    participant RC as RedisCache
    participant DB as PostgreSQL
    participant CG as CoinGeckoAPI

    B->>F: 1. Navigate to Market Data dashboard
    F->>API: 2. GET /market-data/prices (crypto_ids)
    API->>RC: 3. Check cache (key: market_prices_crypto_id)

    alt Cache Hit
        RC-->>API: 4a. Return cached data
    else Cache Miss
        API->>CG: 4b. GET /simple/price?ids=...&vs_currencies=usd
        CG-->>API: 5b. Return price data
        API->>RC: 6b. SET cache (TTL: 5 min)
        API->>DB: 7b. INSERT/UPDATE MARKET_DATA
    end

    API-->>F: 8. Return price data
    F-->>B: 9. Render price cards

    B->>F: 10. Select crypto for historical chart
    F->>API: 11. GET /market-data/history (crypto_id, range)
    API->>DB: 12. Query MARKET_DATA WHERE crypto_id AND date range
    DB-->>API: 13. Return historical data
    API-->>F: 14. Return data points
    Note over F: 15. Render Chart.js line chart<br/>(tooltips, time range)
    F-->>B: 16. Display interactive chart

    loop Auto-refresh every 5 minutes
        F->>API: 17. GET /market-data/prices (polling)
        Note over API: Cache / fetch cycle repeats as above
        API-->>F: 18. Return updated prices
        F-->>B: 19. Re-render price cards
    end
```

---

### Sequence Diagram 8: Borrowing Limit Calculation

> **Participants:** System/Trigger, FastAPI, PostgreSQL, BorrowingLimitEngine. This diagram shows the borrowing-limit recalculation triggered by events such as a new loan request, approval, payment, or a scheduled cron job. The engine gathers 6-month and 12-month transaction history, applies a loyalty multiplier, enforces concurrent-loan and yearly caps, and persists the result.

```mermaid
sequenceDiagram
    participant S as System / Trigger
    participant API as FastAPI
    participant BLE as BorrowingLimitEngine
    participant DB as PostgreSQL

    Note over S: Trigger: Loan Request / Approval / Payment / Scheduled Job

    S->>API: 1. Calculate borrowing limit (borrower_id)
    API->>BLE: 2. Process limit calculation

    BLE->>DB: 3. Query TRANSACTION (last 6 months)
    DB-->>BLE: 4. Return 6-month transactions
    Note over BLE: 5. Calculate 6-month rolling sum

    BLE->>DB: 6. Query TRANSACTION (last 12 months)
    DB-->>BLE: 7. Return 12-month transactions
    Note over BLE: 8. Calculate 12-month rolling sum

    BLE->>DB: 9. Query BORROWER.consecutive_paid_loans
    DB-->>BLE: 10. Return consecutive count
    Note over BLE: 11. Apply loyalty multiplier

    BLE->>DB: 12. Query active LOAN_REQUEST count
    DB-->>BLE: 13. Return active loan count
    Note over BLE: 14. Check max concurrent loans (3)
    Note over BLE: 15. Check yearly limit not exceeded
    Note over BLE: 16. Final limit =<br/>min(6mo, 12mo) x loyalty x availability

    BLE->>DB: 17. UPSERT BORROWING_LIMIT
    DB-->>BLE: 18. Confirm update
    BLE-->>API: 19. Return calculated limit
    API-->>S: 20. Return limit result
```

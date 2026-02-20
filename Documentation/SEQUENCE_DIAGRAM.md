# Sequence Diagrams
## Crypto World Bank System

---

### Sequence Diagram 1: Loan Request, AI Risk Check, and Approval Decision

> **UML Fragments used:** This flow contains an **alt [Approve / Reject]** fragment at the approver decision point (step 36). The Approve path is shown below (steps 36–50). The Reject path is shown in **Diagram 1B**. A **loop** for installment payments follows in **Diagram 2**.

```
  Borrower                   Frontend                  MetaMask                LocalBank.sol              Polygon PoS               Backend API              AI/ML Service              Approver UI               Approver Wallet
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  1. Open DApp            │                         │                        │                         │                         │                         │                         │                         │
     │─────────────────────────>│                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  2. Click Connect        │                         │                        │                         │                         │                         │                         │                         │
     │     Wallet               │                         │                        │                         │                         │                         │                         │                         │
     │─────────────────────────>│  3. Request             │                        │                         │                         │                         │                         │                         │
     │                          │     accounts            │                        │                         │                         │                         │                         │                         │
     │                          │────────────────────────>│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  4. Return              │                        │                         │                         │                         │                         │                         │
     │                          │     wallet address      │                        │                         │                         │                         │                         │                         │
     │                          │<────────────────────────│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  5. Enter loan           │                         │                        │                         │                         │                         │                         │                         │
     │     amount: 50 ETH       │                         │                        │                         │                         │                         │                         │                         │
     │     purpose: "Business"  │                         │                        │                         │                         │                         │                         │                         │
     │─────────────────────────>│                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  6. Check borrowing     │                        │                         │                         │                         │                         │                         │
     │                          │     limit via API       │                        │                         │                         │                         │                         │                         │
     │                          │────────────────────────────────────────────────────────────────────────────>│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  7. Return: limit OK    │                        │                         │                         │                         │                         │                         │
     │                          │     6m_remaining: 200   │                        │                         │                         │                         │                         │                         │
     │                          │<────────────────────────────────────────────────────────────────────────────│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  8. Prepare unsigned    │                        │                         │                         │                         │                         │                         │
     │                          │     requestLoan(        │                        │                         │                         │                         │                         │                         │
     │                          │       50 ETH,           │                        │                         │                         │                         │                         │                         │
     │                          │       "Business")       │                        │                         │                         │                         │                         │                         │
     │                          │────────────────────────>│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  9. MetaMask popup       │                         │                        │                         │                         │                         │                         │                         │
     │     "Confirm tx?"        │                         │                        │                         │                         │                         │                         │                         │
     │     Gas: 0.003 MATIC     │                         │                        │                         │                         │                         │                         │                         │
     │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  10. User clicks         │                         │                        │                         │                         │                         │                         │                         │
     │      "Confirm"           │                         │                        │                         │                         │                         │                         │                         │
     │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─>│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │  11. Sign tx with      │                         │                         │                         │                         │                         │
     │                          │                         │      private key       │                         │                         │                         │                         │                         │
     │                          │                         │  12. Broadcast         │                         │                         │                         │                         │                         │
     │                          │                         │      signed tx         │                         │                         │                         │                         │                         │
     │                          │                         │───────────────────────>│                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │  13. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      amount > 0)        │                         │                         │                         │                         │
     │                          │                         │                        │  14. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      purpose != "")      │                         │                         │                         │                         │
     │                          │                         │                        │  15. require(amount      │                         │                         │                         │                         │
     │                          │                         │                        │      <= totalReserve)    │                         │                         │                         │                         │
     │                          │                         │                        │  16. loanCounter++       │                         │                         │                         │                         │
     │                          │                         │                        │  17. Store Loan{         │                         │                         │                         │                         │
     │                          │                         │                        │      id, borrower,       │                         │                         │                         │                         │
     │                          │                         │                        │      amount, purpose,    │                         │                         │                         │                         │
     │                          │                         │                        │      Pending, now, 0}    │                         │                         │                         │                         │
     │                          │                         │                        │  18. userLoans[sender]   │                         │                         │                         │                         │
     │                          │                         │                        │      .push(loanId)       │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │  19. emit                │                         │                         │                         │                         │
     │                          │                         │                        │      LoanRequested(      │                         │                         │                         │                         │
     │                          │                         │                        │      loanId, borrower,   │                         │                         │                         │                         │
     │                          │                         │                        │      amount, purpose)    │                         │                         │                         │                         │
     │                          │                         │                        │────────────────────────>│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │  20. Block               │                         │                         │                         │
     │                          │                         │                        │                         │      validated           │                         │                         │                         │
     │                          │                         │                        │                         │      (~2 sec)            │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  21. Tx confirmed       │                        │                         │                         │                         │                         │                         │
     │                          │      hash: 0xabc...     │                        │                         │                         │                         │                         │                         │
     │                          │<────────────────────────────────────────────────────────────────────────────│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  22. "Loan Requested     │                         │                        │                         │                         │                         │                         │                         │
     │       Successfully!"     │                         │                        │                         │                         │                         │                         │                         │
     │<─────────────────────────│                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │  23. Event listener      │                         │                         │                         │
     │                          │                         │                        │                         │      detects event       │                         │                         │                         │
     │                          │                         │                        │                         │─────────────────────────>│                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  24. INSERT INTO         │                         │                         │
     │                          │                         │                        │                         │                         │      LOAN_REQUEST        │                         │                         │
     │                          │                         │                        │                         │                         │      (off-chain DB)      │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  25. Trigger AI/ML       │                         │                         │
     │                          │                         │                        │                         │                         │      risk assessment     │                         │                         │
     │                          │                         │                        │                         │                         │────────────────────────>│                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  26. Extract features:   │                         │
     │                          │                         │                        │                         │                         │                         │      - loan amount       │                         │
     │                          │                         │                        │                         │                         │                         │      - borrower history  │                         │
     │                          │                         │                        │                         │                         │                         │      - wallet age        │                         │
     │                          │                         │                        │                         │                         │                         │      - tx frequency      │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  27. Random Forest       │                         │
     │                          │                         │                        │                         │                         │                         │      predict(features)   │                         │
     │                          │                         │                        │                         │                         │                         │      → fraud_score: 0.12 │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  28. SHAP explain(        │                         │
     │                          │                         │                        │                         │                         │                         │      prediction)         │                         │
     │                          │                         │                        │                         │                         │                         │      → top features      │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  29. Isolation Forest    │                         │
     │                          │                         │                        │                         │                         │                         │      anomaly_score: -0.3 │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  30. Return:             │                         │                         │
     │                          │                         │                        │                         │                         │      fraud_score: 0.12   │                         │                         │
     │                          │                         │                        │                         │                         │      anomaly: normal     │                         │                         │
     │                          │                         │                        │                         │                         │      shap_features: [...] │                         │                         │
     │                          │                         │                        │                         │                         │<────────────────────────│                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  31. INSERT INTO         │                         │                         │
     │                          │                         │                        │                         │                         │      AI_ML_SECURITY_LOG  │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  32. Approver            │                         │
     │                          │                         │                        │                         │                         │                         │      opens pending       │                         │
     │                          │                         │                        │                         │                         │                         │      loans page          │                         │
     │                          │                         │                        │                         │                         │                         │─────────────────────────>│                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  33. GET /loans/pending  │                         │                         │
     │                          │                         │                        │                         │                         │      + risk scores       │                         │                         │
     │                          │                         │                        │                         │                         │<─────────────────────────────────────────────────────│                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  34. Return loan list    │                         │                         │
     │                          │                         │                        │                         │                         │      with risk data      │                         │                         │
     │                          │                         │                        │                         │                         │─────────────────────────────────────────────────────>│                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │  35. Display:            │
     │                          │                         │                        │                         │                         │                         │                         │      Loan #5: 50 ETH     │
     │                          │                         │                        │                         │                         │                         │                         │      Risk: LOW (0.12)    │
     │                          │                         │                        │                         │                         │                         │                         │      SHAP: amount ↓      │
     │                          │                         │                        │                         │                         │                         │                         │            history ↑     │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │  36. Click "Approve"     │
     │                          │                         │                        │                         │                         │                         │                         │─────────────────────────>│
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │  37. Sign
     │                          │                         │                        │                         │                         │                         │                         │                         │      approveLoan(5)
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │  38. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      onlyApprover)       │                         │                         │                         │                         │
     │                          │                         │                        │  39. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      status==Pending)    │                         │                         │                         │                         │
     │                          │                         │                        │  40. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      balance>=amount)    │                         │                         │                         │                         │
     │                          │                         │                        │  41. loan.status =       │                         │                         │                         │                         │
     │                          │                         │                        │      Approved            │                         │                         │                         │                         │
     │                          │                         │                        │  42. loan.approvedAt =   │                         │                         │                         │                         │
     │                          │                         │                        │      block.timestamp     │                         │                         │                         │                         │
     │                          │                         │                        │  43. totalReserve -=     │                         │                         │                         │                         │
     │                          │                         │                        │      loan.amount         │                         │                         │                         │                         │
     │                          │                         │                        │  44. Transfer 50 ETH     │                         │                         │                         │                         │
     │                          │                         │                        │      to borrower.call    │                         │                         │                         │                         │
     │                          │                         │                        │      {value: amount}     │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  45. 50 ETH received     │                         │                        │  46. emit                │                         │                         │                         │                         │
     │      in wallet           │                         │                        │      LoanApproved(       │                         │                         │                         │                         │
     │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│      5, borrower, 50)    │                         │                         │                         │                         │
     │                          │                         │                        │────────────────────────>│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │  47. Event listener      │                         │                         │                         │
     │                          │                         │                        │                         │─────────────────────────>│  48. UPDATE              │                         │                         │
     │                          │                         │                        │                         │                         │      LOAN_REQUEST        │                         │                         │
     │                          │                         │                        │                         │                         │      status='approved'   │                         │                         │
     │                          │                         │                        │                         │                         │  49. INSERT INTO         │                         │                         │
     │                          │                         │                        │                         │                         │      TRANSACTION         │                         │                         │
     │                          │                         │                        │                         │                         │  50. UPDATE              │                         │                         │
     │                          │                         │                        │                         │                         │      BORROWING_LIMIT     │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
```

> **UML Fragments:** Steps 36–50 above show the **[Approve]** path of an **alt [Approve / Reject]** fragment. The **[Reject]** alternative is shown in Diagram 1B below. A **loop** fragment for installment repayments follows in Diagram 2.

---

### Sequence Diagram 1B: Reject Path — alt [Reject]

> Continues from step 35 of Diagram 1 (approver reviews loan with AI risk data). This shows the alternative path where the approver **rejects** the loan request.

```
  ┌── alt ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ [Reject]                                                                                                                                                   │
  │                                                                                                                                                            │
  │  Approver UI               Approver Wallet           LocalBank.sol             Polygon PoS              Backend API              Frontend (→Borrower)      │
  │     │                         │                        │                         │                        │                         │                        │
  │     │  36b. Click "Reject"    │                        │                         │                        │                         │                        │
  │     │  Enter reason:          │                        │                         │                        │                         │                        │
  │     │  "High fraud risk"      │                        │                         │                        │                         │                        │
  │     │────────────────────────>│                        │                         │                        │                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │  37b. Sign             │                         │                        │                         │                        │
  │     │                         │  rejectLoan(5,         │                         │                        │                         │                        │
  │     │                         │  "High fraud risk")    │                         │                        │                         │                        │
  │     │                         │───────────────────────>│                         │                        │                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │  38b. require(           │                        │                         │                        │
  │     │                         │                        │      onlyApprover)       │                        │                         │                        │
  │     │                         │                        │  39b. require(           │                        │                         │                        │
  │     │                         │                        │      status==Pending)    │                        │                         │                        │
  │     │                         │                        │  40b. loan.status =      │                        │                         │                        │
  │     │                         │                        │      Rejected            │                        │                         │                        │
  │     │                         │                        │  41b. loan.rejectedAt =  │                        │                         │                        │
  │     │                         │                        │      block.timestamp     │                        │                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │  42b. emit               │                        │                         │                        │
  │     │                         │                        │      LoanRejected(       │                        │                         │                        │
  │     │                         │                        │      5, borrower, 50,    │                        │                         │                        │
  │     │                         │                        │      "High fraud risk")  │                        │                         │                        │
  │     │                         │                        │────────────────────────>│                        │                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │                         │  43b. Event listener    │                         │                        │
  │     │                         │                        │                         │      detects event      │                         │                        │
  │     │                         │                        │                         │───────────────────────>│                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │                         │                        │  44b. UPDATE             │                        │
  │     │                         │                        │                         │                        │      LOAN_REQUEST        │                        │
  │     │                         │                        │                         │                        │      status='rejected'   │                        │
  │     │                         │                        │                         │                        │      rejected_reason=    │                        │
  │     │                         │                        │                         │                        │      "High fraud risk"   │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │                         │                        │  45b. Push notification  │                        │
  │     │                         │                        │                         │                        │─────────────────────────>│                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │                         │                        │                         │  46b. Display:           │
  │     │                         │                        │                         │                        │                         │      "Loan #5 Rejected"  │
  │     │                         │                        │                         │                        │                         │      Reason: High fraud  │
  │     │                         │                        │                         │                        │                         │      risk                │
  │     │                         │                        │                         │                        │                         │                        │
  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Sequence Diagram 2: Installment Payment Loop

> After a loan is approved (Diagram 1, steps 36–50), the borrower repays through installments. This diagram uses a **loop** fragment to show the repeating payment cycle and an **opt** fragment for the loan completion check.

```
  Borrower                   Frontend                  MetaMask                LocalBank.sol              Polygon PoS               Backend API
     │                          │                         │                        │                         │                         │
     │  1. Open "My Loans"      │                         │                        │                         │                         │
     │─────────────────────────>│                         │                        │                         │                         │
     │                          │  2. GET /loans/active    │                        │                         │                         │
     │                          │     + installments       │                        │                         │                         │
     │                          │────────────────────────────────────────────────────────────────────────────>│
     │                          │  3. Return loan list     │                        │                         │                         │
     │                          │     with schedule        │                        │                         │                         │
     │                          │<────────────────────────────────────────────────────────────────────────────│
     │                          │                         │                        │                         │                         │
     │  4. Display loan with    │                         │                        │                         │                         │
     │     installment progress │                         │                        │                         │                         │
     │     (X of Y paid)        │                         │                        │                         │                         │
     │<─────────────────────────│                         │                        │                         │                         │
     │                          │                         │                        │                         │                         │
  ┌── loop [For each installment until loan is fully repaid] ──────────────────────────────────────────────────────────────────────────┐
  │  │                          │                         │                        │                         │                         │  │
  │  │  5. Select next due      │                         │                        │                         │                         │  │
  │  │     installment          │                         │                        │                         │                         │  │
  │  │─────────────────────────>│                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │  6. Click "Pay           │                         │                        │                         │                         │  │
  │  │     Installment"         │                         │                        │                         │                         │  │
  │  │─────────────────────────>│                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │  7. Prepare unsigned     │                        │                         │                         │  │
  │  │                          │     payInstallment(      │                        │                         │                         │  │
  │  │                          │       loanId,            │                        │                         │                         │  │
  │  │                          │       installmentNo)     │                        │                         │                         │  │
  │  │                          │────────────────────────>│                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │  8. MetaMask popup       │                         │                        │                         │                         │  │
  │  │     "Pay 10 ETH?"        │                         │                        │                         │                         │  │
  │  │     Gas: 0.002 MATIC     │                         │                        │                         │                         │  │
  │  │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │  9. User clicks          │                         │                        │                         │                         │  │
  │  │     "Confirm"            │                         │                        │                         │                         │  │
  │  │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─>│                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │  10. Sign & broadcast   │                         │                         │  │
  │  │                          │                         │───────────────────────>│                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │                        │  11. require(            │                         │  │
  │  │                          │                         │                        │      installment exists  │                         │  │
  │  │                          │                         │                        │      & status=pending)   │                         │  │
  │  │                          │                         │                        │  12. require(            │                         │  │
  │  │                          │                         │                        │      msg.value ==        │                         │  │
  │  │                          │                         │                        │      installmentAmount)  │                         │  │
  │  │                          │                         │                        │  13. Mark installment    │                         │  │
  │  │                          │                         │                        │      as paid             │                         │  │
  │  │                          │                         │                        │  14. totalRepaid +=      │                         │  │
  │  │                          │                         │                        │      amount              │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │                        │  15. emit                │                         │  │
  │  │                          │                         │                        │      InstallmentPaid(    │                         │  │
  │  │                          │                         │                        │      loanId, number,     │                         │  │
  │  │                          │                         │                        │      amount)             │                         │  │
  │  │                          │                         │                        │────────────────────────>│                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │  16. Event listener      │  │
  │  │                          │                         │                        │                         │      detects event       │  │
  │  │                          │                         │                        │                         │─────────────────────────>│  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │  17. UPDATE INSTALLMENT  │  │
  │  │                          │                         │                        │                         │      status='paid'       │  │
  │  │                          │                         │                        │                         │  18. INSERT INTO         │  │
  │  │                          │                         │                        │                         │      TRANSACTION         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │  19. Tx confirmed        │                        │                         │                         │  │
  │  │                          │<────────────────────────────────────────────────────────────────────────────│                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │  20. "Installment Paid!" │                         │                        │                         │                         │  │
  │  │     Progress: X of Y     │                         │                        │                         │                         │  │
  │  │<─────────────────────────│                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  ┌── opt [All installments paid] ─────────────────────────────────────────────────────────────────────────────────────────────────┐  │
  │  │  │                          │                         │                        │                         │                      │  │
  │  │  │                          │                         │                        │  21. loan.status =      │                      │  │
  │  │  │                          │                         │                        │      Repaid             │                      │  │
  │  │  │                          │                         │                        │  22. emit               │                      │  │
  │  │  │                          │                         │                        │      LoanFullyRepaid(   │                      │  │
  │  │  │                          │                         │                        │      loanId, borrower)  │                      │  │
  │  │  │                          │                         │                        │───────────────────────>│                      │  │
  │  │  │                          │                         │                        │                         │                      │  │
  │  │  │                          │                         │                        │                         │  23. UPDATE           │  │
  │  │  │                          │                         │                        │                         │      LOAN_REQUEST     │  │
  │  │  │                          │                         │                        │                         │      status='repaid'  │  │
  │  │  │                          │                         │                        │                         │  24. UPDATE           │  │
  │  │  │                          │                         │                        │                         │      BORROWING_LIMIT  │  │
  │  │  │                          │                         │                        │                         │      (increase)       │  │
  │  │  │                          │                         │                        │                         │                      │  │
  │  │  │  25. "Loan Fully         │                         │                        │                         │                      │  │
  │  │  │       Repaid!"           │                         │                        │                         │                      │  │
  │  │  │<─────────────────────────│                         │                        │                         │                      │  │
  │  │  │                          │                         │                        │                         │                      │  │
  │  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
  │  │                          │                         │                        │                         │                         │  │
  └── end loop ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
     │                          │                         │                        │                         │                         │
```

---

### Sequence Diagram 3: Income Verification

> **Participants:** Borrower, Frontend, FastAPI, PostgreSQL, FileStorage, BankApprover. This diagram covers the full income-proof upload lifecycle — from the borrower uploading a document, through server-side validation and storage, to a bank approver reviewing and deciding on the proof.

```
  Borrower                   Frontend                     FastAPI                     PostgreSQL                  FileStorage                 BankApprover
     │                          │                            │                            │                          │                            │
     │  1. Open Income          │                            │                            │                          │                            │
     │     Verification page    │                            │                            │                          │                            │
     │─────────────────────────>│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  2. GET /income-proof/     │                            │                          │                            │
     │                          │     status (borrower_id)   │                            │                          │                            │
     │                          │───────────────────────────>│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  3. Query INCOME_PROOF     │                          │                            │
     │                          │                            │     table                  │                          │                            │
     │                          │                            │───────────────────────────>│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  4. Return status           │                          │                            │
     │                          │                            │     (or empty)             │                          │                            │
     │                          │                            │<───────────────────────────│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  5. Return verification    │                            │                          │                            │
     │                          │     status                 │                            │                          │                            │
     │                          │<───────────────────────────│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │  6. Show upload form     │                            │                            │                          │                            │
     │     (if no verified      │                            │                            │                          │                            │
     │      proof exists)       │                            │                            │                          │                            │
     │<─────────────────────────│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │  7. Select file          │                            │                            │                          │                            │
     │     + Upload             │                            │                            │                          │                            │
     │─────────────────────────>│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  8. Client-side validation │                            │                          │                            │
     │                          │     (type, size ≤ 5MB)     │                            │                          │                            │
     │                          │─────────┐                  │                            │                          │                            │
     │                          │         │ validate         │                            │                          │                            │
     │                          │<────────┘                  │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  9. POST /income-proof/    │                            │                          │                            │
     │                          │     upload (file,          │                            │                          │                            │
     │                          │     borrower_id)           │                            │                          │                            │
     │                          │───────────────────────────>│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  10. Server-side           │                          │                            │
     │                          │                            │      validation            │                          │                            │
     │                          │                            │      + SHA-256 hash        │                          │                            │
     │                          │                            │─────────┐                  │                          │                            │
     │                          │                            │         │ validate + hash  │                          │                            │
     │                          │                            │<────────┘                  │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  11. Store encrypted file  │                          │                            │
     │                          │                            │──────────────────────────────────────────────────────>│                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  12. Return file_path      │                          │                            │
     │                          │                            │<──────────────────────────────────────────────────────│                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  13. INSERT INTO           │                          │                            │
     │                          │                            │      INCOME_PROOF          │                          │                            │
     │                          │                            │      (status='pending')    │                          │                            │
     │                          │                            │───────────────────────────>│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  14. Confirm insert        │                          │                            │
     │                          │                            │<───────────────────────────│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  15. Return success        │                            │                          │                            │
     │                          │<───────────────────────────│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │  16. Show "Pending       │                            │                            │                          │                            │
     │      Review" status      │                            │                            │                          │                            │
     │<─────────────────────────│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │  [Note: Bank Review Phase]                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  17. View pending          │                            │                          │                            │
     │                          │      income proofs         │                            │                          │                            │
     │                          │<──────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
     │                          │                            │                            │                          │                            │
     │                          │  18. GET /income-proofs/   │                            │                          │                            │
     │                          │      pending               │                            │                          │                            │
     │                          │───────────────────────────>│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  19. Query pending         │                          │                            │
     │                          │                            │      INCOME_PROOF records  │                          │                            │
     │                          │                            │───────────────────────────>│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  20. Return pending        │                          │                            │
     │                          │                            │      proofs               │                          │                            │
     │                          │                            │<───────────────────────────│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  21. Return proofs list    │                            │                          │                            │
     │                          │<───────────────────────────│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  22. Display proofs        │                            │                          │                            │
     │                          │      for review            │                            │                          │                            │
     │                          │──────────────────────────────────────────────────────────────────────────────────────────────────────────────────>│
     │                          │                            │                            │                          │                            │
     │                          │  23. Approve/Reject        │                            │                          │                            │
     │                          │      with notes            │                            │                          │                            │
     │                          │<──────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
     │                          │                            │                            │                          │                            │
     │                          │  24. PATCH /income-proof/  │                            │                          │                            │
     │                          │      {id} (status, notes)  │                            │                          │                            │
     │                          │───────────────────────────>│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  25. UPDATE INCOME_PROOF   │                          │                            │
     │                          │                            │      SET status,           │                          │                            │
     │                          │                            │      reviewed_by,          │                          │                            │
     │                          │                            │      reviewed_at           │                          │                            │
     │                          │                            │───────────────────────────>│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  26. Confirm update        │                          │                            │
     │                          │                            │<───────────────────────────│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  27. Return updated        │                            │                          │                            │
     │                          │      status                │                            │                          │                            │
     │                          │<───────────────────────────│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  28. Show confirmation     │                            │                          │                            │
     │                          │──────────────────────────────────────────────────────────────────────────────────────────────────────────────────>│
     │                          │                            │                            │                          │                            │
```

---

### Sequence Diagram 4: Chat System

> **Participants:** Borrower, Frontend, WebSocket, FastAPI, PostgreSQL, BankApprover. This diagram covers the real-time chat between a borrower and a bank approver on a specific loan request, including chat history loading, typing indicators, real-time message delivery, and read receipts.

```
  Borrower                   Frontend                     WebSocket                   FastAPI                     PostgreSQL                  BankApprover
     │                          │                            │                            │                          │                            │
     │  1. Open loan details    │                            │                            │                          │                            │
     │     → Click "Chat"       │                            │                            │                          │                            │
     │─────────────────────────>│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  2. GET /chat/history      │                            │                          │                            │
     │                          │     (loan_request_id)      │                            │                          │                            │
     │                          │──────────────────────────────────────────────────────── >│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │                            │  3. Query CHAT_MESSAGE   │                            │
     │                          │                            │                            │     WHERE loan_request_id│                            │
     │                          │                            │                            │     ORDER BY sent_at     │                            │
     │                          │                            │                            │────────────────────────>│                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │                            │  4. Return messages      │                            │
     │                          │                            │                            │<────────────────────────│                            │
     │                          │                            │                            │                          │                            │
     │                          │  5. Return formatted       │                            │                          │                            │
     │                          │     chat history           │                            │                          │                            │
     │                          │<──────────────────────────────────────────────────────── │                          │                            │
     │                          │                            │                            │                          │                            │
     │  6. Display chat window  │                            │                            │                          │                            │
     │     with history         │                            │                            │                          │                            │
     │<─────────────────────────│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │  7. Type message         │                            │                            │                          │                            │
     │─────────────────────────>│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  8. Emit "typing" event    │                            │                          │                            │
     │                          │───────────────────────────>│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  9. Forward typing         │                          │                            │
     │                          │                            │     indicator              │                          │                            │
     │                          │                            │──────────────────────────────────────────────────────────────────────────────────── >│
     │                          │                            │                            │                          │                            │
     │  10. Send message        │                            │                            │                          │                            │
     │─────────────────────────>│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  11. POST /chat/send       │                            │                          │                            │
     │                          │      (loan_request_id,     │                            │                          │                            │
     │                          │       sender_id, message)  │                            │                          │                            │
     │                          │──────────────────────────────────────────────────────── >│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │                            │  12. INSERT INTO         │                            │
     │                          │                            │                            │      CHAT_MESSAGE        │                            │
     │                          │                            │                            │────────────────────────>│                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │                            │  13. Confirm insert      │                            │
     │                          │                            │                            │<────────────────────────│                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  14. Emit "new_message"    │                          │                            │
     │                          │                            │      event                 │                          │                            │
     │                          │                            │<──────────────────────────── │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  15. Deliver real-time     │                          │                            │
     │                          │                            │      notification          │                          │                            │
     │                          │                            │──────────────────────────────────────────────────────────────────────────────────── >│
     │                          │                            │                            │                          │                            │
     │                          │  16. Return success        │                            │                          │                            │
     │                          │<──────────────────────────────────────────────────────── │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  17. View notification     │                            │                          │                            │
     │                          │      → Open chat           │                            │                          │                            │
     │                          │<──────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
     │                          │                            │                            │                          │                            │
     │                          │  18. Read message          │                            │                          │                            │
     │                          │<──────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
     │                          │                            │                            │                          │                            │
     │                          │  19. PATCH /chat/read      │                            │                          │                            │
     │                          │      (message_id)          │                            │                          │                            │
     │                          │──────────────────────────────────────────────────────── >│                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │                            │  20. UPDATE              │                            │
     │                          │                            │                            │      CHAT_MESSAGE        │                            │
     │                          │                            │                            │      SET is_read=true    │                            │
     │                          │                            │                            │────────────────────────>│                            │
     │                          │                            │                            │                          │                            │
```

---

### Sequence Diagram 5: AI Chatbot Interaction

> **Participants:** Borrower, Frontend, ChatbotService, NLPEngine, PostgreSQL. This diagram shows the AI chatbot session lifecycle — initialisation with user context, natural-language question processing via the NLP engine (intent classification and entity extraction), conditional data retrieval based on intent, and response formatting.

```
  Borrower                   Frontend                     ChatbotService              NLPEngine                   PostgreSQL
     │                          │                            │                            │                          │
     │  1. Open AI Chatbot      │                            │                            │                          │
     │─────────────────────────>│                            │                            │                          │
     │                          │                            │                            │                          │
     │                          │  2. Initialize session     │                            │                          │
     │                          │     (borrower_id)          │                            │                          │
     │                          │───────────────────────────>│                            │                          │
     │                          │                            │                            │                          │
     │                          │                            │  3. Load user context      │                          │
     │                          │                            │     (BORROWER,             │                          │
     │                          │                            │      LOAN_REQUEST,         │                          │
     │                          │                            │      BORROWING_LIMIT)      │                          │
     │                          │                            │───────────────────────────────────────────────────────>│
     │                          │                            │                            │                          │
     │                          │                            │  4. Return user data       │                          │
     │                          │                            │<───────────────────────────────────────────────────────│
     │                          │                            │                            │                          │
     │                          │  5. Return welcome message │                            │                          │
     │                          │     + context summary      │                            │                          │
     │                          │<───────────────────────────│                            │                          │
     │                          │                            │                            │                          │
     │  6. Display chatbot      │                            │                            │                          │
     │     interface            │                            │                            │                          │
     │<─────────────────────────│                            │                            │                          │
     │                          │                            │                            │                          │
     │  7. Ask question         │                            │                            │                          │
     │     (e.g., "What's my   │                            │                            │                          │
     │      borrowing limit?")  │                            │                            │                          │
     │─────────────────────────>│                            │                            │                          │
     │                          │                            │                            │                          │
     │                          │  8. POST /chatbot/ask      │                            │                          │
     │                          │     (session_id, message)  │                            │                          │
     │                          │───────────────────────────>│                            │                          │
     │                          │                            │                            │                          │
     │                          │                            │  9. Tokenize +             │                          │
     │                          │                            │     Remove stop words      │                          │
     │                          │                            │───────────────────────────>│                          │
     │                          │                            │                            │                          │
     │                          │                            │                            │  10. Classify intent     │
     │                          │                            │                            │      (loan_limit /       │
     │                          │                            │                            │       payment_due /      │
     │                          │                            │                            │       bank_info /        │
     │                          │                            │                            │       general)           │
     │                          │                            │                            │─────────┐               │
     │                          │                            │                            │         │ classify       │
     │                          │                            │                            │<────────┘               │
     │                          │                            │                            │                          │
     │                          │                            │                            │  11. Extract entities    │
     │                          │                            │                            │─────────┐               │
     │                          │                            │                            │         │ extract        │
     │                          │                            │                            │<────────┘               │
     │                          │                            │                            │                          │
     │                          │                            │  12. Return intent         │                          │
     │                          │                            │      + entities            │                          │
     │                          │                            │<───────────────────────────│                          │
     │                          │                            │                            │                          │
     │                          │                            │                            │                          │
  ┌── alt ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ [intent = loan_limit]       │                            │                            │                          │       │
  │  │                          │                            │                            │                          │       │
  │  │                          │                            │  13a. Query                │                          │       │
  │  │                          │                            │       BORROWING_LIMIT      │                          │       │
  │  │                          │                            │───────────────────────────────────────────────────────>│       │
  │  │                          │                            │  13a. Return limit data    │                          │       │
  │  │                          │                            │<───────────────────────────────────────────────────────│       │
  │  │                          │                            │                            │                          │       │
  ├── [intent = payment_due] ───────────────────────────────────────────────────────────────────────────────────────────────┤
  │  │                          │                            │                            │                          │       │
  │  │                          │                            │  13b. Query INSTALLMENT    │                          │       │
  │  │                          │                            │       WHERE status=        │                          │       │
  │  │                          │                            │       'pending'            │                          │       │
  │  │                          │                            │───────────────────────────────────────────────────────>│       │
  │  │                          │                            │  13b. Return pending       │                          │       │
  │  │                          │                            │       installments         │                          │       │
  │  │                          │                            │<───────────────────────────────────────────────────────│       │
  │  │                          │                            │                            │                          │       │
  ├── [intent = bank_info] ─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │  │                          │                            │                            │                          │       │
  │  │                          │                            │  13c. Query LOCAL_BANK /   │                          │       │
  │  │                          │                            │       NATIONAL_BANK        │                          │       │
  │  │                          │                            │───────────────────────────────────────────────────────>│       │
  │  │                          │                            │  13c. Return bank data     │                          │       │
  │  │                          │                            │<───────────────────────────────────────────────────────│       │
  │  │                          │                            │                            │                          │       │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
     │                          │                            │                            │                          │
     │                          │                            │  14. Format response       │                          │
     │                          │                            │      with data             │                          │
     │                          │                            │─────────┐                  │                          │
     │                          │                            │         │ format           │                          │
     │                          │                            │<────────┘                  │                          │
     │                          │                            │                            │                          │
     │                          │                            │  15. INSERT INTO           │                          │
     │                          │                            │      AI_CHATBOT_LOG        │                          │
     │                          │                            │───────────────────────────────────────────────────────>│
     │                          │                            │                            │                          │
     │                          │  16. Return formatted      │                            │                          │
     │                          │      response              │                            │                          │
     │                          │<───────────────────────────│                            │                          │
     │                          │                            │                            │                          │
     │  17. Display response    │                            │                            │                          │
     │<─────────────────────────│                            │                            │                          │
     │                          │                            │                            │                          │
```

---

### Sequence Diagram 6: Hierarchical Banking (World Bank → National Bank → Local Bank → Borrower)

> **Participants:** WorldBankAdmin, Frontend, SmartContract (WorldBankReserve.sol), Blockchain, NationalBank, SmartContract (NationalBank.sol), LocalBank, SmartContract (LocalBank.sol), Borrower. This diagram illustrates the three-tier fund flow — deposit into the world-bank reserve, cascading loan approvals down through national and local banks, and repayment cascading back up.

```
  WorldBankAdmin       Frontend              WBReserve.sol          Blockchain             NationalBank           NationalBank.sol        LocalBank              LocalBank.sol           Borrower
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │  1. Deposit funds  │                      │                      │                      │                      │                      │                      │                      │
     │    to reserve      │                      │                      │                      │                      │                      │                      │                      │
     │───────────────────>│                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │  2. deposit()         │                      │                      │                      │                      │                      │                      │
     │                    │  {value: amount}      │                      │                      │                      │                      │                      │                      │
     │                    │─────────────────────>│                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │  3. Record           │                      │                      │                      │                      │                      │
     │                    │                      │     transaction      │                      │                      │                      │                      │                      │
     │                    │                      │────────────────────>│                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │  4. Confirm          │                      │                      │                      │                      │                      │
     │                    │                      │<────────────────────│                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │  5. Request loan      │                      │                      │                      │                      │                      │                      │
     │                    │     from World Bank   │                      │                      │                      │                      │                      │                      │
     │                    │<─────────────────────────────────────────────────────────────────────│                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │  6. requestLoan       │                      │                      │                      │                      │                      │                      │
     │                    │     (amount)          │                      │                      │                      │                      │                      │                      │
     │                    │─────────────────────>│                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │  7. Check available  │                      │                      │                      │                      │                      │
     │                    │                      │     reserve          │                      │                      │                      │                      │                      │
     │                    │                      │─────────┐            │                      │                      │                      │                      │                      │
     │                    │                      │         │ check      │                      │                      │                      │                      │                      │
     │                    │                      │<────────┘            │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │  8. Approve NB     │                      │                      │                      │                      │                      │                      │                      │
     │     loan           │                      │                      │                      │                      │                      │                      │                      │
     │───────────────────>│                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │  9. approveLoan       │                      │                      │                      │                      │                      │                      │
     │                    │     (nb_address,      │                      │                      │                      │                      │                      │                      │
     │                    │      amount)          │                      │                      │                      │                      │                      │                      │
     │                    │─────────────────────>│                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │  10. Transfer funds  │                      │                      │                      │                      │                      │
     │                    │                      │      to NB contract  │                      │                      │                      │                      │                      │
     │                    │                      │────────────────────>│                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │  11. Receive funds   │                      │                      │                      │                      │
     │                    │                      │                      │─────────────────────────────────────────────>│                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │  12. Request loan     │                      │                      │                      │                      │                      │                      │
     │                    │      from National    │                      │                      │                      │                      │                      │                      │
     │                    │      Bank             │                      │                      │                      │                      │                      │                      │
     │                    │<───────────────────────────────────────────────────────────────────────────────────────────────────────────────────│                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │  13. requestLoan      │                      │                      │                      │                      │                      │                      │
     │                    │      (amount)         │                      │                      │                      │                      │                      │                      │
     │                    │──────────────────────────────────────────────────────────────────────────────────────────>│                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │  14. Approve LB       │                      │                      │                      │                      │                      │                      │
     │                    │      loan             │                      │                      │                      │                      │                      │                      │
     │                    │<─────────────────────────────────────────────────────────────────────│                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │  15. approveLoan      │                      │                      │                      │                      │                      │                      │
     │                    │      (lb_address,     │                      │                      │                      │                      │                      │                      │
     │                    │       amount)         │                      │                      │                      │                      │                      │                      │
     │                    │──────────────────────────────────────────────────────────────────────────────────────────>│                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │  16. Transfer to     │                      │                      │
     │                    │                      │                      │                      │                      │      LB contract     │                      │                      │
     │                    │                      │                      │  17. Transfer        │                      │                      │                      │                      │
     │                    │                      │                      │      on-chain        │                      │                      │                      │                      │
     │                    │                      │                      │────────────────────────────────────────────────────────────────────────────────────────────>│                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │  18. Receive funds   │                      │
     │                    │                      │                      │                      │                      │                      │──────────────────── >│                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │  [Note: Repayment cascades back up]       │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │  19. payInstallment()│
     │                    │                      │                      │                      │                      │                      │                      │<─────────────────────│
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │  20. Forward share   │                      │
     │                    │                      │                      │                      │                      │                      │      to NB           │                      │
     │                    │                      │                      │                      │                      │                      │<─────────────────────│                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │                      │                      │                      │  21. Forward share   │                      │                      │
     │                    │                      │                      │                      │                      │      to NB           │                      │                      │
     │                    │                      │                      │                      │                      │<─────────────────────│                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
     │                    │                      │  22. Forward share   │                      │                      │                      │                      │                      │
     │                    │                      │      to WB           │                      │                      │                      │                      │                      │
     │                    │                      │<──────────────────────────────────────────────────────────────────│                      │                      │                      │
     │                    │                      │                      │                      │                      │                      │                      │                      │
```

---

### Sequence Diagram 7: Market Data Retrieval

> **Participants:** Borrower, Frontend, FastAPI, RedisCache, PostgreSQL, CoinGeckoAPI. This diagram shows how live cryptocurrency prices are fetched (with a Redis caching layer and CoinGecko as the external source), how historical chart data is queried, and the auto-refresh polling mechanism.

```
  Borrower                   Frontend                     FastAPI                     RedisCache                  PostgreSQL                  CoinGeckoAPI
     │                          │                            │                            │                          │                            │
     │  1. Navigate to Market   │                            │                            │                          │                            │
     │     Data dashboard       │                            │                            │                          │                            │
     │─────────────────────────>│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  2. GET /market-data/      │                            │                          │                            │
     │                          │     prices (crypto_ids[])  │                            │                          │                            │
     │                          │───────────────────────────>│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  3. Check cache            │                          │                            │
     │                          │                            │     (key: market_prices_   │                          │                            │
     │                          │                            │      {crypto_id})          │                          │                            │
     │                          │                            │───────────────────────────>│                          │                            │
     │                          │                            │                            │                          │                            │
  ┌── alt ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ [Cache Hit]                 │                            │                            │                          │                            │       │
  │  │                          │                            │                            │                          │                            │       │
  │  │                          │                            │  4a. Return cached data    │                          │                            │       │
  │  │                          │                            │<───────────────────────────│                          │                            │       │
  │  │                          │                            │                            │                          │                            │       │
  ├── [Cache Miss] ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │  │                          │                            │                            │                          │                            │       │
  │  │                          │                            │  4b. GET /simple/price?    │                          │                            │       │
  │  │                          │                            │      ids=...               │                          │                            │       │
  │  │                          │                            │      &vs_currencies=usd    │                          │                            │       │
  │  │                          │                            │──────────────────────────────────────────────────────────────────────────────────────────>│       │
  │  │                          │                            │                            │                          │                            │       │
  │  │                          │                            │  5b. Return price data     │                          │                            │       │
  │  │                          │                            │<──────────────────────────────────────────────────────────────────────────────────────────│       │
  │  │                          │                            │                            │                          │                            │       │
  │  │                          │                            │  6b. SET cache             │                          │                            │       │
  │  │                          │                            │      (TTL: 5 min)          │                          │                            │       │
  │  │                          │                            │───────────────────────────>│                          │                            │       │
  │  │                          │                            │                            │                          │                            │       │
  │  │                          │                            │  7b. INSERT/UPDATE         │                          │                            │       │
  │  │                          │                            │      MARKET_DATA           │                          │                            │       │
  │  │                          │                            │──────────────────────────────────────────────────────>│                            │       │
  │  │                          │                            │                            │                          │                            │       │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
     │                          │                            │                            │                          │                            │
     │                          │  8. Return price data      │                            │                          │                            │
     │                          │<───────────────────────────│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │  9. Render price cards   │                            │                            │                          │                            │
     │<─────────────────────────│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │  10. Select crypto for   │                            │                            │                          │                            │
     │      historical chart    │                            │                            │                          │                            │
     │─────────────────────────>│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  11. GET /market-data/     │                            │                          │                            │
     │                          │      history (crypto_id,   │                            │                          │                            │
     │                          │      range)                │                            │                          │                            │
     │                          │───────────────────────────>│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  12. Query MARKET_DATA     │                          │                            │
     │                          │                            │      WHERE crypto_id       │                          │                            │
     │                          │                            │      AND date range        │                          │                            │
     │                          │                            │──────────────────────────────────────────────────────>│                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │  13. Return historical     │                          │                            │
     │                          │                            │      data                  │                          │                            │
     │                          │                            │<──────────────────────────────────────────────────────│                            │
     │                          │                            │                            │                          │                            │
     │                          │  14. Return data points    │                            │                          │                            │
     │                          │<───────────────────────────│                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │  15. Render Chart.js       │                            │                          │                            │
     │                          │      line chart            │                            │                          │                            │
     │                          │      (tooltips,            │                            │                          │                            │
     │                          │       time range)          │                            │                          │                            │
     │                          │─────────┐                  │                            │                          │                            │
     │                          │         │ render           │                            │                          │                            │
     │                          │<────────┘                  │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │  16. Display interactive │                            │                            │                          │                            │
     │      chart               │                            │                            │                          │                            │
     │<─────────────────────────│                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
     │                          │                            │                            │                          │                            │
  ┌── loop [Auto-refresh every 5 minutes] ──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  │                          │                            │                            │                          │                            │       │
  │  │                          │  17. GET /market-data/     │                            │                          │                            │       │
  │  │                          │      prices (polling)      │                            │                          │                            │       │
  │  │                          │───────────────────────────>│                            │                          │                            │       │
  │  │                          │                            │  (cache / fetch cycle      │                          │                            │       │
  │  │                          │                            │   repeats as above)        │                          │                            │       │
  │  │                          │  18. Return updated        │                            │                          │                            │       │
  │  │                          │      prices                │                            │                          │                            │       │
  │  │                          │<───────────────────────────│                            │                          │                            │       │
  │  │                          │                            │                            │                          │                            │       │
  │  │  19. Re-render price     │                            │                            │                          │                            │       │
  │  │      cards               │                            │                            │                          │                            │       │
  │  │<─────────────────────────│                            │                            │                          │                            │       │
  │  │                          │                            │                            │                          │                            │       │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
     │                          │                            │                            │                          │                            │
```

---

### Sequence Diagram 8: Borrowing Limit Calculation

> **Participants:** System/Trigger, FastAPI, PostgreSQL, BorrowingLimitEngine. This diagram shows the borrowing-limit recalculation triggered by events such as a new loan request, approval, payment, or a scheduled cron job. The engine gathers 6-month and 12-month transaction history, applies a loyalty multiplier, enforces concurrent-loan and yearly caps, and persists the result.

```
  System/Trigger               FastAPI                     BorrowingLimitEngine         PostgreSQL
     │                            │                            │                            │
     │                            │                            │                            │
     │  [Note: Trigger — Loan Request / Approval / Payment / Scheduled Job]                 │
     │                            │                            │                            │
     │  1. Calculate borrowing    │                            │                            │
     │     limit (borrower_id)    │                            │                            │
     │───────────────────────────>│                            │                            │
     │                            │                            │                            │
     │                            │  2. Process limit          │                            │
     │                            │     calculation            │                            │
     │                            │───────────────────────────>│                            │
     │                            │                            │                            │
     │                            │                            │  3. Query TRANSACTION      │
     │                            │                            │     (last 6 months)        │
     │                            │                            │───────────────────────────>│
     │                            │                            │                            │
     │                            │                            │  4. Return 6-month         │
     │                            │                            │     transactions           │
     │                            │                            │<───────────────────────────│
     │                            │                            │                            │
     │                            │                            │  5. Calculate 6-month      │
     │                            │                            │     rolling sum            │
     │                            │                            │─────────┐                  │
     │                            │                            │         │ compute          │
     │                            │                            │<────────┘                  │
     │                            │                            │                            │
     │                            │                            │  6. Query TRANSACTION      │
     │                            │                            │     (last 12 months)       │
     │                            │                            │───────────────────────────>│
     │                            │                            │                            │
     │                            │                            │  7. Return 12-month        │
     │                            │                            │     transactions           │
     │                            │                            │<───────────────────────────│
     │                            │                            │                            │
     │                            │                            │  8. Calculate 12-month     │
     │                            │                            │     rolling sum            │
     │                            │                            │─────────┐                  │
     │                            │                            │         │ compute          │
     │                            │                            │<────────┘                  │
     │                            │                            │                            │
     │                            │                            │  9. Query BORROWER         │
     │                            │                            │     .consecutive_paid_loans│
     │                            │                            │───────────────────────────>│
     │                            │                            │                            │
     │                            │                            │  10. Return consecutive    │
     │                            │                            │      count                 │
     │                            │                            │<───────────────────────────│
     │                            │                            │                            │
     │                            │                            │  11. Apply loyalty         │
     │                            │                            │      multiplier            │
     │                            │                            │─────────┐                  │
     │                            │                            │         │ compute          │
     │                            │                            │<────────┘                  │
     │                            │                            │                            │
     │                            │                            │  12. Query active          │
     │                            │                            │      LOAN_REQUEST count    │
     │                            │                            │───────────────────────────>│
     │                            │                            │                            │
     │                            │                            │  13. Return active loan    │
     │                            │                            │      count                 │
     │                            │                            │<───────────────────────────│
     │                            │                            │                            │
     │                            │                            │  14. Check max concurrent  │
     │                            │                            │      loans (3)             │
     │                            │                            │─────────┐                  │
     │                            │                            │         │ check            │
     │                            │                            │<────────┘                  │
     │                            │                            │                            │
     │                            │                            │  15. Check yearly limit    │
     │                            │                            │      not exceeded          │
     │                            │                            │─────────┐                  │
     │                            │                            │         │ check            │
     │                            │                            │<────────┘                  │
     │                            │                            │                            │
     │                            │                            │  16. Final limit =         │
     │                            │                            │      min(6mo, 12mo) ×      │
     │                            │                            │      loyalty ×             │
     │                            │                            │      availability          │
     │                            │                            │─────────┐                  │
     │                            │                            │         │ compute          │
     │                            │                            │<────────┘                  │
     │                            │                            │                            │
     │                            │                            │  17. UPSERT               │
     │                            │                            │      BORROWING_LIMIT       │
     │                            │                            │───────────────────────────>│
     │                            │                            │                            │
     │                            │                            │  18. Confirm update        │
     │                            │                            │<───────────────────────────│
     │                            │                            │                            │
     │                            │  19. Return calculated     │                            │
     │                            │      limit                 │                            │
     │                            │<───────────────────────────│                            │
     │                            │                            │                            │
     │  20. Return limit result   │                            │                            │
     │<───────────────────────────│                            │                            │
     │                            │                            │                            │
```

# Activity Diagrams (Mermaid) — shortened labels for thesis PDF

Labels are kept short so text fits boxes when rendered with `htmlLabels: false` (SVG text, PDF-safe).

---

## Loan Request to Repayment Flow

```mermaid
flowchart TB
    A([START]) --> B[Open DApp]
    B --> C[Connect wallet]
    C --> D{Connected?}
    D -->|No| F[Show error]
    F --> END1([END])
    D -->|Yes| E[Read address and role]
    E --> G[Loan page: amount and purpose]
    G --> H{First loan?}
    H -->|Yes| I[Upload income proof]
    I --> J{Proof OK?}
    J -->|No| L[Reject: no proof]
    L --> END2([END])
    H -->|No| K[Check borrowing limit]
    J -->|Yes| K
    K --> M{Within limit?}
    M -->|No| O[Reject: over limit]
    O --> END3([END])
    M -->|Yes| N[Build requestLoan tx]
    N --> P[MetaMask: confirm]
    P --> Q{Confirmed?}
    Q -->|No| S[Cancelled]
    S --> END4([END])
    Q -->|Yes| R[Broadcast to Polygon]
    R --> T[Contract validates\nand emits event]
    T --> U{Tx OK?}
    U -->|No| V[Show tx error]
    V --> END5([END])
    U -->|Yes| W[Show success + hash]
    W --> X[Listener: DB + AI risk]
    subgraph APPROVER[Approver]
        Y[View pending + risk]
        Y --> Z{Approve?}
        Z -->|Reject| AA[rejectLoan + notify]
        AA --> END6([END])
        Z -->|Yes| AB[approveLoan]
        AB --> AC[Transfer funds\nEmit LoanApproved]
    end
    X --> Y
    AC --> AD{Amount >= 100 ETH?}
    AD -->|Yes| AE[Plan installments]
    AD -->|No| AF[Single due date]
    AE --> AG[Funds to borrower\nUpdate limits]
    AF --> AG
    AG --> AH{Due?}
    AH -->|Yes| AI[payInstallment]
    AI --> AH
    AH -->|All paid| AJ[Loan complete]
    AJ --> END7([END])
```

---

## Income Verification Flow

```mermaid
flowchart TB
    A([START]) --> B[Login to DApp]
    B --> C{First borrower?}
    C -->|No| E[Proof on file]
    C -->|Yes| D[Upload proof prompt]
    D --> F[Select file]
    F --> G[Validate type and size]
    G --> H{Valid?}
    H -->|No| J[Error message]
    J --> F
    H -->|Yes| I[Store PENDING]
    subgraph APPROVER[Approver]
        L[View pending proofs]
        L --> M[Review document]
        M --> N{Decision?}
        N -->|Reject| O[REJECTED + notify]
        O --> END1([END])
        N -->|Approve| P[APPROVED + notify]
    end
    I --> L
    P --> Q[Open loan page]
    E --> Q
    Q --> END2([END])
```

---

## Chat System Flow

```mermaid
flowchart TB
    subgraph SENDER[Sender]
        A([START]) --> B[Open loan chat]
        B --> C[GET chat history]
        C --> F{History?}
        F -->|Yes| G[Show messages]
        F -->|No| H[Empty chat]
        G --> I[Type message]
        H --> I
        I --> J[Send]
        J --> K{Valid?}
        K -->|No| L[Validation error]
        L --> I
        K -->|Yes| M[POST message]
        M --> N[Save DB]
        N --> O[Update UI]
        O --> P[Notify receiver]
    end
    subgraph RECEIVER[Receiver]
        Q[Open chat]
        Q --> R[Load messages]
        R --> S[Show message]
        S --> T[Mark read]
        T --> END1([END])
    end
    P --> Q
```

---

## AI Chatbot Interaction Flow

```mermaid
flowchart TB
    A([START]) --> B[Open chatbot]
    B --> C[Load user context]
    C --> D[Welcome message]
    D --> E[User question]
    E --> F[NLP: intent + entities]
    F --> G{Intent?}
    G -->|limit| H[Query limits]
    G -->|payment| I[Query installments]
    G -->|bank| J[Query bank info]
    G -->|other| K[FAQ / support]
    H --> L[Format reply]
    I --> L
    J --> L
    K --> L
    L --> M[Log interaction]
    M --> N[Show reply]
    N --> P{More?}
    P -->|Yes| E
    P -->|No| END1([END])
```

---

## Hierarchical Banking Flow

```mermaid
flowchart TB
    subgraph WB[World Bank]
        A([START]) --> B[Deposit reserve]
        B --> C[Reserve pool]
        C --> E{Approve NB?}
        E -->|No| F[Reject NB]
        F --> END1([END])
        E -->|Yes| G[Transfer to NB]
    end
    subgraph NB[National Bank]
        D[NB requests loan]
        H[NB receives funds]
        H --> I[LB requests loan]
        I --> J{Approve LB?}
        J -->|No| K[Reject LB]
        K --> END2([END])
        J -->|Yes| L[Transfer to LB]
    end
    D --> E
    G --> H
    subgraph LB[Local Bank]
        M[LB receives funds]
        M --> N[Borrower requests]
        N --> O{Approve?}
        O -->|No| P[Reject borrower]
        P --> END3([END])
        O -->|Yes| Q[Disburse loan]
        Q --> R[Loan active]
    end
    L --> M
    subgraph REPAY[Repayment]
        S[Borrower pays LB]
        S --> T[LB pays NB]
        T --> U[NB pays WB]
        U --> END4([END])
    end
    R --> S
```

---

## Market Data Viewing Flow

```mermaid
flowchart TB
    A([START]) --> B[Open dashboard]
    B --> C[Select loan]
    C --> D[Get crypto id]
    D --> E{Cache fresh?}
    E -->|Yes| J[Draw chart]
    E -->|No| F[CoinGecko API]
    F --> G{OK?}
    G -->|Yes| H[Update cache]
    G -->|No| I[Use stale cache]
    H --> J
    I --> J
    J --> K[Show price stats]
    K --> L[Poll every 5 min]
    L --> M{Still on page?}
    M -->|Yes| E
    M -->|No| N[Stop timer]
    N --> END1([END])
```

---

## Profile Management Flow

```mermaid
flowchart TB
    A([START]) --> B[Open profile]
    B --> C[Detect role]
    C --> D[Load profile data]
    D --> E[Show dashboard]
    E --> F{Action?}
    F -->|Edit| G[Edit form]
    F -->|Terms| H[Show T and C]
    F -->|Prefs| I[Preferences]
    F -->|History| J[History list]
    G --> K[Validate]
    K --> L{OK?}
    L -->|No| G
    L -->|Yes| N[Save profile]
    H --> O[Accept terms]
    I --> P[Save prefs]
    J --> R[Show table]
    N --> S[Refresh view]
    O --> S
    P --> S
    R --> S
    S --> END1([END])
```

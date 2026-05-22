# All Mermaid Diagrams — Master Source Archive

Every diagram used in `Pre-thesis_v11.tex` is stored here as **Mermaid source**.
PNG files in `Diagrams/mermaid-pdf/` are generated from this file and `new-diagrams-build.md`.

**Regenerate this file:** `python3 tools/rebuild_all_diagrams_md.py`  
**Build PNGs:** `python3 tools/build_mermaid_pdfs.py`

---

## Part 1 — CSE471 system analysis (UML, DFD, sequences)

## Component Diagram

- **Rendered PNG:** `Diagrams/mermaid-pdf/component-diagram.png`
- **Mermaid archive:** `Diagrams/mermaid-src/component-diagram.mmd`

```mermaid
graph TB

    subgraph PL["️ PRESENTATION LAYER"]
        direction TB

        subgraph PL_Core["Core Modules"]
            direction TB
            Dashboard["Dashboard\n<i>IDashboard</i>"]
            LoanModule["Loan Module\n<i>ILoanService</i>"]
            AdminPanel["Admin Panel\n<i>IAdminService</i>"]
        end

        subgraph PL_Features["Feature Modules"]
            direction TB
            RiskDash["Risk Dashboard\n<i>IRiskService</i>"]
            ChatModule["Chat Module\n<i>IChatService</i>"]
            ChatbotUI["Chatbot UI\n<i>IChatbotUI</i>"]
        end

        subgraph PL_Utility["Utility Modules"]
            direction TB
            ProfileMod["Profile Module\n<i>IProfileService</i>"]
            MarketMod["Market Data\n<i>IMarketDataView</i>"]
            QRModule["QR Module\n<i>IQRService</i>"]
            WalletProv["Wallet Provider\n<i>Wagmi + RainbowKit</i>"]
        end
    end

    subgraph SCL["️ SMART CONTRACT LAYER"]
        direction TB

        subgraph SC_Contracts["Contracts (Solidity 0.8.20)"]
            direction TB
            WBReserve["WorldBankReserve\n<i>IReserve</i>"]
            WBReserveOps["depositToReserve( )\nregisterNatBank( )\nlendToNatBank( )\npause( ) / unpause( )\nemergencyWithdraw( )"]

            NatBankC["NationalBank\n<i>INationalBank</i>"]
            NatBankOps["registerLocalBank( )\nborrowFromWB( )\nlendToLocalBank( )"]

            LocBankC["LocalBank\n<i>ILocalBank</i>"]
            LocBankOps["requestLoan( )\napproveLoan( )\nrejectLoan( )\npayInstallment( )\nsetApprover( )"]
        end

        subgraph SC_Libs["Libraries"]
            direction TB
            OZ["OpenZeppelin\nReentrancyGuard\nOwnable"]
        end

        WBReserve -->|"lends to"| NatBankC
        NatBankC -->|"lends to"| LocBankC
        WBReserve -->|"implements"| WBReserveOps
        NatBankC -->|"implements"| NatBankOps
        LocBankC -->|"implements"| LocBankOps
        SC_Contracts --> OZ
    end

    subgraph BSL["️ BACKEND SERVICES LAYER"]
        direction TB

        subgraph BS_API["API Gateway"]
            direction TB
            FastAPI["FastAPI\n<i>ILoanAPI · IUserAPI · IRiskAPI</i>"]
        end

        subgraph BS_Data["Data Services"]
            direction TB
            Postgres["PostgreSQL\n<i>IDataStore</i>\n15 tables"]
            Redis["Redis Cache\n<i>ICacheService</i>"]
            FileStor["File Storage\n<i>IFileStore</i>"]
        end

        subgraph BS_Intelligence["Intelligence Services"]
            direction TB
            AIML["AI/ML Engine\n<i>IMLService</i>\nRandom Forest\nIsolation Forest\nSHAP"]
            ChatbotSvc["Chatbot Service\n<i>IChatbotService</i>"]
        end

        subgraph BS_Realtime["Realtime Services"]
            direction TB
            EventLsnr["Event Listener\n<i>IEventSync</i>"]
            WSSvc["WebSocket\n<i>IWebSocket</i>"]
            IncomeSvc["Income Proof\n<i>IIncomeService</i>"]
        end

        FastAPI --> Postgres
        FastAPI --> Redis
        FastAPI --> AIML
        FastAPI --> ChatbotSvc
        FastAPI --> IncomeSvc
        IncomeSvc --> FileStor
        EventLsnr --> Postgres
    end

    subgraph EXT[" EXTERNAL SERVICES"]
        direction TB
        MetaMask["MetaMask\n<i>IWalletAuth</i>"]
        Polygon["Polygon PoS\n<i>IConsensus</i>"]
        Alchemy["Alchemy RPC\n<i>IRPC</i>"]
        CoinGecko["CoinGecko API\n<i>IMarketData</i>"]
    end


    Dashboard -->|"read stats"| SCL
    LoanModule -->|"loan ops"| SCL
    AdminPanel -->|"admin ops"| SCL
    RiskDash -->|"risk queries"| SCL

    LoanModule -->|"REST"| FastAPI
    AdminPanel -->|"REST"| FastAPI
    RiskDash -->|"REST"| FastAPI
    ProfileMod -->|"REST"| FastAPI
    ChatbotUI -->|"REST"| FastAPI
    ChatModule -->|"ws://"| WSSvc
    MarketMod -->|"cached"| Redis

    WalletProv -->|"connect"| MetaMask
    WalletProv -->|"RPC"| Alchemy

    SC_Contracts -->|"deploy/tx"| Polygon
    SC_Contracts -->|"RPC"| Alchemy

    EventLsnr -->|"events"| Alchemy
    Redis -->|"price feed"| CoinGecko

    EventLsnr -->|"listen"| SCL

    style PL fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000
    style PL_Core fill:#bbdefb,stroke:#1976d2,stroke-width:1px,color:#000
    style PL_Features fill:#bbdefb,stroke:#1976d2,stroke-width:1px,color:#000
    style PL_Utility fill:#bbdefb,stroke:#1976d2,stroke-width:1px,color:#000

    style SCL fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    style SC_Contracts fill:#ffe0b2,stroke:#ef6c00,stroke-width:1px,color:#000
    style SC_Libs fill:#ffe0b2,stroke:#ef6c00,stroke-width:1px,color:#000

    style BSL fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    style BS_API fill:#c8e6c9,stroke:#388e3c,stroke-width:1px,color:#000
    style BS_Data fill:#c8e6c9,stroke:#388e3c,stroke-width:1px,color:#000
    style BS_Intelligence fill:#c8e6c9,stroke:#388e3c,stroke-width:1px,color:#000
    style BS_Realtime fill:#c8e6c9,stroke:#388e3c,stroke-width:1px,color:#000

    style EXT fill:#fce4ec,stroke:#c62828,stroke-width:2px,color:#000
    style WBReserveOps fill:#fff8e1,stroke:#ef6c00,stroke-width:1px,color:#000
    style NatBankOps fill:#fff8e1,stroke:#ef6c00,stroke-width:1px,color:#000
    style LocBankOps fill:#fff8e1,stroke:#ef6c00,stroke-width:1px,color:#000
```


## Use Case Diagram

- **Rendered PNG:** `Diagrams/mermaid-pdf/usecase-diagram.png`
- **Mermaid archive:** `Diagrams/mermaid-src/usecase-diagram.mmd`

```mermaid
flowchart LR
    subgraph ACTORS[Actors]
        direction TB
        Borrower[Borrower]
        Approver[Bank approver]
        WBAdmin[WB admin]
        NatBank[National bank]
    end

    subgraph BORROWER_UC[Borrower use cases]
        direction TB
        UC01[Connect wallet]
        UC02[Accept terms]
        UC03[Manage profile]
        UC04[Request loan]
        UC04a[Check limit]
        UC04b[Upload proof]
        UC05[View loans]
        UC06[Pay installment]
        UC11[Deposit reserve]
        UC12[View limit]
        UC13[Market data]
        UC14[QR code]
        UC15[Chat bank]
        UC16[Chat borrower]
        UC17[AI chatbot]
        UC17a[Query loan]
    end

    subgraph BANK_UC[Bank and admin use cases]
        direction TB
        UC07[Review loan]
        UC07a[Fraud scores]
        UC07b[XAI view]
        UC08[Approve loan]
        UC09[Reject loan]
        UC10[Review proof]
        UC18[Risk dashboard]
        UC19[Anomaly alerts]
        UC20[Register nat. bank]
        UC21[Lend to nat. bank]
        UC22[Statistics]
        UC23[Pause system]
        UC24[Emergency withdraw]
        UC25[Security logs]
        UC26[Register local bank]
        UC27[Borrow from WB]
        UC28[Lend to local bank]
        UC29[Set approver]
        UC30[Add bank user]
        UC31[Local portfolio]
    end

    UC04 -.->|include| UC04a
    UC04 -.->|include| UC04b
    UC07 -.->|include| UC07a
    UC07 -.->|include| UC07b
    UC15 -.->|extend| UC16
    UC17 -.->|include| UC17a
    UC04 -.->|include| UC01
    UC06 -.->|include| UC01
    UC11 -.->|include| UC01
    UC15 -.->|include| UC01
    UC17 -.->|include| UC01
    UC06 -.->|include| UC12
    UC08 -.->|include| UC07
    UC09 -.->|include| UC07
    UC08 -.->|include| UC10
    UC28 -.->|include| UC27

    Borrower --> UC01
    Borrower --> UC02
    Borrower --> UC03
    Borrower --> UC04
    Borrower --> UC05
    Borrower --> UC06
    Borrower --> UC11
    Borrower --> UC12
    Borrower --> UC13
    Borrower --> UC14
    Borrower --> UC15
    Borrower --> UC17

    Approver --> UC01
    Approver --> UC02
    Approver --> UC03
    Approver --> UC07
    Approver --> UC08
    Approver --> UC09
    Approver --> UC10
    Approver --> UC12
    Approver --> UC13
    Approver --> UC16
    Approver --> UC18
    Approver --> UC19

    WBAdmin --> UC01
    WBAdmin --> UC02
    WBAdmin --> UC03
    WBAdmin --> UC20
    WBAdmin --> UC21
    WBAdmin --> UC22
    WBAdmin --> UC23
    WBAdmin --> UC24
    WBAdmin --> UC25
    WBAdmin --> UC18
    WBAdmin --> UC19
    WBAdmin --> UC13

    NatBank --> UC01
    NatBank --> UC02
    NatBank --> UC03
    NatBank --> UC26
    NatBank --> UC27
    NatBank --> UC28
    NatBank --> UC29
    NatBank --> UC30
    NatBank --> UC31
    NatBank --> UC18
    NatBank --> UC19
    NatBank --> UC12
    NatBank --> UC13
```


## Activity — Loan Request to Repayment

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-loan-request.png`
- **Mermaid archive:** `Diagrams/mermaid-src/activity-loan-request.mmd`

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


## Activity — Hierarchical Banking

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-hierarchical-banking.png`
- **Mermaid archive:** `Diagrams/mermaid-src/activity-hierarchical-banking.mmd`

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


## Activity — Income Verification

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-income-verification.png`
- **Mermaid archive:** `Diagrams/mermaid-src/activity-income-verification.mmd`

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


## Activity — Chat System

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-chat-system.png`
- **Mermaid archive:** `Diagrams/mermaid-src/activity-chat-system.mmd`

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


## Activity — AI Chatbot

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-ai-chatbot.png`
- **Mermaid archive:** `Diagrams/mermaid-src/activity-ai-chatbot.mmd`

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


## Activity — Market Data Viewing

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-market-data.png`
- **Mermaid archive:** `Diagrams/mermaid-src/activity-market-data.mmd`

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


## Activity — Profile Management

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-profile-management.png`
- **Mermaid archive:** `Diagrams/mermaid-src/activity-profile-management.mmd`

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


## DFD Context (Level 0)

- **Rendered PNG:** `Diagrams/mermaid-pdf/dfd-context.png`
- **Mermaid archive:** `Diagrams/mermaid-src/dfd-context.mmd`

```mermaid
flowchart TD
    Borrower[Borrower]
    BankApprover[Bank Approver]
    WorldBankAdmin[World Bank Admin]
    NationalBank[National Bank]
    Polygon[Polygon Blockchain Network]
    CoinGecko["CoinGecko API (Market Data)"]
    System("CRYPTO WORLD BANK SYSTEM")

    Borrower -->|"Loan Request, Deposit,\nInstallment Payment"| System
    System -->|"Loan Status, Funds,\nBorrowing Limit, Market Data"| Borrower

    System -->|"Signed Transactions"| Polygon
    Polygon -->|"Confirmed Events"| System

    System -->|"Approve/Reject, Risk Scores,\nLoan Portfolio"| BankApprover
    BankApprover -->|"Pending Loans,\nAI Recommendations"| System

    WorldBankAdmin <-->|"Register Banks, Lend to\nNational Banks, System Controls"| System
    NationalBank <-->|"Register Local Banks,\nBorrow/Lend"| System

    CoinGecko -->|"Market Price Data"| System
```


## DFD Level 1 Part 1

- **Rendered PNG:** `Diagrams/mermaid-pdf/dfd-level1-part1.png`
- **Mermaid archive:** `Diagrams/mermaid-src/dfd-level1-part1.mmd`

```mermaid
flowchart TD
    subgraph ext["External Entities"]
        direction LR
        Borrower[Borrower]
        BankApprover[Bank Approver]
        WorldBankAdmin[World Bank Admin]
        NationalBank[National Bank]
        CoinGeckoAPI[CoinGecko API]
    end

    subgraph core["Core Loan Processing"]
        P1("1.0 Process Loan Request")
        P2("2.0 Manage Loan Lifecycle")
        P3("3.0 AI/ML Risk Assessment")
        P4("4.0 Execute Blockchain Transaction")
        P5("5.0 Synchronize Event Data")
    end

    subgraph support["Supporting Services"]
        P6("6.0 Calculate Borrowing Limits")
        P7("7.0 Fetch &amp; Cache Market Data")
        P8("8.0 Manage Bank Hierarchy &amp; System Controls")
    end

    subgraph datastores["Data Stores"]
        D1[(D1: LOAN_REQUEST)]
        D2[(D2: TRANSACTION)]
        D3[(D3: AI_ML_SECURITY_LOG)]
        D4[(D4: BORROWING_LIMIT)]
        D5[(D5: BORROWER)]
        D10[(D10: MARKET_DATA)]
        D11[(D11: INSTALLMENT)]
    end

    Borrower -->|"Amount, Purpose,\nWallet Address"| P1
    P1 -->|"Loan Data"| P2
    P2 -->|"Validation Result"| P1
    P2 -->|"Risk Query"| P3
    P3 -->|"Risk Score +\nSHAP Features"| P2
    P1 -->|"Signed Transaction"| P4
    P2 -->|"Installment Data"| D11
    P2 -->|"Pending Loans +\nRisk Scores"| BankApprover
    BankApprover -->|"Approval/Rejection"| P4

    P4 -->|"Transaction Events"| P5
    P5 -->|"Loan Record"| D1
    P5 -->|"Transaction Log"| D2
    P5 -->|"Security Log"| D3
    P5 --> P6

    P6 -->|"Limit Data"| D4
    D4 -->|"History Data"| P6

    CoinGeckoAPI -->|"Price Data"| P7
    P7 -->|"Market Prices"| Borrower
    P7 -->|"Cached Price Data"| D10

    WorldBankAdmin -->|"Register Banks, Lend,\nPause/Unpause"| P8
    NationalBank -->|"Register Local,\nBorrow, Lend"| P8

    D1 -.->|"loan context"| P2
    D5 -.->|"borrower identity"| P1
```


## DFD Level 1 Part 2

- **Rendered PNG:** `Diagrams/mermaid-pdf/dfd-level1-part2.png`
- **Mermaid archive:** `Diagrams/mermaid-src/dfd-level1-part2.mmd`

```mermaid
flowchart TD
    subgraph ext["External Entities"]
        direction LR
        Borrower[Borrower]
        BankApprover[Bank Approver]
    end

    subgraph extended["Extended Services"]
        P9("9.0 Process Income Verification")
        P10("10.0 Manage Chat Communication")
        P11("11.0 AI Chatbot Service")
        P12("12.0 Manage User Profiles")
    end

    subgraph datastores["Data Stores"]
        D1[(D1: LOAN_REQUEST)]
        D4[(D4: BORROWING_LIMIT)]
        D5[(D5: BORROWER)]
        D6[(D6: CHAT_MESSAGE)]
        D7[(D7: INCOME_PROOF)]
        D8[(D8: AI_CHATBOT_LOG)]
        D9[(D9: PROFILE_SETTINGS)]
    end

    Borrower -->|"Income Proof Documents"| P9
    P9 -->|"Verification Status"| Borrower
    P9 -->|"Hashed Document"| D7
    D7 -->|"Proof Status"| P9
    P9 -->|"Borrower Proof Link"| D5
    BankApprover -->|"Review Income Proofs"| P9
    P9 -->|"Pending Proofs"| BankApprover

    Borrower -->|"Send Message"| P10
    P10 -->|"Receive Message,\nRead Status"| Borrower
    P10 -->|"Store Message"| D6
    D6 -->|"Read Messages"| P10
    P10 -->|"Loan Context Query"| D1

    Borrower -->|"Chatbot Questions"| P11
    P11 -->|"AI Responses"| Borrower
    P11 -->|"Interaction Log"| D8
    D8 -->|"Read Log History"| P11
    P11 -->|"Limit Query"| D4
    P11 -->|"Loan Data Query"| D1

    Borrower -->|"Profile Updates"| P12
    P12 -->|"Profile Data,\nPreferences"| Borrower
    P12 -->|"Settings Data"| D9
    D9 -->|"Read Settings"| P12
    P12 -->|"Profile Link"| D5
    BankApprover -->|"Profile Updates"| P12
    P12 -->|"Profile Data"| BankApprover
```


## Sequence 1 — Loan Approval

- **Rendered PNG:** `Diagrams/mermaid-pdf/sequence-loan-approval.png`
- **Mermaid archive:** `Diagrams/mermaid-src/sequence-loan-approval.mmd`

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

    Note over LB: 13. require(amount > 0)\n14. require(purpose != "")\n15. require(amount <= totalReserve)
    Note over LB: 16. loanCounter++\n17. Store Loan(id, borrower, amount,\npurpose, Pending, now, 0)\n18. userLoans[sender].push(loanId)

    LB->>PP: 19. emit LoanRequested(loanId, borrower, amount, purpose)
    Note over PP: 20. Block validated (~2 sec)
    PP-->>F: 21. Tx confirmed — hash: 0xabc...
    F-->>B: 22. Loan Requested Successfully!

    PP->>BA: 23. Event listener detects event
    Note over BA: 24. INSERT INTO LOAN_REQUEST (off-chain DB)
    BA->>AI: 25. Trigger AI/ML risk assessment

    Note over AI: 26. Extract features:\n- loan amount\n- borrower history\n- wallet age\n- tx frequency
    Note over AI: 27. Random Forest predict(features)\nfraud_score: 0.12
    Note over AI: 28. SHAP explain(prediction)\ntop features returned
    Note over AI: 29. Isolation Forest\nanomaly_score: -0.3

    AI-->>BA: 30. Return: fraud_score: 0.12, anomaly: normal, shap_features
    Note over BA: 31. INSERT INTO AI_ML_SECURITY_LOG

    Note over AU: 32. Approver opens pending loans page
    AU->>BA: 33. GET /loans/pending + risk scores
    BA-->>AU: 34. Return loan list with risk data
    Note over AU: 35. Display: Loan #5: 50 ETH\nRisk: LOW (0.12)\nSHAP: amount down, history up

    alt Approve
        AU->>AW: 36. Click Approve
        Note over AW: 37. Sign approveLoan(5)
        AW->>LB: approveLoan(5)

        Note over LB: 38. require(onlyApprover)\n39. require(status == Pending)\n40. require(balance >= amount)
        Note over LB: 41. loan.status = Approved\n42. loan.approvedAt = block.timestamp\n43. totalReserve -= loan.amount\n44. Transfer 50 ETH to borrower via call

        LB-->>B: 45. 50 ETH received in wallet
        LB->>PP: 46. emit LoanApproved(5, borrower, 50)
        PP->>BA: 47. Event listener detects event
        Note over BA: 48. UPDATE LOAN_REQUEST status = approved\n49. INSERT INTO TRANSACTION\n50. UPDATE BORROWING_LIMIT

    else Reject
        AU->>AW: 36b. Click Reject — reason: High fraud risk
        Note over AW: 37b. Sign rejectLoan(5, High fraud risk)
        AW->>LB: rejectLoan(5, High fraud risk)

        Note over LB: 38b. require(onlyApprover)\n39b. require(status == Pending)\n40b. loan.status = Rejected\n41b. loan.rejectedAt = block.timestamp

        LB->>PP: 42b. emit LoanRejected(5, borrower, 50, High fraud risk)
        PP->>BA: 43b. Event listener detects event
        Note over BA: 44b. UPDATE LOAN_REQUEST\nstatus = rejected\nrejected_reason = High fraud risk
        BA->>F: 45b. Push notification
        F-->>B: 46b. Display: Loan #5 Rejected — Reason: High fraud risk
    end
```


## Sequence 1B — Reject Path

- **Rendered PNG:** `Diagrams/mermaid-pdf/sequence-reject-path.png`
- **Mermaid archive:** `Diagrams/mermaid-src/sequence-reject-path.mmd`

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

    Note over LB: 38b. require(onlyApprover)\n39b. require(status == Pending)
    Note over LB: 40b. loan.status = Rejected\n41b. loan.rejectedAt = block.timestamp

    LB->>PP: 42b. emit LoanRejected(5, borrower, 50, High fraud risk)
    PP->>BA: 43b. Event listener detects event

    Note over BA: 44b. UPDATE LOAN_REQUEST\nstatus = rejected\nrejected_reason = High fraud risk

    BA->>FB: 45b. Push notification
    Note over FB: 46b. Display:\nLoan #5 Rejected\nReason: High fraud risk
```


## Sequence 2 — Installment Loop

- **Rendered PNG:** `Diagrams/mermaid-pdf/sequence-installment.png`
- **Mermaid archive:** `Diagrams/mermaid-src/sequence-installment.mmd`

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

        Note over LB: 11. require(installment exists\nand status = pending)\n12. require(msg.value ==\ninstallmentAmount)
        Note over LB: 13. Mark installment as paid\n14. totalRepaid += amount

        LB->>PP: 15. emit InstallmentPaid(loanId, number, amount)
        PP->>BA: 16. Event listener detects event
        Note over BA: 17. UPDATE INSTALLMENT status = paid\n18. INSERT INTO TRANSACTION

        PP-->>F: 19. Tx confirmed
        F-->>B: 20. Installment Paid! Progress: X of Y

        opt All installments paid
            Note over LB: 21. loan.status = Repaid
            LB->>PP: 22. emit LoanFullyRepaid(loanId, borrower)
            PP->>BA: 23. Event detected
            Note over BA: 23. UPDATE LOAN_REQUEST status = repaid\n24. UPDATE BORROWING_LIMIT (increase)
            F-->>B: 25. Loan Fully Repaid!
        end
    end
```


## Sequence 3 — Income Verification

- **Rendered PNG:** `Diagrams/mermaid-pdf/sequence-income-verification.png`
- **Mermaid archive:** `Diagrams/mermaid-src/sequence-income-verification.mmd`

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
    Note over F: 8. Client-side validation\n(type, size <= 5MB)
    F->>API: 9. POST /income-proof/upload (file, borrower_id)

    Note over API: 10. Server-side validation\n+ SHA-256 hash
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


## Sequence 4 — Chat System

- **Rendered PNG:** `Diagrams/mermaid-pdf/sequence-chat-system.png`
- **Mermaid archive:** `Diagrams/mermaid-src/sequence-chat-system.mmd`

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


## Sequence 5 — AI Chatbot

- **Rendered PNG:** `Diagrams/mermaid-pdf/sequence-ai-chatbot.png`
- **Mermaid archive:** `Diagrams/mermaid-src/sequence-ai-chatbot.mmd`

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

    Note over NLP: 10. Classify intent\n(loan_limit / payment_due /\nbank_info / general)
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


## Sequence 6 — Hierarchical Banking

- **Rendered PNG:** `Diagrams/mermaid-pdf/sequence-hierarchical-banking.png`
- **Mermaid archive:** `Diagrams/mermaid-src/sequence-hierarchical-banking.mmd`

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


## Sequence 7 — Market Data

- **Rendered PNG:** `Diagrams/mermaid-pdf/sequence-market-data.png`
- **Mermaid archive:** `Diagrams/mermaid-src/sequence-market-data.mmd`

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
    Note over F: 15. Render Chart.js line chart\n(tooltips, time range)
    F-->>B: 16. Display interactive chart

    loop Auto-refresh every 5 minutes
        F->>API: 17. GET /market-data/prices (polling)
        Note over API: Cache / fetch cycle repeats as above
        API-->>F: 18. Return updated prices
        F-->>B: 19. Re-render price cards
    end
```


## Sequence 8 — Borrowing Limit

- **Rendered PNG:** `Diagrams/mermaid-pdf/sequence-borrowing-limit.png`
- **Mermaid archive:** `Diagrams/mermaid-src/sequence-borrowing-limit.mmd`

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
    Note over BLE: 16. Final limit =\nmin(6mo, 12mo) x loyalty x availability

    BLE->>DB: 17. UPSERT BORROWING_LIMIT
    DB-->>BLE: 18. Confirm update
    BLE-->>API: 19. Return calculated limit
    API-->>S: 20. Return limit result
```


---

## Part 2 — Thesis extensions (Ch.1–5, AI, blockchain, planned banking)

_Sections below mirror `new-diagrams-build.md`._

## Financial Inclusion Gap

- **Rendered PNG:** `Diagrams/mermaid-pdf/financial-inclusion-gap.png`

```mermaid
mindmap
  root((Global Financial Exclusion))
    Unbanked Population
      1.4 billion adults
      Developing economies
      Documentation barriers
    Remittance Fee Drain
      860B USD annual market
      48-56B lost to fees yearly
      6.49 pct avg cost
    SME Financing Gap
      4.5 trillion USD gap
      16 jobs per 1M USD lent
    Correspondent Banking
      Nostro capital trapped
      42 USD avg transaction
      2-5 day settlement
```

---

## Flat vs Hierarchical Architecture

- **Rendered PNG:** `Diagrams/mermaid-pdf/flat-vs-hierarchical.png`

```mermaid
graph TB
    subgraph FLAT["EXISTING DeFi - Flat Pool"]
        direction TB
        LP1["Lender A\n10K USD"] --> POOL["Single Liquidity Pool\n26.3B TVL"]
        LP2["Lender B\n500K USD"] --> POOL
        LP3["Lender C\n50M USD"] --> POOL
        POOL --> BR1["Borrower X\nRetail"]
        POOL --> BR2["Borrower Y\nInstitutional"]
        POOL --> BR3["Borrower Z\nDAO"]
    end
    subgraph HIER["CRYPTO WORLD BANK - Multi-Tier"]
        direction TB
        WB["World Bank Reserve"] -->|"3 pct APR"| NB1["National Bank A"]
        WB -->|"3 pct APR"| NB2["National Bank B"]
        NB1 -->|"5 pct APR"| LB1["Local Bank 1"]
        NB1 -->|"5 pct APR"| LB2["Local Bank 2"]
        NB2 -->|"5 pct APR"| LB3["Local Bank 3"]
        LB1 -->|"8 pct APR"| U1["Individual"]
        LB1 -->|"8 pct APR"| U2["SME"]
        LB2 -->|"8 pct APR"| U3["Micro-enterprise"]
        NB1 <-->|"Same-tier"| NB2
        LB1 <-->|"Same-tier"| LB2
        LB1 -.->|"Upward surplus"| NB1
    end
    style FLAT fill:#FEE2E2,stroke:#DC2626,stroke-width:2px
    style HIER fill:#DCFCE7,stroke:#16A34A,stroke-width:2px
    style POOL fill:#FECACA,stroke:#EF4444
    style WB fill:#1E40AF,color:#fff,stroke:#1E3A8A,stroke-width:2px
    style NB1 fill:#2563EB,color:#fff
    style NB2 fill:#2563EB,color:#fff
    style LB1 fill:#3B82F6,color:#fff
    style LB2 fill:#3B82F6,color:#fff
    style LB3 fill:#3B82F6,color:#fff
```

---

## Cross-Tier Lending Flow

- **Rendered PNG:** `Diagrams/mermaid-pdf/cross-tier-flow.png`

```mermaid
graph TB
    WB["WORLD BANK\nGlobal Reserve"]
    NB1["National Bank A"]
    NB2["National Bank B"]
    NB3["National Bank C"]
    LB1["Local Bank 1"]
    LB2["Local Bank 2"]
    LB3["Local Bank 3"]
    LB4["Local Bank 4"]
    U1["Individual\n0.01-10 ETH"]
    U2["SME\n1-100 ETH"]
    U3["Corporate\n50-10K ETH"]
    U4["Institutional\n1000+ ETH"]
    WB ==>|"3 pct Down"| NB1
    WB ==>|"3 pct Down"| NB2
    WB ==>|"3 pct Down"| NB3
    NB1 ==>|"5 pct"| LB1
    NB1 ==>|"5 pct"| LB2
    NB2 ==>|"5 pct"| LB3
    NB3 ==>|"5 pct"| LB4
    LB1 ==>|"8 pct"| U1
    LB1 ==>|"8 pct"| U2
    LB3 ==>|"8 pct"| U2
    LB2 -.->|"Surplus up"| NB1
    NB3 -.->|"Surplus up"| WB
    NB1 <-..->|"Interbank"| NB2
    NB2 <-..->|"Interbank"| NB3
    LB1 <-..->|"Peer pool"| LB2
    NB2 ==>|"Direct"| U3
    WB ==>|"Direct"| U4
    style WB fill:#1E3A8A,color:#fff,stroke-width:3px
    style NB1 fill:#1D4ED8,color:#fff
    style NB2 fill:#1D4ED8,color:#fff
    style NB3 fill:#1D4ED8,color:#fff
    style LB1 fill:#3B82F6,color:#fff
    style LB2 fill:#3B82F6,color:#fff
    style LB3 fill:#3B82F6,color:#fff
    style LB4 fill:#3B82F6,color:#fff
    style U1 fill:#DBEAFE,stroke:#3B82F6
    style U2 fill:#DBEAFE,stroke:#3B82F6
    style U3 fill:#DBEAFE,stroke:#3B82F6
    style U4 fill:#DBEAFE,stroke:#3B82F6
```

---

## Borrower Tier Access

- **Rendered PNG:** `Diagrams/mermaid-pdf/borrower-tier-access.png`

```mermaid
graph TD
    WB["WORLD BANK\nTier 1"] --- T1["Institutional / Sovereign\n1000+ ETH"]
    NB["NATIONAL BANKS\nTier 2"] --- T2["Large Corporate\n50-10000 ETH"]
    LB["LOCAL BANKS\nTier 3"] --- T3["Individual and SME\n0.01-100 ETH"]
    T1 -.->|"may also use"| NB
    T2 -.->|"may also use"| LB
    style WB fill:#1E3A8A,color:#fff,stroke-width:3px
    style NB fill:#2563EB,color:#fff,stroke-width:2px
    style LB fill:#3B82F6,color:#fff,stroke-width:2px
    style T1 fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px
    style T2 fill:#FEF3C7,stroke:#D97706,stroke-width:2px
    style T3 fill:#DCFCE7,stroke:#16A34A,stroke-width:2px
```

---

## Correspondent vs On-Chain Settlement

- **Rendered PNG:** `Diagrams/mermaid-pdf/correspondent-vs-onchain.png`

```mermaid
graph LR
    subgraph TRAD["TRADITIONAL CORRESPONDENT BANKING"]
        direction LR
        SA["Sender Bank"] -->|"MT103 SWIFT"| CB1["Correspondent 1"]
        CB1 -->|"Compliance"| CB2["Correspondent 2"]
        CB2 -->|"FX"| CB3["Correspondent 3"]
        CB3 -->|"Nostro credit"| RB["Receiver Bank"]
        T1["2-5 days settlement"]
        T2["~42 USD per tx"]
        T3["Capital in nostro"]
    end
    subgraph CWB["CWB ON-CHAIN SETTLEMENT"]
        direction LR
        S2["Sender Local Bank"] -->|"Smart contract"| BC["Polygon L2"]
        BC -->|"State update"| R2["Receiver Local Bank"]
        T4["~2 sec finality"]
        T5["under 0.01 USD"]
        T6["No pre-funding"]
    end
    style TRAD fill:#FEF3C7,stroke:#D97706,stroke-width:2px
    style CWB fill:#DCFCE7,stroke:#16A34A,stroke-width:2px
    style SA fill:#FDE68A,stroke:#F59E0B
    style CB1 fill:#FDE68A,stroke:#F59E0B
    style CB2 fill:#FDE68A,stroke:#F59E0B
    style CB3 fill:#FDE68A,stroke:#F59E0B
    style RB fill:#FDE68A,stroke:#F59E0B
    style S2 fill:#86EFAC,stroke:#22C55E
    style BC fill:#86EFAC,stroke:#22C55E
    style R2 fill:#86EFAC,stroke:#22C55E
```

---

## Monetary Policy Comparison

- **Rendered PNG:** `Diagrams/mermaid-pdf/monetary-policy-comparison.png`

```mermaid
graph TD
    subgraph TRAD["TRADITIONAL - Cantillon Effect"]
        direction TB
        CB["Central Bank"] -->|"First access"| BANKS["Banks and Funds"]
        BANKS -->|"Second"| CORP["Large Corporations"]
        CORP -->|"Third"| SME2["Small Business"]
        SME2 -->|"Last"| PEOPLE["General Population"]
        NOTE1["Top 1 pct holds 32 pct wealth"]
        NOTE2["800B USD/year from developing economies"]
    end
    subgraph CWB2["CWB - Transparent Algorithmic"]
        direction TB
        WBR["World Bank Reserve"] -->|"3 pct visible"| NBR["National Banks"]
        NBR -->|"5 pct visible"| LBR["Local Banks"]
        LBR -->|"8 pct visible"| PPL["All Borrowers Same Rules"]
        NOTE3["Rates on-chain auditable"]
        NOTE4["No hidden fees"]
    end
    style TRAD fill:#FEF2F2,stroke:#DC2626,stroke-width:2px
    style CWB2 fill:#F0FDF4,stroke:#16A34A,stroke-width:2px
    style WBR fill:#166534,color:#fff
    style NBR fill:#16A34A,color:#fff
    style LBR fill:#4ADE80,stroke:#22C55E
    style PPL fill:#DCFCE7,stroke:#86EFAC
```

---

## Institutional Adoption Timeline

- **Rendered PNG:** `Diagrams/mermaid-pdf/institutional-adoption-timeline.png`

```mermaid
timeline
    title Institutional Blockchain Adoption
    2020 : JPMorgan Onyx Kinexys
         : Aave v2 1B TVL
    2021 : R3 Corda 5B RWAs
         : Maple institutional lending
         : Goldfinch 10+ countries
    2022 : DeFi lending TVL 50B+
         : MakerDAO RWA integration
    2023 : Celo MiniPay Africa
         : Morpho Blue primitive
    2024 : Ripple RLUSD NYDFS
         : Sky Protocol rebrand
         : Centrifuge v3 eight chains
    2025 : World Bank FundsChain
         : R3 Corda 17B RWAs
         : Kinexys 3B daily volume
         : DeFi TVL 55B+
    2026 : CWB prototype deployed
         : BRICS mBridge pilots
```

---

## AI/ML Security Pipeline

- **Rendered PNG:** `Diagrams/mermaid-pdf/aiml-security-pipeline.png`

```mermaid
graph LR
    TX["On-Chain Tx"] -->|"Event"| EL["Event Listener"]
    EL --> FE["Feature Engineering\n50+ features"]
    FE --> RF["Random Forest\nFraud F1 0.76-0.85"]
    FE --> IF["Isolation Forest\nAnomaly detect"]
    RF --> SHAP["SHAP Explain"]
    IF --> SHAP
    SHAP --> SCORE["Risk Score 0-100"]
    SCORE -->|"under 30"| APPROVE["Auto-Approve"]
    SCORE -->|"30-70"| REVIEW["Human Review"]
    SCORE -->|"over 70"| FLAG["Auto-Flag"]
    APPROVE --> SC["Smart Contract"]
    REVIEW --> SC
    style TX fill:#DBEAFE,stroke:#3B82F6
    style RF fill:#4ADE80,stroke:#16A34A,color:#000
    style IF fill:#FBBF24,stroke:#D97706,color:#000
    style SHAP fill:#A78BFA,stroke:#7C3AED,color:#fff
    style SCORE fill:#1E3A8A,color:#fff,stroke-width:2px
    style APPROVE fill:#DCFCE7,stroke:#16A34A
    style REVIEW fill:#FEF3C7,stroke:#D97706
    style FLAG fill:#FEE2E2,stroke:#DC2626
    style SC fill:#2563EB,color:#fff
```

---

## Market Sizing Funnel

- **Rendered PNG:** `Diagrams/mermaid-pdf/market-sizing-funnel.png`

```mermaid
graph TD
    TAM["TAM: 55B - 5T+\nDeFi TVL 55B+\nRemittances 860B\nSME gap 4.5T"]
    SAM["SAM: 5-15B\nInstitutional hierarchical lending\nEmerging-market credit"]
    SOM["SOM: 50-200M\nSandboxes and pilots\nNGO microfinance"]
    TAM --> SAM --> SOM
    style TAM fill:#1E3A8A,color:#fff,stroke-width:2px
    style SAM fill:#2563EB,color:#fff,stroke-width:2px
    style SOM fill:#3B82F6,color:#fff,stroke-width:2px
```

---

## DeFi TVL Comparison

- **Rendered PNG:** `Diagrams/mermaid-pdf/defi-tvl-comparison.png`

```mermaid
xychart-beta
    title "DeFi Lending TVL - March 2026 (USD Billions)"
    x-axis ["Aave", "Morpho", "Maker", "Spark", "Maple", "Compound", "Centrifuge", "Euler", "TrueFi"]
    y-axis "TVL (B USD)" 0 --> 28
    bar [26.3, 6.8, 6.0, 3.6, 3.0, 1.4, 1.0, 0.8, 0.1]
```

---

## Competitive Feature Matrix

- **Rendered PNG:** `Diagrams/mermaid-pdf/competitive-feature-matrix.png`

```mermaid
block-beta
    columns 8
    space:1 A["Aave"] B["Compound"] C["Maple"] D["Goldfinch"] E["Ripple"] F["Celo"] G["CWB"]
    H1["Hierarchical"]:1
    A1["No"]:1 B1["No"]:1 C1["No"]:1 D1["No"]:1 E1["No"]:1 F1["No"]:1 G1["Yes"]:1
    H2["Cross-Tier"]:1
    A2["No"]:1 B2["No"]:1 C2["No"]:1 D2["No"]:1 E2["No"]:1 F2["No"]:1 G2["Yes"]:1
    H3["On-Chain Lending"]:1
    A3["Yes"]:1 B3["Yes"]:1 C3["Yes"]:1 D3["Part"]:1 E3["No"]:1 F3["No"]:1 G3["Yes"]:1
    H4["ML Fraud"]:1
    A4["No"]:1 B4["No"]:1 C4["No"]:1 D4["No"]:1 E4["No"]:1 F4["No"]:1 G4["Yes"]:1
    H5["Inclusion"]:1
    A5["No"]:1 B5["No"]:1 C5["No"]:1 D5["Yes"]:1 E5["No"]:1 F5["Yes"]:1 G5["Yes"]:1
    H6["Cross-Border"]:1
    A6["Part"]:1 B6["No"]:1 C6["No"]:1 D6["No"]:1 E6["Yes"]:1 F6["Yes"]:1 G6["Yes"]:1
    H7["Stablecoin"]:1
    A7["No"]:1 B7["No"]:1 C7["No"]:1 D7["No"]:1 E7["RLUSD"]:1 F7["cUSD"]:1 G7["Planned"]:1
    H8["Open Source"]:1
    A8["Yes"]:1 B8["Yes"]:1 C8["Yes"]:1 D8["Yes"]:1 E8["Part"]:1 F8["Yes"]:1 G8["Yes"]:1
    style G1 fill:#16A34A,color:#fff
    style G2 fill:#16A34A,color:#fff
    style G3 fill:#16A34A,color:#fff
    style G4 fill:#16A34A,color:#fff
    style G5 fill:#16A34A,color:#fff
    style G6 fill:#16A34A,color:#fff
    style G7 fill:#16A34A,color:#fff
    style G8 fill:#16A34A,color:#fff
```

---

## Competitor Quadrant Chart

- **Rendered PNG:** `Diagrams/mermaid-pdf/competitor-quadrant.png`

```mermaid
quadrantChart
    title Competitor Positioning
    x-axis "Retail Users" --> "Institutional"
    y-axis "Flat Single-Tier" --> "Hierarchical Multi-Tier"
    quadrant-1 "Hierarchical Institutional"
    quadrant-2 "Hierarchical Retail"
    quadrant-3 "Flat Retail"
    quadrant-4 "Flat Institutional"
    Aave: [0.35, 0.15]
    Compound: [0.30, 0.10]
    MakerDAO: [0.40, 0.20]
    Morpho: [0.45, 0.18]
    Celo: [0.15, 0.12]
    Goldfinch: [0.65, 0.25]
    Maple: [0.80, 0.20]
    Ripple: [0.85, 0.30]
    Kinexys: [0.90, 0.35]
    FundsChain: [0.92, 0.70]
    Crypto World Bank: [0.50, 0.85]
```

---

## Interest Rate Waterfall

- **Rendered PNG:** `Diagrams/mermaid-pdf/interest-rate-waterfall.png`

```mermaid
graph LR
    WB["World Bank\nLends 3 pct APR"] -->|"NB margin 2 pct"| NB["National Bank\nLends 5 pct"]
    NB -->|"LB margin 3 pct"| LB["Local Bank\nLends 8 pct"]
    LB -->|"Borrower pays"| BR["Borrower 8 pct"]
    WB2["Cost 0 pct"] -.-> WB
    NB2["Cost 3 pct\nMargin 2 pct"] -.-> NB
    LB2["Cost 5 pct\nMargin 3 pct"] -.-> LB
    style WB fill:#1E3A8A,color:#fff,stroke-width:2px
    style NB fill:#2563EB,color:#fff
    style LB fill:#3B82F6,color:#fff
    style BR fill:#93C5FD,stroke:#3B82F6
    style WB2 fill:#EFF6FF,stroke:#BFDBFE
    style NB2 fill:#EFF6FF,stroke:#BFDBFE
    style LB2 fill:#EFF6FF,stroke:#BFDBFE
```

---

## Go-to-Market Roadmap

- **Rendered PNG:** `Diagrams/mermaid-pdf/gtm-roadmap.png`

```mermaid
graph LR
    P1["Phase 1 VALIDATION\nCurrent\nThesis and testnet\nRevenue 0"]
    P2["Phase 2 PILOT\n6-12 months\nSandbox partners\nRevenue 1.5M ARR"]
    P3["Phase 3 PRODUCTION\n12-24 months\nMulti-chain AI/ML\nRevenue 15M ARR"]
    P4["Phase 4 SCALE\n24-48 months\n50+ banks stablecoin\nRevenue 200M ARR"]
    P1 ==> P2 ==> P3 ==> P4
    style P1 fill:#DBEAFE,stroke:#2563EB,stroke-width:2px
    style P2 fill:#BFDBFE,stroke:#1D4ED8,stroke-width:2px
    style P3 fill:#93C5FD,stroke:#1E40AF,color:#fff,stroke-width:2px
    style P4 fill:#1E3A8A,color:#fff,stroke-width:3px
```

---

## Blockchain Stack Layers

- **Rendered PNG:** `Diagrams/mermaid-pdf/blockchain-stack-layers.png`

```mermaid
graph TB
  subgraph L7 [Application Layer]
    UI[Web dApp React]
    API[Express API]
  end
  subgraph L6 [Off-chain Services]
    AI[CWB-AI-9B plus RAG]
    IDX[Event indexer]
    ORA[Oracle relay]
  end
  subgraph L5 [Smart Contracts]
    LC[LoanController]
    WR[WorldBankReserve]
    GL[GroupLendingPool planned]
  end
  subgraph L4 [Chain]
    EVM[Polygon PoS testnet]
  end
  UI --> API --> LC
  API --> AI --> ORA --> LC
  IDX --> EVM
  LC --> EVM
  WR --> EVM
  style GL stroke-dasharray:5 5
  style WR fill:#1E3A8A,color:#fff
  style LC fill:#2563EB,color:#fff
  style AI fill:#3B82F6,color:#fff
```

---

## Blockchain Transaction Lifecycle

- **Rendered PNG:** `Diagrams/mermaid-pdf/blockchain-tx-lifecycle.png`

```mermaid
sequenceDiagram
  participant B as Borrower
  participant LB as Local Bank
  participant SC as LoanController
  participant O as Oracle
  participant AI as CWB-AI-9B
  B->>SC: requestLoan
  SC->>O: riskScoreRequest
  O->>AI: features plus context
  AI-->>O: tabular score plus narrative
  O-->>SC: updateRiskScore
  LB->>SC: approveLoan
  B->>SC: repayInstallment
```

---

## AI Unified 9B Architecture

- **Rendered PNG:** `Diagrams/mermaid-pdf/ai-unified-9b-architecture.png`

```mermaid
flowchart LR
  U[User query] --> R[Task prefix]
  D[RAG corpus] --> M[9B instruct plus QLoRA]
  R --> M
  M --> C[Chat and policy]
  M --> S[Security advisory]
  M --> E[Risk explanation]
  T[Tabular features] --> RF[RF or XGB score]
  RF --> E
  ST[Slither CI] -.-> D
  style M fill:#1E3A8A,color:#fff
```

---

## AI Data Pipeline

- **Rendered PNG:** `Diagrams/mermaid-pdf/ai-data-pipeline.png`

```mermaid
flowchart TB
  A[Architecture docs] --> C[Chunk and clean]
  B[SWC security pairs] --> C
  S[Synthetic loan dialogues] --> C
  C --> J[SFT JSONL]
  C --> V[Vector index RAG]
  J --> T[QLoRA training]
  V --> I[Inference API]
  style T fill:#2563EB,color:#fff
```

---

## AI QLoRA Training Flow

- **Rendered PNG:** `Diagrams/mermaid-pdf/ai-qlora-training-flow.png`

```mermaid
flowchart LR
  B[Load 4-bit base model] --> L[Attach LoRA adapters]
  L --> TR[Train on multi-task SFT]
  TR --> M[Merge or export adapters]
  M --> D[Deploy Ollama or vLLM]
  style TR fill:#1E3A8A,color:#fff
```

---

## AI Oracle Loan Sequence

- **Rendered PNG:** `Diagrams/mermaid-pdf/ai-oracle-loan-sequence.png`

```mermaid
sequenceDiagram
  participant B as Borrower
  participant SC as LoanController
  participant O as Oracle relay
  participant ML as Tabular scorer
  participant LLM as CWB-AI-9B
  B->>SC: requestLoan
  SC->>O: scoreRequest
  O->>ML: computeRiskScore
  ML-->>O: numeric score
  O->>LLM: explainScore
  LLM-->>O: narrative
  O-->>SC: updateRiskScore
```

---

## AI Security CI Pipeline

- **Rendered PNG:** `Diagrams/mermaid-pdf/ai-security-ci-pipeline.png`

```mermaid
flowchart LR
  GIT[Git commit] --> SL[Slither static analysis]
  SL --> REP[Vulnerability report]
  REP --> RAG[Update RAG corpus]
  RAG --> LLM[9B security advisory]
  DEV[Developer] --> LLM
  style SL fill:#1E3A8A,color:#fff
```

---

## Activity Deposit Flow

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-deposit-flow.png`

```mermaid
flowchart TD
  A[Borrower opens savings] --> B[Local Bank validates KYC design]
  B --> C[Deposit to SavingsVault planned]
  C --> D[Accrue interest on-chain]
  D --> E[Statement via indexer]
  style C stroke-dasharray:5 5
```

---

## Activity Group Lending

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-group-lending.png`

```mermaid
flowchart TD
  A[Form group 3-20 borrowers] --> B[Pool collateral]
  B --> C[Multi-sig consent]
  C --> D[Submit group loan]
  D --> E{All members current?}
  E -->|Yes| F[Escalate to approver]
  E -->|No| G[Claim shared collateral planned]
  style G stroke-dasharray:5 5
```

---

## Activity FX Conversion

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-fx-conversion.png`

```mermaid
flowchart TD
  A[Loan denominated in stablecoin] --> B[Oracle price feed]
  B --> C[FXModule quote planned]
  C --> D[Borrower accepts rate]
  D --> E[Settle on-chain]
  style C stroke-dasharray:5 5
```

---

## Activity Interbank Liquidity

- **Rendered PNG:** `Diagrams/mermaid-pdf/activity-interbank-liquidity.png`

```mermaid
flowchart TD
  A[Local Bank liquidity shortfall] --> B[Request interbank pool]
  B --> C[National Bank approves]
  C --> D[Transfer via smart contract]
  D --> E[Repay with spread]
  style B stroke-dasharray:5 5
```

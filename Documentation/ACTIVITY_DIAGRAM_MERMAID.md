# Activity Diagram

## Crypto World Bank — Loan Request to Repayment Flow

---

```mermaid
flowchart TD
    A([START]) --> B[Borrower Opens DApp]
    B --> C["Connect Wallet<br>(MetaMask / WalletConnect)"]
    C --> D{Wallet Connected?}
    D -- Yes --> E["Read Wallet Address and<br>Determine Role"]
    D -- No --> F["Show Connect Wallet Error"]
    F --> END1([END])

    E --> G["Navigate to Loan Page<br>Enter Amount and Purpose"]
    G --> H{Is First-Time Borrower?}
    H -- Yes --> I[Upload Income Proof Document]
    I --> J{Income Proof Approved?}
    J -- Yes --> K["Query Borrowing Limit<br>(6-month and 1-year rolling windows)"]
    J -- No --> L["Reject: Income Not Verified"]
    L --> END2([END])
    H -- No --> K

    K --> M{Amount Within Borrowing Limit?}
    M -- Yes --> N["Prepare Transaction<br>requestLoan(amount, purpose)"]
    M -- No --> O["Reject: Limit Exceeded"]
    O --> END3([END])

    N --> P["MetaMask Prompts User<br>Display Gas Estimate"]
    P --> Q{User Confirms Transaction?}
    Q -- Yes --> R["Sign and Broadcast Transaction<br>to Polygon Network"]
    Q -- No --> S[Transaction Cancelled]
    S --> END4([END])

    R --> T["Smart Contract Validates and Executes:<br>- Check amount is positive<br>- Check purpose is not empty<br>- Check reserve balance<br>- Create Loan struct<br>- Emit LoanRequested"]
    T --> U{Transaction Successful?}
    U -- No --> V["Show Error: Tx Failed"]
    V --> END5([END])
    U -- Yes --> W["Display Success:<br>Loan Requested — Show Tx Hash"]
    W --> X["Event Listener Detects<br>LoanRequested Event<br>→ Store in Database<br>→ Trigger AI/ML Risk Assessment"]

    subgraph APPROVER["Bank Approver Swimlane"]
        Y["View Pending Loans<br>with AI Risk Scores<br>and SHAP Explanations"]
        Y --> Z{Approve or Reject?}
        Z -- Reject --> AA["Sign rejectLoan()<br>Record Reason<br>Notify Borrower"]
        AA --> END6([END])
        Z -- Approve --> AB["Sign approveLoan()<br>via Approver Wallet"]
        AB --> AC["Smart Contract:<br>- Verify approver role<br>- Verify loan pending<br>- Verify balance<br>- Transfer ETH to borrower wallet<br>- Emit LoanApproved"]
    end
    X --> Y

    AC --> AD{"Loan Amount at least 100 ETH?"}
    AD -- Yes --> AE["Generate Installment Plan<br>(N installments with due dates)"]
    AD -- No --> AF[Single Payment Due by Deadline]
    AE --> AG["Borrower Receives Funds in Wallet<br>Update Borrowing Limit<br>Update Transaction Log"]
    AF --> AG
    AG --> AH{Installment Due?}
    AH -- Yes --> AI["Pay Installment<br>via payInstallment — Sign tx"]
    AI --> AH
    AH -- Paid All --> AJ["Loan Completed<br>Update consecutive paid loans count"]
    AJ --> END7([END])
```

---

## Crypto World Bank — Income Verification Flow

```mermaid
flowchart TD
    A([START]) --> B["Borrower Registers /<br>Logs into DApp"]
    B --> C{Is First-Time Borrower?}
    C -- Yes --> D["Prompt: Upload Income Proof<br>(PDF / Image)"]
    C -- No --> E["Income Already Verified<br>Proceed to Loan Page"]
    D --> F["Borrower Selects<br>File and Uploads"]
    F --> G["Server Receives File — Validate:<br>- File type (PDF/IMG)<br>- File size under 5 MB<br>- Not corrupted"]
    G --> H{File Valid?}
    H -- Yes --> I["Store File on Server<br>Link to Borrower Record<br>Set Status: PENDING"]
    H -- No --> J["Return Error:<br>Invalid file type or size exceeded"]
    J --> K[Borrower Re-uploads File]
    K -. retry .-> F

    subgraph APPROVER["Bank Approver Swimlane"]
        L["Bank Approver Views<br>Pending Income Proofs<br>in Admin Dashboard"]
        L --> M["Review Document:<br>- Check authenticity<br>- Verify income amount<br>- Cross-reference data"]
        M --> N{Approve or Reject?}
        N -- Reject --> O["Set Status: REJECTED<br>Record Rejection Reason<br>Notify Borrower"]
        O --> END1([END])
        N -- Approve --> P["Set Status: APPROVED<br>Update Borrower Record:<br>incomeVerified = true<br>Notify Borrower"]
    end
    I --> L

    P --> Q["Borrower Can Now Access<br>Loan Request Page"]
    E --> Q
    Q --> END2([END])
```

---

## Crypto World Bank — Chat System Flow

```mermaid
flowchart TD
    subgraph SENDER["Sender Swimlane"]
        A([START]) --> B["User Opens Loan Details<br>Page for a Specific Loan"]
        B --> C["Click Chat with<br>Borrower / Bank"]
        C --> D["Client Sends Request:<br>GET /api/chat/:loanId"]
        D --> E_node["Server Loads Chat History<br>from Database<br>(sorted by timestamp)"]
        E_node --> F{Chat History Exists?}
        F -- Yes --> G["Render Previous<br>Messages in Chat UI"]
        F -- No --> H["Display Empty Chat:<br>No messages yet"]
        G --> I_node["User Types Message<br>in Chat Input Field"]
        H --> I_node
        I_node --> J["User Clicks Send"]
        J --> K{"Message Valid?<br>(non-empty, under 1000 chars)"}
        K -- No --> L["Show Validation Error:<br>Message cannot be empty"]
        L -. back to input .-> I_node
        K -- Yes --> M["POST /api/chat/:loanId<br>sender, message, timestamp"]
        M --> N_node["Server Validates and<br>Stores Message in DB<br>Set isRead = false"]
        N_node --> O["Append Message to<br>Sender's Chat UI"]
        O --> P_node["Notify Receiver:<br>Push Notification /<br>Real-time Update"]
    end

    subgraph RECEIVER["Receiver Swimlane"]
        Q["Receiver Opens Chat<br>or Views Notification"]
        Q --> R["Load Updated Chat<br>Messages from Server"]
        R --> S["Display New Message<br>in Receiver's Chat UI"]
        S --> T["Mark Message as Read<br>PUT /api/chat/:msgId<br>isRead: true"]
        T --> U["Update Read Receipt<br>on Sender's UI"]
        U --> END1([END])
    end
    P_node --> Q
```

---

## Crypto World Bank — AI Chatbot Interaction Flow

```mermaid
flowchart TD
    A([START]) --> B["User Clicks AI Help /<br>Opens Chatbot Widget"]
    B --> C["Load User Context:<br>- Wallet address<br>- Role (Borrower/Bank)<br>- Active loans<br>- Payment history"]
    C --> D["Display Welcome Message:<br>Hello! I am your Crypto<br>World Bank assistant.<br>How can I help you?"]
    D --> E_input["User Types Question<br>in Chat Input"]
    E_input --> F["NLP Pipeline Processes Input:<br>1. Tokenize Input<br>2. Remove Stop Words<br>3. Classify Intent<br>4. Extract Entities"]
    F --> G{Intent Classification}
    G -- loan_limit --> H["LOAN LIMIT HANDLER<br>Query:<br>- Borrowing limit left<br>- 6-month and 1-year caps<br>- Current utilization"]
    G -- payment_due --> I_handler["PAYMENT DUE HANDLER<br>Query:<br>- Next due date<br>- Amount owed<br>- Installment breakdown<br>- Overdue penalties"]
    G -- bank_info --> J["BANK INFO HANDLER<br>Query:<br>- Bank name<br>- Interest rate<br>- Supported currencies<br>- Contact info<br>- Operating hours"]
    G -- general --> K["GENERAL HANDLER<br>Search FAQ and Knowledge Base<br>for best match<br>If no match:<br>I am not sure, please contact support"]
    H --> L["Query User-Specific Data<br>from Database / Smart Contract<br>as Needed"]
    I_handler --> L
    J --> L
    K --> L
    L --> M["Format Response:<br>- Natural language text<br>- Include specific data<br>- Add action suggestions<br>(e.g., Pay Now link)"]
    M --> N_log["Log Interaction:<br>- User ID<br>- Question text<br>- Detected intent<br>- Response given<br>- Timestamp"]
    N_log --> O["Display Response in<br>Chatbot UI"]
    O --> P{User Asks Another Question?}
    P -- Yes --> E_input
    P -- No --> END1([END])
```

---

## Crypto World Bank — Hierarchical Banking Flow

```mermaid
flowchart TD
    subgraph WB1["World Bank Swimlane"]
        A([START]) --> B["World Bank Deposits<br>Reserve Funds into<br>Smart Contract"]
        B --> C["Funds Available in<br>World Bank Reserve Pool"]
    end

    subgraph NB1["National Bank Swimlane"]
        D["National Bank Requests<br>Loan from World Bank<br>(amount, purpose)"]
    end
    C --> D

    subgraph WB2["World Bank Swimlane — Review"]
        E{WB Approves NB Request?}
        E -- No --> F["Reject NB Request<br>Notify National Bank"]
        F --> END1([END])
        E -- Yes --> G["Smart Contract Transfers<br>Funds: World Bank →<br>National Bank Wallet<br>Emit: FundsTransferred"]
    end
    D --> E

    subgraph NB2["National Bank Swimlane — Lending"]
        H["National Bank Receives<br>Funds, Updates Reserve"]
    end
    G --> H

    subgraph LB1["Local Bank Swimlane"]
        I_lb["Local Bank Requests Loan<br>from National Bank<br>(amount, purpose)"]
    end
    H --> I_lb

    subgraph NB3["National Bank Swimlane — Review"]
        J{NB Approves LB Request?}
        J -- No --> K["Reject LB Request<br>Notify Local Bank"]
        K --> END2([END])
        J -- Yes --> L["Smart Contract Transfers<br>Funds: National Bank →<br>Local Bank Wallet<br>Emit: FundsTransferred"]
    end
    I_lb --> J

    subgraph LB2["Local Bank Swimlane — Lending to Borrower"]
        M["Local Bank Receives<br>Funds, Updates Reserve"]
        M --> N_br["Borrower Requests Loan<br>from Local Bank"]
        N_br --> O{LB Approves Borrower Loan?}
        O -- No --> P["Reject Borrower Loan<br>Notify Borrower"]
        P --> END3([END])
        O -- Yes --> Q["Transfer Funds:<br>Local Bank → Borrower<br>Emit: LoanApproved"]
        Q --> R["Borrower Receives Funds<br>Loan is Active"]
    end
    L --> M

    subgraph REPAY["Repayment Chain — Cascading Upward"]
        S["Borrower Repays Loan<br>to Local Bank<br>(+ interest)"]
        S --> T["Local Bank Repays Loan<br>to National Bank<br>(+ interest)"]
        T --> U_nb["National Bank Repays<br>Loan to World Bank<br>(+ interest)"]
        U_nb --> V["World Bank Receives<br>Repayment, Updates<br>Reserve Pool"]
        V --> END4([END])
    end
    R --> S
```

---

## Crypto World Bank — Market Data Viewing Flow

```mermaid
flowchart TD
    A([START]) --> B["Borrower Navigates to<br>Dashboard Page"]
    B --> C["Select an Active Loan<br>from Loan List"]
    C --> D["Identify Crypto Type<br>Associated with Loan<br>(e.g., ETH, MATIC, BTC)"]
    D --> E{"Cache Exists and<br>Not Stale?<br>(under 5 min old)"}
    E -- "Yes (Fresh)" --> J["Render Price Chart:<br>- Line chart with price over time<br>- Interactive tooltips on hover<br>- Time range selector:<br>1D / 7D / 1M / 3M"]
    E -- "No (Stale / Missing)" --> F["Fetch Live Data from<br>CoinGecko API:<br>GET /coins/id/market_chart<br>vs_currency=usd, days=30"]
    F --> G{API Response Successful?}
    G -- Yes --> H["Store Response in Cache<br>with Timestamp"]
    G -- No --> I_err["Show Error:<br>Market data currently<br>unavailable. Showing<br>last cached data."]
    H --> J
    I_err --> J
    J --> K["Display Statistics:<br>- Current Price<br>- 24h Change percent<br>- 7d High / Low<br>- Market Cap<br>- Loan Value in USD"]
    K --> L["Start Polling Timer:<br>setInterval every 5 min"]
    L --> M{User Still on Dashboard?}
    M -- "Yes (poll: re-fetch and re-render)" --> E
    M -- No --> N["Clear Timer / Cleanup"]
    N --> END1([END])
```

---

## Crypto World Bank — Profile Management Flow

```mermaid
flowchart TD
    A([START]) --> B["User Navigates to<br>Profile Page"]
    B --> C["Identify User Type:<br>Borrower / Local Bank /<br>National Bank / World Bank"]
    C --> D["Load Profile Data from<br>Database and Smart Contract<br>(name, wallet, role,<br>stats, preferences)"]
    D --> E_dash["Display Role-Specific<br>Profile Dashboard:<br>Borrower: loans, limit, repayment history<br>Bank: approvals, reserve, pending requests"]
    E_dash --> F{User Selects Action}
    F -- Edit Profile --> G["Open Edit Form:<br>- Display Name<br>- Email<br>- Phone<br>- Avatar"]
    F -- "Accept T and C" --> H["Display Full Terms and<br>Conditions Document"]
    F -- Manage Prefs --> I_prefs["Toggle Options:<br>- Theme (Light / Dark)<br>- Email Notifs (On / Off)<br>- Push Notifs (On / Off)<br>- Language"]
    F -- View History --> J["Identify Role and Show:<br>Borrower: Past Loans, Payment Records,<br>Income Verifications<br>Bank: Approved Loans, Rejected Loans,<br>Pending Reviews"]

    G --> K["Validate Input Fields:<br>- Required fields<br>- Email format<br>- Phone format"]
    K --> L{Validation Passed?}
    L -- No --> LE["Show Errors<br>Highlight Invalid Fields"]
    LE -. back to form .-> G
    L -- Yes --> N_save["Save Updated Profile to DB<br>Show Success Toast"]

    H --> O["User Reads and Scrolls to Bottom<br>Click I Accept"]
    O --> P["Update Database:<br>accepted_terms = true<br>accepted_date = now()"]

    I_prefs --> Q["Save Preferences to Database<br>Apply Theme Immediately<br>Show Success"]

    J --> R["Render History Table<br>with Pagination and Filters<br>(date, status, type)"]

    N_save --> S["Return to Profile<br>Dashboard (Refreshed)"]
    P --> S
    Q --> S
    R --> S
    S --> END1([END])
```

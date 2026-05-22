# New Diagrams for Pre-thesis Paper

Each diagram below is written in Mermaid. Render them at [mermaid.live](https://mermaid.live), take a screenshot, save as PNG in the `Diagrams/` folder, and add to the thesis at the indicated location.

---

## Diagram 1: Hierarchical vs Flat DeFi Architecture Comparison

**Where to add:** Chapter 1, Section 1.1 (Background), after the paragraph that describes how DeFi protocols employ flat pool-based architectures. Place as a new figure right before `\section{Rationale of the Study}`.

**Caption:** Architectural comparison between existing flat-pool DeFi lending protocols and the Crypto World Bank's hierarchical multi-tier model.

```mermaid
graph TB
    subgraph FLAT["EXISTING DeFi PROTOCOLS (Aave, Compound, Morpho)"]
        direction TB
        LP1["Lender A<br/>$10K"] --> POOL["Single<br/>Liquidity Pool<br/>$26.3B TVL"]
        LP2["Lender B<br/>$500K"] --> POOL
        LP3["Lender C<br/>$50M"] --> POOL
        POOL --> BR1["Borrower X<br/>Retail User"]
        POOL --> BR2["Borrower Y<br/>Hedge Fund"]
        POOL --> BR3["Borrower Z<br/>DAO Treasury"]
    end

    subgraph HIER["CRYPTO WORLD BANK (Hierarchical Multi-Tier)"]
        direction TB
        WB["🏛️ World Bank<br/>Global Reserve"] -->|"3% APR"| NB1["🏦 National Bank A"]
        WB -->|"3% APR"| NB2["🏦 National Bank B"]
        NB1 -->|"5% APR"| LB1["🏪 Local Bank 1"]
        NB1 -->|"5% APR"| LB2["🏪 Local Bank 2"]
        NB2 -->|"5% APR"| LB3["🏪 Local Bank 3"]
        LB1 -->|"8% APR"| U1["👤 Individual"]
        LB1 -->|"8% APR"| U2["👤 SME"]
        LB2 -->|"8% APR"| U3["👤 Micro-enterprise"]

        NB1 <-->|"Same-tier<br/>lending"| NB2
        LB1 <-->|"Same-tier<br/>lending"| LB2
        LB1 -.->|"Upward<br/>surplus"| NB1
    end

    style FLAT fill:#FEE2E2,stroke:#DC2626,stroke-width:2px
    style HIER fill:#DCFCE7,stroke:#16A34A,stroke-width:2px
    style POOL fill:#FECACA,stroke:#EF4444,stroke-width:2px
    style WB fill:#1E40AF,color:#fff,stroke:#1E3A8A,stroke-width:2px
    style NB1 fill:#2563EB,color:#fff,stroke:#1D4ED8
    style NB2 fill:#2563EB,color:#fff,stroke:#1D4ED8
    style LB1 fill:#3B82F6,color:#fff,stroke:#2563EB
    style LB2 fill:#3B82F6,color:#fff,stroke:#2563EB
    style LB3 fill:#3B82F6,color:#fff,stroke:#2563EB
```

---

## Diagram 2: Cross-Tier Lending Flow Directions

**Where to add:** Chapter 1, Section 1.6.1 (Cross-Tier Lending System), after the subsection intro paragraph, before `\subsubsection{Same-Tier Lending}`.

**Caption:** Multi-directional capital flow in the Crypto World Bank: downward distribution (solid blue), same-tier interbank lending (dashed green), and upward surplus repatriation (dotted orange).

```mermaid
graph TB
    WB["🏛️ WORLD BANK<br/>Global Crypto Reserve"]

    NB1["🏦 National Bank A<br/>(e.g., Bangladesh)"]
    NB2["🏦 National Bank B<br/>(e.g., Nigeria)"]
    NB3["🏦 National Bank C<br/>(e.g., Brazil)"]

    LB1["🏪 Local Bank 1<br/>Dhaka"]
    LB2["🏪 Local Bank 2<br/>Chittagong"]
    LB3["🏪 Local Bank 3<br/>Lagos"]
    LB4["🏪 Local Bank 4<br/>São Paulo"]

    U1["👤 Individual<br/>0.01–10 ETH"]
    U2["🏢 SME<br/>1–100 ETH"]
    U3["🏗️ Corporate<br/>50–10K ETH"]
    U4["🌐 Institutional<br/>1,000+ ETH"]

    %% Downward flow (primary)
    WB ==>|"3% APR<br/>Downward"| NB1
    WB ==>|"3% APR<br/>Downward"| NB2
    WB ==>|"3% APR<br/>Downward"| NB3
    NB1 ==>|"5% APR"| LB1
    NB1 ==>|"5% APR"| LB2
    NB2 ==>|"5% APR"| LB3
    NB3 ==>|"5% APR"| LB4
    LB1 ==>|"8% APR"| U1
    LB1 ==>|"8% APR"| U2
    LB3 ==>|"8% APR"| U2

    %% Upward surplus (dotted)
    LB2 -.->|"Surplus ↑"| NB1
    NB3 -.->|"Surplus ↑"| WB

    %% Same-tier (dashed)
    NB1 <-..->|"Interbank"| NB2
    NB2 <-..->|"Interbank"| NB3
    LB1 <-..->|"Peer"| LB2

    %% Direct high-tier access
    NB2 ==>|"Direct"| U3
    WB ==>|"Direct"| U4

    style WB fill:#1E3A8A,color:#fff,stroke:#1E40AF,stroke-width:3px
    style NB1 fill:#1D4ED8,color:#fff,stroke:#2563EB
    style NB2 fill:#1D4ED8,color:#fff,stroke:#2563EB
    style NB3 fill:#1D4ED8,color:#fff,stroke:#2563EB
    style LB1 fill:#3B82F6,color:#fff,stroke:#60A5FA
    style LB2 fill:#3B82F6,color:#fff,stroke:#60A5FA
    style LB3 fill:#3B82F6,color:#fff,stroke:#60A5FA
    style LB4 fill:#3B82F6,color:#fff,stroke:#60A5FA
    style U1 fill:#DBEAFE,stroke:#3B82F6
    style U2 fill:#DBEAFE,stroke:#3B82F6
    style U3 fill:#DBEAFE,stroke:#3B82F6
    style U4 fill:#DBEAFE,stroke:#3B82F6
```

---

## Diagram 3: DeFi Lending TVL Comparison (Bar Chart)

**Where to add:** Chapter 5, Section 5.6 (Competitive Landscape), after the competitor longtable. Place as a new figure.

**Caption:** Total Value Locked comparison across major DeFi lending protocols and the Crypto World Bank's target market position (March 2026 data, sources: DefiLlama [13][27][29], Morpho [43], Fensory [30][31]).

```mermaid
xychart-beta
    title "DeFi Lending Protocol TVL Comparison (March 2026)"
    x-axis ["Aave v3", "Morpho", "MakerDAO", "Spark", "Maple", "Compound v3", "Centrifuge", "Euler v2", "TrueFi"]
    y-axis "Total Value Locked (USD Billions)" 0 --> 28
    bar [26.3, 6.8, 6.0, 3.6, 3.0, 1.4, 1.0, 0.8, 0.1]
```

---

## Diagram 4: Correspondent Banking vs Crypto World Bank Settlement

**Where to add:** Chapter 2, after `\subsection{Correspondent Banking and Cross-Border Settlement}`, as a figure.

**Caption:** Settlement process comparison: traditional correspondent banking (top) versus Crypto World Bank on-chain settlement (bottom).

```mermaid
graph LR
    subgraph TRAD["TRADITIONAL CORRESPONDENT BANKING"]
        direction LR
        SA["Sender<br/>Bank A"] -->|"MT103<br/>SWIFT msg"| CB1["Correspondent<br/>Bank 1"]
        CB1 -->|"Compliance<br/>screening"| CB2["Correspondent<br/>Bank 2"]
        CB2 -->|"FX<br/>conversion"| CB3["Correspondent<br/>Bank 3"]
        CB3 -->|"Credit<br/>nostro"| RB["Receiver<br/>Bank B"]

        T1["⏱️ 2–5 days settlement"]
        T2["💰 ~$42 per transaction"]
        T3["🔒 Capital trapped in nostro accounts"]
    end

    subgraph CWB["CRYPTO WORLD BANK ON-CHAIN SETTLEMENT"]
        direction LR
        S2["Sender<br/>(Local Bank)"] -->|"Smart contract<br/>execution"| BC["Blockchain<br/>(Polygon L2)"]
        BC -->|"Instant<br/>state update"| R2["Receiver<br/>(Local Bank)"]

        T4["⚡ 2-second finality"]
        T5["💰 < $0.01 per transaction"]
        T6["✅ No pre-funded accounts needed"]
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
    style T1 fill:#FEF9C3,stroke:#EAB308
    style T2 fill:#FEF9C3,stroke:#EAB308
    style T3 fill:#FEF9C3,stroke:#EAB308
    style T4 fill:#D1FAE5,stroke:#10B981
    style T5 fill:#D1FAE5,stroke:#10B981
    style T6 fill:#D1FAE5,stroke:#10B981
```

---

## Diagram 5: Global Financial Inclusion Gap

**Where to add:** Chapter 1, Section 1.1 (Background), after the paragraph mentioning 1.4 billion unbanked adults. Place as a new figure.

**Caption:** Scale of global financial exclusion and inefficiency: unbanked population, remittance fee losses, SME financing gap, and correspondent banking trapped capital (Sources: World Bank [14][26], IFC [20], BIS [24]).

```mermaid
mindmap
  root((Global Financial<br/>Exclusion))
    Unbanked Population
      1.4 billion adults
      Majority in developing economies
      Lack documentation or access
    Remittance Fee Drain
      $860B annual market
      $48–56B lost to fees yearly
      6.49% avg cost vs 3% UN target
      Sub-Saharan Africa above 8%
    SME Financing Gap
      $4.5 trillion annual gap
      $1M lending = 16.3 jobs created
      Developing economies most affected
    Correspondent Banking
      Capital trapped in nostro accounts
      $42 avg transaction cost
      2–5 day settlement times
      Multiple intermediaries per transfer
```

---

## Diagram 6: Competitive Feature Matrix (Heatmap Style)

**Where to add:** Chapter 5, Section 5.6 (Competitive Landscape), after the TVL bar chart figure. Place as a new figure.

**Caption:** Feature comparison across competitor categories. Green indicates the feature is present, red indicates absent, yellow indicates partial support.

```mermaid
block-beta
    columns 8
    space:1 A["Aave"] B["Compound"] C["Maple"] D["Goldfinch"] E["Ripple"] F["Celo"] G["CWB"]

    H1["Hierarchical<br/>Lending"]:1
    A1["❌"]:1 B1["❌"]:1 C1["❌"]:1 D1["❌"]:1 E1["❌"]:1 F1["❌"]:1 G1["✅"]:1

    H2["Cross-Tier<br/>Lending"]:1
    A2["❌"]:1 B2["❌"]:1 C2["❌"]:1 D2["❌"]:1 E2["❌"]:1 F2["❌"]:1 G2["✅"]:1

    H3["On-Chain<br/>Lending"]:1
    A3["✅"]:1 B3["✅"]:1 C3["✅"]:1 D3["🟡"]:1 E3["❌"]:1 F3["❌"]:1 G3["✅"]:1

    H4["ML Fraud<br/>Detection"]:1
    A4["❌"]:1 B4["❌"]:1 C4["❌"]:1 D4["❌"]:1 E4["❌"]:1 F4["❌"]:1 G4["✅"]:1

    H5["Financial<br/>Inclusion"]:1
    A5["❌"]:1 B5["❌"]:1 C5["❌"]:1 D5["✅"]:1 E5["❌"]:1 F5["✅"]:1 G5["✅"]:1

    H6["Cross-Border<br/>Settlement"]:1
    A6["🟡"]:1 B6["❌"]:1 C6["❌"]:1 D6["❌"]:1 E6["✅"]:1 F6["✅"]:1 G6["✅"]:1

    H7["Native<br/>Stablecoin"]:1
    A7["❌"]:1 B7["❌"]:1 C7["❌"]:1 D7["❌"]:1 E7["RLUSD"]:1 F7["cUSD"]:1 G7["UviCoin"]:1

    H8["Open<br/>Source"]:1
    A8["✅"]:1 B8["✅"]:1 C8["✅"]:1 D8["✅"]:1 E8["🟡"]:1 F8["✅"]:1 G8["✅"]:1

    style G1 fill:#16A34A,color:#fff
    style G2 fill:#16A34A,color:#fff
    style G3 fill:#16A34A,color:#fff
    style G4 fill:#16A34A,color:#fff
    style G5 fill:#16A34A,color:#fff
    style G6 fill:#16A34A,color:#fff
    style G7 fill:#16A34A,color:#fff
    style G8 fill:#16A34A,color:#fff
    style A3 fill:#16A34A,color:#fff
    style B3 fill:#16A34A,color:#fff
    style C3 fill:#16A34A,color:#fff
    style D5 fill:#16A34A,color:#fff
    style E6 fill:#16A34A,color:#fff
    style F5 fill:#16A34A,color:#fff
    style F6 fill:#16A34A,color:#fff
    style A8 fill:#16A34A,color:#fff
    style B8 fill:#16A34A,color:#fff
    style C8 fill:#16A34A,color:#fff
    style D8 fill:#16A34A,color:#fff
    style F8 fill:#16A34A,color:#fff
```

---

## Diagram 7: Interest Rate Waterfall Across Tiers

**Where to add:** Chapter 5, Section 5.9.1 (Transaction Economics: Interest Rates), after the existing bar chart. Place as a new figure showing the spread mechanics.

**Caption:** Interest rate spread and margin distribution across the four-tier lending hierarchy. Each tier retains its spread as net interest margin.

```mermaid
graph LR
    WB["🏛️ World Bank<br/>Lends at 3% APR"] -->|"Spread: 2%<br/>NB margin"| NB["🏦 National Bank<br/>Lends at 5% APR"]
    NB -->|"Spread: 3%<br/>LB margin"| LB["🏪 Local Bank<br/>Lends at 8% APR"]
    LB -->|"Borrower<br/>pays 8%"| BR["👤 Borrower"]

    WB2["Cost of capital: 0%"] -.-> WB
    NB2["Cost of capital: 3%<br/>Net margin: 2%"] -.-> NB
    LB2["Cost of capital: 5%<br/>Net margin: 3%"] -.-> LB
    BR2["Total cost: 8% APR<br/>Transparent, on-chain"] -.-> BR

    style WB fill:#1E3A8A,color:#fff,stroke-width:2px
    style NB fill:#2563EB,color:#fff
    style LB fill:#3B82F6,color:#fff
    style BR fill:#93C5FD,stroke:#3B82F6
    style WB2 fill:#EFF6FF,stroke:#BFDBFE
    style NB2 fill:#EFF6FF,stroke:#BFDBFE
    style LB2 fill:#EFF6FF,stroke:#BFDBFE
    style BR2 fill:#EFF6FF,stroke:#BFDBFE
```

---

## Diagram 8: Market Sizing Funnel (TAM → SAM → SOM)

**Where to add:** Chapter 5, Section 5.1 (Market Sizing), after the market segments table. Place as a new figure.

**Caption:** Market sizing funnel from Total Addressable Market through Serviceable Obtainable Market, with constituent data sources.

```mermaid
graph TD
    TAM["TAM: $55B – $5T+<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>DeFi Lending TVL: $55B+<br/>Global Remittances: $860B<br/>SME Financing Gap: $4.5T"]
    SAM["SAM: $5 – 15B<br/>━━━━━━━━━━━━━━━━━━<br/>Institutional lending requiring<br/>hierarchical structures;<br/>emerging-market credit demand"]
    SOM["SOM: $50 – 200M<br/>━━━━━━━━━━━━<br/>Regulatory sandboxes;<br/>academic prototypes;<br/>NGO-backed microfinance"]

    TAM --> SAM --> SOM

    style TAM fill:#1E3A8A,color:#fff,stroke-width:2px
    style SAM fill:#2563EB,color:#fff,stroke-width:2px
    style SOM fill:#3B82F6,color:#fff,stroke-width:2px
```

---

## Diagram 9: Institutional Blockchain Adoption Timeline

**Where to add:** Chapter 2, after `\subsection{Real-World Asset Tokenization and Institutional DeFi}`, as a figure.

**Caption:** Timeline of institutional blockchain adoption milestones demonstrating growing bank and institutional engagement with distributed ledger technology (2020–2026).

```mermaid
timeline
    title Institutional Blockchain Adoption Timeline
    2020 : JPMorgan launches Onyx (now Kinexys)
         : Aave v2 reaches $1B TVL
    2021 : R3 Corda crosses $5B tokenized RWAs
         : Maple Finance launches institutional lending
         : Goldfinch deploys in 10+ countries
    2022 : DeFi lending TVL peaks above $50B
         : MakerDAO begins RWA integration
    2023 : Celo MiniPay launches in Africa
         : Morpho Blue deploys as standalone primitive
    2024 : Ripple RLUSD receives NYDFS approval
         : MakerDAO rebrands to Sky Protocol
         : Centrifuge launches v3 across 8 chains
    2025 : World Bank deploys FundsChain (Hyperledger Besu)
         : R3 Corda reaches $17B tokenized RWAs
         : Kinexys exceeds $3B daily volume
         : Celo MiniPay reaches 14M wallets
         : DeFi lending TVL surpasses $55B
    2026 : Revolut secures UK banking license
         : Crypto World Bank prototype deployed
         : BRICS mBridge cross-border CBDC system pilots
```

---

## Diagram 10: Monetary Policy Transmission — Traditional vs Crypto World Bank

**Where to add:** Chapter 2, after `\subsection{Monetary Policy Distribution and Financial Inequality}`, as a figure.

**Caption:** Comparison of monetary policy transmission in the traditional banking system (exhibiting the Cantillon Effect) versus the Crypto World Bank's transparent, algorithmic approach.

```mermaid
graph TD
    subgraph TRAD["TRADITIONAL SYSTEM (Cantillon Effect)"]
        direction TB
        CB["Central Bank<br/>Prints money"] -->|"First access<br/>(lowest rates)"| BANKS["Commercial Banks<br/>& Hedge Funds"]
        BANKS -->|"Second access<br/>(higher rates)"| CORP["Large Corporations"]
        CORP -->|"Third access<br/>(market rates)"| SME2["Small Businesses"]
        SME2 -->|"Last access<br/>(inflated prices)"| PEOPLE["General Population<br/>⚠️ Faces inflation"]

        NOTE1["Top 1% holds 32% of wealth"]
        NOTE2["$800B/year extracted<br/>from developing economies"]
    end

    subgraph CWB2["CRYPTO WORLD BANK (Transparent & Algorithmic)"]
        direction TB
        WBR["World Bank Reserve<br/>Fixed supply on-chain"] -->|"3% APR<br/>visible to all"| NBR["National Banks<br/>On-chain reserves"]
        NBR -->|"5% APR<br/>visible to all"| LBR["Local Banks<br/>On-chain reserves"]
        LBR -->|"8% APR<br/>visible to all"| PPL["All Borrowers<br/>✅ Same rules for everyone"]

        NOTE3["All rates on-chain,<br/>auditable in real-time"]
        NOTE4["No hidden fees,<br/>no privileged access"]
    end

    style TRAD fill:#FEF2F2,stroke:#DC2626,stroke-width:2px
    style CWB2 fill:#F0FDF4,stroke:#16A34A,stroke-width:2px
    style CB fill:#FCA5A5,stroke:#EF4444
    style BANKS fill:#FECACA,stroke:#F87171
    style CORP fill:#FEE2E2,stroke:#FCA5A5
    style SME2 fill:#FEF2F2,stroke:#FECACA
    style PEOPLE fill:#FFF1F2,stroke:#FDA4AF
    style WBR fill:#166534,color:#fff,stroke:#15803D
    style NBR fill:#16A34A,color:#fff,stroke:#22C55E
    style LBR fill:#4ADE80,stroke:#22C55E
    style PPL fill:#DCFCE7,stroke:#86EFAC
    style NOTE1 fill:#FFF1F2,stroke:#FDA4AF
    style NOTE2 fill:#FFF1F2,stroke:#FDA4AF
    style NOTE3 fill:#D1FAE5,stroke:#6EE7B7
    style NOTE4 fill:#D1FAE5,stroke:#6EE7B7
```

---

## Diagram 11: Competitor Architecture Classification

**Where to add:** Chapter 5, Section 5.6 (Competitive Landscape), at the end of the section before `\section{Risk Taxonomy}`. Place as a final summary figure for the competitive analysis.

**Caption:** Classification of competitors by architecture type and target user base. The Crypto World Bank uniquely occupies the intersection of hierarchical architecture and broad user coverage (institutional through retail).

```mermaid
quadrantChart
    title Competitor Positioning: Architecture vs User Base
    x-axis "Retail / Individual Users" --> "Institutional / Banks"
    y-axis "Flat / Single-Tier" --> "Hierarchical / Multi-Tier"
    quadrant-1 "Hierarchical + Institutional"
    quadrant-2 "Hierarchical + Retail"
    quadrant-3 "Flat + Retail"
    quadrant-4 "Flat + Institutional"
    Aave: [0.35, 0.15]
    Compound: [0.30, 0.10]
    MakerDAO: [0.40, 0.20]
    Morpho: [0.45, 0.18]
    Celo: [0.15, 0.12]
    Stellar: [0.20, 0.22]
    Goldfinch: [0.65, 0.25]
    Maple: [0.80, 0.20]
    Ripple: [0.85, 0.30]
    Kinexys: [0.90, 0.35]
    R3 Corda: [0.88, 0.40]
    World Bank FundsChain: [0.92, 0.70]
    Crypto World Bank: [0.50, 0.85]
```

---

## Diagram 12: Go-to-Market Phased Roadmap

**Where to add:** Chapter 5, Section 5.9.3 (Value Proposition and Go-to-Market), after the existing go-to-market phases table. Place as a visual timeline figure.

**Caption:** Phased deployment roadmap from academic validation through production-scale multi-chain deployment with corresponding milestones, user acquisition targets, and revenue projections.

```mermaid
graph LR
    P1["Phase 1<br/>VALIDATION<br/>━━━━━━━━━━<br/>Current<br/>━━━━━━━━━━<br/>• Thesis publication<br/>• BCOLBD 2025<br/>• Open-source release<br/>• Testnet deployment<br/>━━━━━━━━━━<br/>Revenue: $0<br/>Users: 0"]
    P2["Phase 2<br/>PILOT<br/>━━━━━━━━━━<br/>6–12 months<br/>━━━━━━━━━━<br/>• Regulatory sandbox<br/>• 2–3 bank partners<br/>• Testnet → Mainnet<br/>• First real loans<br/>━━━━━━━━━━<br/>Revenue: $1.5M ARR<br/>Users: 500–1,000"]
    P3["Phase 3<br/>PRODUCTION<br/>━━━━━━━━━━<br/>12–24 months<br/>━━━━━━━━━━<br/>• Multi-chain deploy<br/>• Full AI/ML backend<br/>• 10+ bank partners<br/>• Governance token<br/>━━━━━━━━━━<br/>Revenue: $15M ARR<br/>Users: 10,000+"]
    P4["Phase 4<br/>SCALE<br/>━━━━━━━━━━<br/>24–48 months<br/>━━━━━━━━━━<br/>• 50+ banks<br/>• Cross-chain bridges<br/>• Stablecoin integration<br/>• Network effects<br/>━━━━━━━━━━<br/>Revenue: $200M ARR<br/>Users: 1M+"]

    P1 ==> P2 ==> P3 ==> P4

    style P1 fill:#DBEAFE,stroke:#2563EB,stroke-width:2px
    style P2 fill:#BFDBFE,stroke:#1D4ED8,stroke-width:2px
    style P3 fill:#93C5FD,stroke:#1E40AF,color:#fff,stroke-width:2px
    style P4 fill:#1E3A8A,color:#fff,stroke:#1E40AF,stroke-width:3px
```

---

## Diagram 13: AI/ML Security Pipeline

**Where to add:** Chapter 3, Section 3.1 (High-Level Architecture), after the existing component diagram. Place as a new figure showing the AI/ML decision flow.

**Caption:** AI/ML security analytics pipeline: off-chain model inference integrated with on-chain lending decisions through the risk scoring API.

```mermaid
graph LR
    TX["On-Chain<br/>Transaction"] -->|"Event emitted"| EL["Event<br/>Listener"]
    EL -->|"Raw tx data"| FE["Feature<br/>Engineering<br/>━━━━━━━━<br/>50+ features:<br/>• Wallet age<br/>• Tx frequency<br/>• Repayment history<br/>• Deposit patterns<br/>• Time-of-day"]

    FE --> RF["Random Forest<br/>━━━━━━━━<br/>Supervised<br/>Fraud Detection<br/>F1: 0.76–0.85"]
    FE --> IF["Isolation Forest<br/>━━━━━━━━<br/>Unsupervised<br/>Anomaly Detection<br/>No labels needed"]

    RF --> SHAP["SHAP<br/>Explainability<br/>━━━━━━━━<br/>Feature attribution<br/>for each prediction"]
    IF --> SHAP

    SHAP --> SCORE["Risk Score<br/>━━━━━━━━<br/>0–100 scale<br/>+ explanation"]

    SCORE -->|"Score < 30"| APPROVE["✅ Auto-Approve<br/>Low Risk"]
    SCORE -->|"30 ≤ Score ≤ 70"| REVIEW["⚠️ Human Review<br/>Medium Risk"]
    SCORE -->|"Score > 70"| FLAG["🚫 Auto-Flag<br/>High Risk"]

    APPROVE --> SC["Smart Contract<br/>Loan Execution"]
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

## Diagram 14: Borrower Tier Access Rules

**Where to add:** Chapter 1, Section 1.6.1 (Cross-Tier Lending System), after the borrower tier access table. Place as a visual figure complementing the table.

**Caption:** Tiered borrower access: different borrower classes access different levels of the lending hierarchy based on loan size and organizational type.

```mermaid
graph TD
    WB["🏛️ WORLD BANK<br/>Tier 1"] --- T1_ACCESS
    NB["🏦 NATIONAL BANKS<br/>Tier 2"] --- T2_ACCESS
    LB["🏪 LOCAL BANKS<br/>Tier 3"] --- T3_ACCESS

    T1_ACCESS["Institutional / Sovereign<br/>1,000+ ETH<br/>Development programs"]
    T2_ACCESS["Large Corporate<br/>50–10,000 ETH<br/>Infrastructure projects"]
    T3_ACCESS["Individual & SME<br/>0.01–100 ETH<br/>Personal & micro-enterprise"]

    T1_ACCESS -.->|"also accesses"| NB
    T2_ACCESS -.->|"also accesses"| LB

    style WB fill:#1E3A8A,color:#fff,stroke-width:3px
    style NB fill:#2563EB,color:#fff,stroke-width:2px
    style LB fill:#3B82F6,color:#fff,stroke-width:2px
    style T1_ACCESS fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px
    style T2_ACCESS fill:#FEF3C7,stroke:#D97706,stroke-width:2px
    style T3_ACCESS fill:#DCFCE7,stroke:#16A34A,stroke-width:2px
```

---

## Summary: Diagram Placement Guide

| # | Diagram | Thesis Location | Section |
|---|---------|----------------|---------|
| 1 | Flat vs Hierarchical Architecture | Chapter 1 | Before Section 1.2 (Rationale) |
| 2 | Cross-Tier Lending Flow | Chapter 1 | Section 1.6.1, before Same-Tier Lending |
| 3 | DeFi TVL Comparison Bar Chart | Chapter 5 | Section 5.6, after competitor table |
| 4 | Correspondent Banking vs CWB | Chapter 2 | After Correspondent Banking subsection |
| 5 | Financial Inclusion Gap Mindmap | Chapter 1 | Section 1.1, after unbanked paragraph |
| 6 | Feature Matrix (Heatmap) | Chapter 5 | Section 5.6, after TVL bar chart |
| 7 | Interest Rate Waterfall | Chapter 5 | Section 5.9.1, after existing bar chart |
| 8 | Market Sizing Funnel | Chapter 5 | Section 5.1, after market segments table |
| 9 | Institutional Adoption Timeline | Chapter 2 | After RWA Tokenization subsection |
| 10 | Cantillon Effect vs CWB | Chapter 2 | After Monetary Policy subsection |
| 11 | Competitor Quadrant Chart | Chapter 5 | Section 5.6, end of section |
| 12 | Go-to-Market Roadmap | Chapter 5 | Section 5.9.3, after phases table |
| 13 | AI/ML Security Pipeline | Chapter 3 | Section 3.1, after component diagram |
| 14 | Borrower Tier Access | Chapter 1 | Section 1.6.1, after borrower table |

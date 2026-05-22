# Component Diagram (Mermaid)
## Crypto World Bank System (A4 one-page)

---

## How to View

- **In Cursor/VS Code:** Open this file and use `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) for Markdown preview
- **Online:** Copy the Mermaid block below and paste at [mermaid.live](https://mermaid.live)

---

```mermaid
%% A4-friendly: balanced (not too wide or tall), big text, minimal crossings
%%{init: {'flowchart': {'nodeSpacing': 22, 'rankSpacing': 26, 'curve': 'basis'}, 'themeVariables': {'fontSize': '18px'}}}%%
flowchart TB

  %% Two-row grid to keep a near-square footprint on A4
  subgraph GRID[" "]
    direction TB

    subgraph ROW1[" "]
      direction LR

      subgraph PL["🖥️ Presentation Layer"]
        direction TB
        DApp["React DApp<br/><i>Dashboard · Loan · Admin · Risk · Chat</i>"]
        Wallet["Wallet Provider<br/><i>Wagmi + RainbowKit</i>"]
      end

      subgraph SCL["⛓️ Smart Contract Layer"]
        direction TB
        WB["WorldBankReserve<br/><i>IReserve</i>"]
        NB["NationalBank<br/><i>INationalBank</i>"]
        LB["LocalBank<br/><i>ILocalBank</i>"]
        WB -->|"lends"| NB -->|"lends"| LB
        OZ["OpenZeppelin<br/><i>Ownable · ReentrancyGuard</i>"]
        OZ -.-> WB
      end
    end

    subgraph ROW2[" "]
      direction LR

      subgraph BSL["⚙️ Backend Services Layer"]
        direction TB
        API["FastAPI (REST)<br/><i>LoanAPI · UserAPI · RiskAPI</i>"]
        RT["Realtime + Sync<br/><i>WebSocket · EventListener</i>"]
        AIML["AI/ML Service<br/><i>predictFraud · detectAnomaly · SHAP</i>"]
        STORE["Storage<br/><i>PostgreSQL (15 tables) · Redis · FileStore</i>"]

        API --> STORE
        API --> AIML
        RT --> STORE
      end

      subgraph EXT["🌐 External Services"]
        direction TB
        MetaMask["MetaMask Wallet<br/><i>IWalletAuth</i>"]
        Alchemy["Alchemy RPC<br/><i>IRPC</i>"]
        Polygon["Polygon PoS<br/><i>IConsensus</i>"]
      end
    end
  end

  %% Cross-layer connections (kept minimal for clarity)
  DApp -->|"REST"| API
  DApp -->|"ws://"| RT
  DApp -->|"tx/read"| LB

  Wallet -->|"connect"| MetaMask
  Wallet -->|"RPC"| Alchemy

  LB -->|"RPC"| Alchemy
  Alchemy -->|"broadcast"| Polygon

  RT -->|"events"| Alchemy

  %% Styling (thicker borders improve print visibility)
  style PL fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000
  style SCL fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
  style BSL fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
  style EXT fill:#fce4ec,stroke:#c62828,stroke-width:2px,color:#000
  style GRID fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#000
  style ROW1 fill:#ffffff,stroke:#cbd5e1,stroke-width:1px,color:#000
  style ROW2 fill:#ffffff,stroke:#cbd5e1,stroke-width:1px,color:#000
```

---

## Subsystem Summary (thesis-focused)

| Layer | Components | Responsibility |
|-------|-----------|----------------|
| **Presentation** | React DApp + Wallet Provider | UI + wallet connection + user actions |
| **Smart Contract** | WorldBankReserve → NationalBank → LocalBank (+ OpenZeppelin) | On-chain hierarchical lending logic |
| **Backend Services** | FastAPI, Realtime/Sync, AI/ML, Storage | Off-chain processing, persistence, risk scoring, chat/events |
| **External** | MetaMask, Alchemy RPC, Polygon PoS | Wallet auth + chain + RPC provider |

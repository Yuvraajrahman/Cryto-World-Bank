# Component Diagram
## Crypto World Bank System

---

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                                                  │
│                                           <<subsystem>>                                                                          │
│                                        PRESENTATION LAYER                                                                        │
│                                                                                                                                  │
│     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│     │  <<component>>   │     │  <<component>>   │     │  <<component>>   │     │  <<component>>   │     │  <<component>>   │     │
│     │   Dashboard      │     │   LoanModule     │     │   AdminPanel     │     │  RiskDashboard   │     │   QRModule       │     │
│     │                  │     │                  │     │                  │     │                  │     │                  │     │
│     │  ○ IDashboard    │     │  ○ ILoanService  │     │  ○ IAdminService │     │  ○ IRiskService  │     │  ○ IQRService    │     │
│     └────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘     └──────────────────┘     │
│              │                        │                        │                        │                                        │
│              │         ┌──────────────────────┐                │                        │                                        │
│              │         │   <<component>>      │                │                        │                                        │
│              │         │   WalletProvider     │                │                        │                                        │
│              │         │   (Wagmi+RainbowKit) │                │                        │                                        │
│              │         │                      │                │                        │                                        │
│              │         │  ○ IWalletService    │                │                        │                                        │
│              │         └──────────┬───────────┘                │                        │                                        │
│              │                    │                            │                        │                                        │
│                                                                                                                                  │
│     ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐                       │
│     │  <<component>>     │     │  <<component>>     │     │  <<component>>     │     │  <<component>>     │                       │
│     │  ChatModule        │     │  ProfileModule     │     │  MarketDataModule  │     │  ChatbotModule     │                       │
│     │                    │     │                    │     │                    │     │                    │                       │
│     │  ○ IChatService    │     │  ○ IProfileService │     │  ○ IMarketDataView │     │  ○ IChatbotUI      │                       │
│     └────────────────────┘     └────────────────────┘     └────────────────────┘     └────────────────────┘                       │
│                                                                                                                                  │
│              │                    │                            │                        │                                        │
└──────────────┼────────────────────┼────────────────────────────┼────────────────────────┼────────────────────────────────────────┘
               │                    │                            │                        │
               │        ┌──────────▼───────────┐                │                        │
               │        │  <<interface>>        │                │                        │
               │        │  IWalletService       │                │                        │
               │        │  + connectWallet()    │                │                        │
               │        │  + signTransaction()  │                │                        │
               │        │  + getAddress()       │                │                        │
               │        └──────────┬───────────┘                │                        │
               │                   │                            │                        │
═══════════════╪═══════════════════╪════════════════════════════╪════════════════════════╪════════════════════════════════════════
               │                   │                            │                        │
┌──────────────┼───────────────────┼────────────────────────────┼────────────────────────┼────────────────────────────────────────┐
│              │                   │                            │                        │                                        │
│              │            <<subsystem>>                       │                        │                                        │
│              │         SMART CONTRACT LAYER                   │                        │                                        │
│              │                   │                            │                        │                                        │
│     ┌────────▼─────────────────────────────────────────────────────────────────────────────────┐                                │
│     │                                                                                          │                                │
│     │   ┌────────────────────────┐     ┌────────────────────────┐     ┌──────────────────────┐ │                                │
│     │   │   <<component>>        │     │   <<component>>        │     │   <<component>>      │ │                                │
│     │   │   WorldBankReserve     │     │   NationalBank         │     │   LocalBank           │ │                                │
│     │   │                        │     │                        │     │                      │ │                                │
│     │   │  ○ IReserve            │     │  ○ INationalBank       │     │  ○ ILocalBank        │ │                                │
│     │   │  + depositToReserve()  │────>│  + registerLocalBank() │────>│  + requestLoan()     │ │                                │
│     │   │  + registerNatBank()   │     │  + borrowFromWB()      │     │  + approveLoan()     │ │                                │
│     │   │  + lendToNatBank()     │     │  + lendToLocalBank()   │     │  + rejectLoan()      │ │                                │
│     │   │  + getStats()          │     │                        │     │  + setApprover()     │ │                                │
│     │   │  + pause() / unpause() │     │                        │     │  + addBankUser()     │ │                                │
│     │   │  + emergencyWithdraw() │     │                        │     │  + payInstallment()  │ │                                │
│     │   └────────────────────────┘     └────────────────────────┘     └──────────────────────┘ │                                │
│     │                                                                                          │                                │
│     │   ┌─────────────────────────────┐     ┌──────────────────────────────┐                   │                                │
│     │   │  <<library>>                │     │  <<library>>                 │                   │                                │
│     │   │  OpenZeppelin               │     │  Solidity 0.8.20            │                   │                                │
│     │   │  + ReentrancyGuard          │     │  + Built-in overflow check  │                   │                                │
│     │   │  + Ownable                  │     │  + require() validation     │                   │                                │
│     │   └─────────────────────────────┘     └──────────────────────────────┘                   │                                │
│     │                                                                                          │                                │
│     └──────────────────────────────────────────────────────────────────────────────────────────┘                                │
│                                                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
               │
═══════════════╪═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
               │
┌──────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│              │                                                                                                                    │
│              │                              <<subsystem>>                                                                         │
│              │                           BACKEND SERVICES LAYER                                                                   │
│              │                                                                                                                    │
│     ┌────────▼─────────┐     ┌──────────────────┐                 ┌──────────────────┐                                           │
│     │  <<component>>   │     │  <<component>>   │                 │  <<component>>   │                                           │
│     │  EventListener   │     │  FastAPI          │                 │  AI/ML Service   │                                           │
│     │                  │     │  (REST API)       │                 │                  │                                           │
│     │  ○ IEventSync    │────>│                   │                 │  ○ IMLService    │                                           │
│     │  + onLoanReq()   │     │  ○ ILoanAPI       │────────────────>│  + predictFraud()│                                           │
│     │  + onLoanAppr()  │     │  ○ IUserAPI       │                 │  + detectAnomaly │                                           │
│     │  + onDeposit()   │     │  ○ IRiskAPI       │<────────────────│  + explainSHAP() │                                           │
│     └──────────────────┘     └────────┬─────────┘                 └──────────────────┘                                           │
│                                       │                                                                                          │
│                              ┌────────▼─────────┐     ┌──────────────────┐     ┌──────────────────┐                              │
│                              │  <<component>>   │     │  <<component>>   │     │  <<component>>   │                              │
│                              │  PostgreSQL      │     │  Redis Cache     │     │  File Storage    │                              │
│                              │                  │     │                  │     │  (Income Proofs) │                              │
│                              │  ○ IDataStore    │     │  ○ ICacheService │     │  ○ IFileStore    │                              │
│                              │  + LOAN_REQUEST  │     │  + marketData   │     │  + upload()      │                              │
│                              │  + TRANSACTION   │     │  + borrowLimits │     │  + retrieve()    │                              │
│                              │  + BORROWER      │     │  + sessions     │     │                  │                              │
│                              │  + AI_ML_LOG     │     │                  │     │                  │                              │
│                              │  + (15 tables)   │     │                  │     │                  │                              │
│                              └──────────────────┘     └──────────────────┘     └──────────────────┘                              │
│                                                                                                                                  │
│     ┌────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────────┐                                     │
│     │  <<component>>     │     │  <<component>>           │     │  <<component>>           │                                     │
│     │  WebSocket Service │     │  Chatbot Service         │     │  Income Proof Service    │                                     │
│     │                    │     │                          │     │                          │                                     │
│     │  ○ IWebSocket      │     │  ○ IChatbotService       │     │  ○ IIncomeService        │                                     │
│     │                    │     │  + classifyIntent()      │     │  + upload()              │                                     │
│     │                    │     │  + generateResponse()    │     │  + validate()            │                                     │
│     │                    │     │  + logInteraction()      │     │  + getStatus()           │                                     │
│     └────────────────────┘     └──────────────────────────┘     └──────────────────────────┘                                     │
│                                                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
               │
═══════════════╪═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
               │
┌──────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│              │                                                                                                                    │
│              │                              <<external>>                                                                          │
│              │                           EXTERNAL SERVICES                                                                        │
│              │                                                                                                                    │
│     ┌────────▼─────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐                              │
│     │  <<component>>   │     │  <<component>>   │     │  <<component>>   │     │  <<component>>   │                              │
│     │  MetaMask        │     │  Polygon PoS     │     │  CoinGecko API  │     │  Alchemy RPC     │                              │
│     │  Wallet          │     │  Network         │     │  (Market Data)  │     │  (Blockchain     │                              │
│     │                  │     │                  │     │                  │     │   Node Provider) │                              │
│     │  ○ IWalletAuth   │     │  ○ IConsensus    │     │  ○ IMarketData  │     │  ○ IRPC          │                              │
│     └──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘                              │
│                                                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Subsystems:** Presentation Layer, Smart Contract Layer, Backend Services Layer, External Services

**Key Interfaces:**
- `IWalletService` — Wallet connection and transaction signing
- `IReserve`, `INationalBank`, `ILocalBank` — Smart contract operations
- `ILoanAPI`, `IRiskAPI` — Backend REST endpoints
- `IMLService` — AI/ML fraud detection and explainability
- `IDataStore` — Database persistence (15 tables)
- `ICacheService` — Redis caching for market data and limits
- `IChatService` — Borrower-bank real-time chat messaging
- `IProfileService` — Profile management and terms acceptance
- `IMarketDataView` — Crypto price charts and statistics visualization
- `IChatbotUI` — AI chatbot interaction interface
- `IWebSocket` — Real-time messaging, typing indicators, notifications
- `IChatbotService` — NLP processing, intent classification, response generation
- `IIncomeService` — Income proof upload, validation, and review workflow

**Dependencies:** WorldBankReserve → NationalBank → LocalBank (hierarchical); FastAPI → AI/ML Service (risk assessment); EventListener → PostgreSQL (event sync); ChatModule → WebSocket Service (real-time chat); ChatbotModule → Chatbot Service (NLP processing); ProfileModule → FastAPI (profile CRUD); MarketDataModule → CoinGecko API (price data); Income Proof Service → File Storage (document storage); FastAPI → Chatbot Service (intent routing); FastAPI → Income Proof Service (upload endpoint)

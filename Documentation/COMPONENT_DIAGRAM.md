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

**Dependencies:** WorldBankReserve → NationalBank → LocalBank (hierarchical); FastAPI → AI/ML Service (risk assessment); EventListener → PostgreSQL (event sync)

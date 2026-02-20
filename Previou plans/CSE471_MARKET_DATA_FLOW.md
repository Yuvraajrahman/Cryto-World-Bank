# CSE471 - Market Data Visualization Flow
## Sequential Diagram: View Market Data Graph

**Course:** CSE471 - System Analysis  
**Flow:** Market Data Visualization  
**Date:** 2024

---

## View Market Data Graph Flow (Top-Down Expanding Tree)

```
VIEW MARKET DATA GRAPH FLOW (Top-Down Expanding Tree)
│
├── LEVEL 1: BORROWER ACTIONS
│   │
│   ├── 1. Navigate to Dashboard
│   │   │
│   │   └── LEVEL 2: LOAD DASHBOARD
│   │       │
│   │       └── 1.1 Display Active Loans
│   │
│   ├── 2. Select Active Loan
│   │   │
│   │   └── LEVEL 2: LOAD LOAN DETAILS
│   │       │
│   │       ├── 2.1 Fetch Loan Information
│   │       │   ├── Amount
│   │       │   ├── Cryptocurrency type
│   │       │   └── Status
│   │       │
│   │       └── 2.2 Identify Cryptocurrency Type
│   │           └── Extract from loan (e.g., ETH, BTC)
│   │
│   ├── 3. View Market Data Graph
│   │   │
│   │   └── LEVEL 2: INITIALIZE GRAPH COMPONENT
│   │       │
│   │       ├── 3.1 Render Graph Container
│   │       │   ├── Create canvas/chart area
│   │       │   ├── Set dimensions (responsive)
│   │       │   └── Apply blockchain-themed styling
│   │       │
│   │       └── 3.2 Display Loading State
│   │           └── Show spinner/skeleton loader
│   │
│   └── LEVEL 2: FETCH MARKET DATA
│       │
│       ├── 4.1 Determine Cryptocurrency
│       │   │
│       │   └── LEVEL 3: IDENTIFY CRYPTO TYPE
│       │       │
│       │       ├── 4.1.1 Check Loan Cryptocurrency Type
│       │       │   ├── Read from loan object
│       │       │   └── Default to ETH if not specified
│       │       │
│       │       └── 4.1.2 Validate Cryptocurrency
│       │           ├── Check if supported (ETH, BTC, MATIC, etc.)
│       │           └── Fallback to ETH if invalid
│       │
│       ├── 4.2 Call Market Data API
│       │   │
│       │   └── LEVEL 3: API REQUEST PROCESSING
│       │       │
│       │       ├── 4.2.1 Check Cache
│       │       │   │
│       │       │   └── LEVEL 4: CACHE VALIDATION
│       │       │       │
│       │       │       ├── 4.2.1.1 Query Redis Cache
│       │       │       │   ├── Key: "market_data:{crypto_type}"
│       │       │       │   └── Check timestamp
│       │       │       │
│       │       │       ├── 4.2.1.2 Check Cache Age
│       │       │       │   ├── If < 5 minutes: Use cached data
│       │       │       │   └── If >= 5 minutes: Fetch new data
│       │       │       │
│       │       │       └── 4.2.1.3 Return Cached Data (if valid)
│       │       │           └── Skip API call
│       │       │
│       │       ├── 4.2.2 Make API Request
│       │       │   │
│       │       │   └── LEVEL 4: EXTERNAL API CALL
│       │       │       │
│       │       │       ├── 4.2.2.1 Select API Provider
│       │       │       │   ├── Primary: CoinGecko API
│       │       │       │   └── Fallback: CoinMarketCap API
│       │       │       │
│       │       │       ├── 4.2.2.2 Construct API URL
│       │       │       │   ├── Base URL: https://api.coingecko.com/api/v3
│       │       │       │   ├── Endpoint: /simple/price
│       │       │       │   ├── Parameters: ids={crypto}, vs_currencies=usd,eth
│       │       │       │   └── Include_market_cap, include_24hr_vol, include_24hr_change
│       │       │       │
│       │       │       ├── 4.2.2.3 Send HTTP GET Request
│       │       │       │   ├── Headers: API key (if required)
│       │       │       │   ├── Timeout: 10 seconds
│       │       │       │   └── Error handling
│       │       │       │
│       │       │       ├── 4.2.2.4 Receive API Response
│       │       │       │   ├── Status code check
│       │       │       │   ├── Parse JSON response
│       │       │       │   └── Extract price data
│       │       │       │
│       │       │       └── 4.2.2.5 Handle API Errors
│       │       │           ├── If 429 (Rate Limit): Wait and retry
│       │       │           ├── If 500 (Server Error): Use fallback API
│       │       │           └── If network error: Show cached data or error message
│       │       │
│       │       └── 4.2.3 Store in Cache
│       │           │
│       │           └── LEVEL 4: CACHE STORAGE
│       │               │
│       │               ├── 4.2.3.1 Format Data for Cache
│       │               │   ├── Include timestamp
│       │               │   ├── Include cryptocurrency type
│       │               │   └── Include all price data
│       │               │
│       │               └── 4.2.3.2 Save to Redis
│       │                   ├── Key: "market_data:{crypto_type}"
│       │                   ├── Value: JSON stringified data
│       │                   └── TTL: 5 minutes
│       │
│       ├── 4.3 Fetch Historical Data
│       │   │
│       │   └── LEVEL 3: HISTORICAL DATA RETRIEVAL
│       │       │
│       │       ├── 4.3.1 Determine Time Range
│       │       │   ├── Default: Last 30 days
│       │       │   ├── User can select: 7 days, 30 days, 90 days, 1 year
│       │       │   └── Based on loan duration
│       │       │
│       │       ├── 4.3.2 Query Database
│       │       │   │
│       │       │   └── LEVEL 4: DATABASE QUERY
│       │       │       │
│       │       │       ├── 4.3.2.1 Check MARKET_DATA Table
│       │       │       │   ├── SELECT * FROM MARKET_DATA
│       │       │       │   ├── WHERE cryptocurrency_type = ?
│       │       │       │   ├── AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
│       │       │       │   └── ORDER BY timestamp ASC
│       │       │       │
│       │       │       ├── 4.3.2.2 Check Data Completeness
│       │       │       │   ├── If data points < expected: Fetch from API
│       │       │       │   └── If data points sufficient: Use database data
│       │       │       │
│       │       │       └── 4.3.2.3 Fetch Missing Data from API
│       │       │           ├── Call historical endpoint
│       │       │           ├── Store in database
│       │       │           └── Return combined dataset
│       │       │
│       │       └── 4.3.3 Format Historical Data
│       │           ├── Group by date
│       │           ├── Calculate daily averages
│       │           └── Create time series array
│       │
│       └── 4.4 Process Market Data
│           │
│           └── LEVEL 3: DATA PROCESSING
│               │
│               ├── 4.4.1 Extract Price Information
│               │   ├── Current price (USD)
│               │   ├── Current price (ETH)
│               │   ├── 24h change percentage
│               │   ├── 24h volume
│               │   └── Market capitalization
│               │
│               ├── 4.4.2 Calculate Statistics
│               │   ├── Highest price in period
│               │   ├── Lowest price in period
│               │   ├── Average price
│               │   └── Price volatility
│               │
│               └── 4.4.3 Prepare Graph Data
│                   ├── X-axis: Timestamps
│                   ├── Y-axis: Price values
│                   ├── Data points array
│                   └── Metadata (currency, time range)
│
├── LEVEL 1: RENDER GRAPH
│   │
│   ├── 5.1 Initialize Chart Library
│   │   │
│   │   └── LEVEL 2: CHART SETUP
│   │       │
│   │       ├── 5.1.1 Select Chart Library
│   │       │   ├── Primary: Recharts (React)
│   │       │   └── Alternative: Chart.js
│   │       │
│   │       ├── 5.1.2 Configure Chart Options
│   │       │   ├── Type: Line chart
│   │       │   ├── Responsive: true
│   │       │   ├── Animation: enabled
│   │       │   └── Theme: Blockchain-themed colors
│   │       │
│   │       └── 5.1.3 Set Chart Dimensions
│   │           ├── Width: 100% container
│   │           ├── Height: 400px (desktop), 300px (mobile)
│   │           └── Aspect ratio: 16:9
│   │
│   ├── 5.2 Render Price Line
│   │   │
│   │   └── LEVEL 2: LINE CHART RENDERING
│   │       │
│   │       ├── 5.2.1 Draw Main Price Line
│   │       │   ├── Color: Primary theme color (e.g., #6366f1)
│   │       │   ├── Stroke width: 2px
│   │       │   ├── Smooth curve: true
│       │       │   └── Data: Historical price points
│       │       │
│       │       ├── 5.2.2 Add Current Price Indicator
│       │       │   ├── Marker at latest point
│       │       │   ├── Tooltip showing current price
│       │       │   └── Highlight with different color
│       │       │
│       │       └── 5.2.3 Add Loan Amount Reference
│       │           ├── Horizontal line at loan amount
│       │           ├── Label: "Your Loan Amount"
│       │           └── Different style (dashed)
│       │
│   ├── 5.3 Add Interactive Features
│   │   │
│   │   └── LEVEL 2: INTERACTIVITY
│   │       │
│   │       ├── 5.3.1 Hover Tooltip
│   │       │   ├── Show on mouse hover
│       │       │   ├── Display: Date, Price (USD), Price (ETH)
│       │       │   ├── Format: Currency formatting
│       │       │   └── Position: Follow cursor
│       │       │
│       │       ├── 5.3.2 Zoom Functionality
│       │       │   ├── Click and drag to zoom
│       │       │   ├── Double-click to reset
│       │       │   └── Show zoom controls
│       │       │
│       │       └── 5.3.3 Time Range Selector
│       │           ├── Buttons: 7D, 30D, 90D, 1Y, All
│       │           ├── Update graph on selection
│       │           └── Highlight active range
│   │
│   └── 5.4 Display Statistics Panel
│       │
│       └── LEVEL 2: STATISTICS DISPLAY
│           │
│           ├── 5.4.1 Current Price Card
│           │   ├── Large display: Current price
│           │   ├── Change indicator: +X% or -X% (green/red)
│           │   ├── 24h change
│           │   └── Last updated timestamp
│           │
│           ├── 5.4.2 Market Statistics
│           │   ├── 24h Volume
│           │   ├── Market Cap
│           │   ├── High/Low (24h)
│           │   └── Volatility indicator
│           │
│           └── 5.4.3 Loan Comparison
│               ├── Loan amount in cryptocurrency
│               ├── Current value in USD
│               ├── Value change since loan approval
│               └── Percentage change indicator
│
├── LEVEL 1: REAL-TIME UPDATES
│   │
│   ├── 6.1 Set Up WebSocket Connection (Optional)
│   │   │
│   │   └── LEVEL 2: WEBSOCKET SETUP
│   │       │
│   │       ├── 6.1.1 Connect to Market Data WebSocket
│   │       │   ├── URL: wss://api.coingecko.com/v3/ws
│   │       │   ├── Subscribe to price updates
│   │       │   └── Handle connection errors
│   │       │
│   │       ├── 6.1.2 Listen for Price Updates
│   │       │   ├── Receive price change events
│   │       │   ├── Update graph data
│   │       │   └── Animate price change
│   │       │
│   │       └── 6.1.3 Handle Disconnection
│   │           ├── Reconnect logic
│   │           ├── Fallback to polling
│   │           └── Show connection status
│   │
│   └── 6.2 Polling Updates (Primary Method)
│       │
│       └── LEVEL 2: POLLING MECHANISM
│           │
│           ├── 6.2.1 Set Interval Timer
│           │   ├── Interval: 5 minutes
│           │   ├── Only when graph is visible
│           │   └── Clear on component unmount
│           │
│           ├── 6.2.2 Fetch Updated Data
│           │   ├── Call market data API
│           │   ├── Update cache
│           │   └── Refresh graph
│           │
│           └── 6.2.3 Animate Price Changes
│               ├── Highlight new data point
│               ├── Smooth transition
│               └── Update statistics panel
│
└── LEVEL 1: ERROR HANDLING
    │
    ├── 7.1 Handle API Failures
    │   │
    │   └── LEVEL 2: ERROR RECOVERY
    │       │
    │       ├── 7.1.1 Display Error Message
    │       │   ├── User-friendly message
    │       │   ├── Retry button
    │       │   └── Show cached data if available
    │       │
    │       └── 7.1.2 Fallback to Cached Data
    │           ├── Check cache age
    │           ├── Display with "Data may be outdated" warning
    │           └── Continue showing graph
    │
    └── 7.2 Handle Missing Data
        │
        └── LEVEL 2: DATA VALIDATION
            │
            ├── 7.2.1 Validate Data Completeness
            │   ├── Check if data points exist
            │   ├── Check if data is recent
            │   └── Check if data format is correct
            │
            └── 7.2.2 Display Placeholder
                ├── Show "No data available" message
                ├── Suggest refreshing
                └── Hide graph if no data
```

---

## Sequence Diagram (Alternative View)

```
BORROWER          FRONTEND          API SERVICE        DATABASE         CACHE
   │                 │                  │                 │              │
   │──Navigate──────>│                  │                 │              │
   │                 │                  │                 │              │
   │<──Dashboard─────│                  │                 │              │
   │                 │                  │                 │              │
   │──Select Loan───>│                  │                 │              │
   │                 │                  │                 │              │
   │                 │──Get Loan───────>│                 │              │
   │                 │<──Loan Data──────│                 │              │
   │                 │                  │                 │              │
   │──View Graph───>│                  │                 │              │
   │                 │                  │                 │              │
   │                 │──Check Cache──────────────────────────────────>│
   │                 │<──Cache Result─────────────────────────────────│
   │                 │                  │                 │              │
   │                 │──Fetch Price────>│                 │              │
   │                 │<──Price Data─────│                 │              │
   │                 │                  │                 │              │
   │                 │──Store Cache──────────────────────────────────>│
   │                 │                  │                 │              │
   │                 │──Get History──────────────────────>│              │
   │                 │<──History Data─────────────────────│              │
   │                 │                  │                 │              │
   │<──Graph─────────│                  │                 │              │
   │                 │                  │                 │              │
   │                 │──Poll (5min)────>│                 │              │
   │                 │<──Update─────────│                 │              │
   │                 │                  │                 │              │
   │<──Updated───────│                  │                 │              │
```

---

## Key Components

### Frontend Components
- `MarketDataGraph.tsx` - Main graph component
- `PriceStatistics.tsx` - Statistics panel
- `TimeRangeSelector.tsx` - Time range buttons
- `PriceTooltip.tsx` - Hover tooltip

### Backend Services
- `MarketDataService` - API integration service
- `CacheService` - Redis cache management
- `HistoricalDataService` - Database queries for history

### Data Structures
```typescript
interface MarketData {
  cryptocurrency_type: string;
  price_usd: number;
  price_eth: number;
  volume_24h: number;
  market_cap: number;
  change_24h: number;
  timestamp: Date;
}

interface HistoricalDataPoint {
  date: Date;
  price: number;
  volume: number;
}
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis


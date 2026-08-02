/**
 * Public reserve transparency mock — shaped for page A.3.
 * BACKEND TODO: GET /api/public/reserve-summary (+ drill-down + history)
 */

export const mockReserveTransparency = {
  syncedAt: "2026-08-02T09:42:00Z",
  staleAfterMinutes: 30,
  proofOfReserve: {
    status: "attested",
    provider: "Chainlink Proof of Reserve",
    attestedAt: "2026-08-02T09:30:00Z",
  },
  summary: {
    totalReserve: { value: 48_200_000, display: "$48.2M" },
    reserveRatio: { value: 0.312, display: "31.2%", minimum: 0.2, minimumDisplay: "20%" },
    insuranceFund: { value: 2_140_000, display: "$2.14M" },
    loansOutstanding: { value: 18_640_000, display: "$18.6M" },
    totalRepaid: { value: 9_820_000, display: "$9.82M" },
    defaultRate: { value: 0.018, display: "1.8%" },
  },
  world: {
    id: "world",
    name: "World Bank Reserve",
    capital: { display: "$48.2M" },
    reserveRatio: { display: "31.2%" },
    children: [
      {
        id: "nb-bd",
        name: "National Bank — Bangladesh",
        capital: { display: "$18.4M" },
        reserveRatio: { display: "28.4%" },
        children: [
          { id: "lb-dhaka", name: "Local Bank — Dhaka", capital: { display: "$6.2M" }, reserveRatio: { display: "26.1%" }, loans: 412 },
          { id: "lb-ctg", name: "Local Bank — Chittagong", capital: { display: "$5.1M" }, reserveRatio: { display: "27.8%" }, loans: 298 },
          { id: "lb-syl", name: "Local Bank — Sylhet", capital: { display: "$3.4M" }, reserveRatio: { display: "30.2%" }, loans: 176 },
        ],
      },
      {
        id: "nb-in",
        name: "National Bank — India",
        capital: { display: "$16.8M" },
        reserveRatio: { display: "33.0%" },
        children: [
          { id: "lb-mum", name: "Local Bank — Mumbai", capital: { display: "$7.9M" }, reserveRatio: { display: "31.5%" }, loans: 520 },
          { id: "lb-blr", name: "Local Bank — Bengaluru", capital: { display: "$5.4M" }, reserveRatio: { display: "34.2%" }, loans: 341 },
        ],
      },
      {
        id: "nb-ke",
        name: "National Bank — Kenya",
        capital: { display: "$13.0M" },
        reserveRatio: { display: "29.6%" },
        children: [
          { id: "lb-nbo", name: "Local Bank — Nairobi", capital: { display: "$8.1M" }, reserveRatio: { display: "28.9%" }, loans: 388 },
          { id: "lb-msa", name: "Local Bank — Mombasa", capital: { display: "$4.9M" }, reserveRatio: { display: "30.1%" }, loans: 214 },
        ],
      },
    ],
  },
  history: {
    "7d": [
      { t: "Mon", ratio: 0.298 },
      { t: "Tue", ratio: 0.301 },
      { t: "Wed", ratio: 0.305 },
      { t: "Thu", ratio: 0.308 },
      { t: "Fri", ratio: 0.31 },
      { t: "Sat", ratio: 0.311 },
      { t: "Sun", ratio: 0.312 },
    ],
    "30d": [
      { t: "W1", ratio: 0.285 },
      { t: "W2", ratio: 0.292 },
      { t: "W3", ratio: 0.301 },
      { t: "W4", ratio: 0.312 },
    ],
    "90d": [
      { t: "M1", ratio: 0.27 },
      { t: "M2", ratio: 0.288 },
      { t: "M3", ratio: 0.312 },
    ],
  },
  contracts: [
    { name: "WorldBank", address: "0xWbRe…001", explorer: "#" },
    { name: "NationalBank", address: "0xNbRe…002", explorer: "#" },
    { name: "LocalBank", address: "0xLbRe…003", explorer: "#" },
  ],
  network: { name: "Sepolia Testnet", chainId: 11155111 },
  audits: [
    { name: "Slither", status: "passed" },
    { name: "Mythril", status: "passed" },
  ],
};

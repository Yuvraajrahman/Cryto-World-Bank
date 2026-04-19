// Contract addresses pulled from env vars. Leave blank for the "unconfigured"
// state the UI renders with a polite warning so the rest of the app still
// loads during design / offline work.

export const contractAddresses = {
  worldBank: (import.meta.env.VITE_WORLD_BANK_ADDRESS ?? "") as `0x${string}` | "",
  nationalBank: (import.meta.env.VITE_NATIONAL_BANK_ADDRESS ?? "") as `0x${string}` | "",
  localBank: (import.meta.env.VITE_LOCAL_BANK_ADDRESS ?? "") as `0x${string}` | "",
};

// Thin ABI stubs covering only the functions the current UI needs. Full ABIs
// will be generated from Hardhat artifacts once contracts are deployed.
export const worldBankAbi = [
  {
    type: "function",
    name: "reserveBalance",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "systemStats",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { type: "uint256", name: "balance" },
      { type: "uint256", name: "deposits" },
      { type: "uint256", name: "allocated" },
      { type: "uint256", name: "repaid" },
      { type: "uint256", name: "bankCount" },
    ],
  },
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "lendingAprBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const localBankAbi = [
  {
    type: "function",
    name: "requestLoan",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint256", name: "principal" },
      { type: "uint32", name: "termMonths" },
      { type: "string", name: "purpose" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "borrowerLoans",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256[]" }],
  },
  {
    type: "function",
    name: "loans",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [
      { type: "uint256", name: "id" },
      { type: "address", name: "borrower" },
      { type: "uint256", name: "principal" },
      { type: "uint256", name: "aprBps" },
      { type: "uint32",  name: "termMonths" },
      { type: "uint256", name: "totalOwed" },
      { type: "uint256", name: "totalPaid" },
      { type: "uint256", name: "createdAt" },
      { type: "uint256", name: "approvedAt" },
      { type: "uint8",   name: "installmentCount" },
      { type: "uint8",   name: "installmentsPaid" },
      { type: "uint8",   name: "status" },
      { type: "string",  name: "purpose" },
    ],
  },
  {
    type: "function",
    name: "payInstallment",
    stateMutability: "payable",
    inputs: [{ type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "borrowAprBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "bankStats",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { type: "uint256", name: "balance" },
      { type: "uint256", name: "loanCount" },
      { type: "uint256", name: "pending" },
      { type: "uint256", name: "active" },
      { type: "uint256", name: "repaid" },
    ],
  },
] as const;

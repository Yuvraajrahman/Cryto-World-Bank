import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET?.trim() || "dev-secret-change-me",
  chainRpcUrl: process.env.CHAIN_RPC_URL ?? "",
  contracts: {
    worldBank: process.env.WORLD_BANK_ADDRESS ?? "",
    nationalBank: process.env.NATIONAL_BANK_ADDRESS ?? "",
    localBank: process.env.LOCAL_BANK_ADDRESS ?? "",
    loanController: process.env.LOAN_CONTROLLER_ADDRESS ?? "",
    mockUsdc: process.env.MOCK_USDC_ADDRESS ?? "",
    governorMultisig: process.env.GOVERNOR_MULTISIG_ADDRESS ?? "",
    creditPassport: process.env.CREDIT_PASSPORT_ADDRESS ?? "",
    upwardDeposit: process.env.UPWARD_DEPOSIT_ADDRESS ?? "",
    savingsVault: process.env.SAVINGS_VAULT_ADDRESS ?? "",
    groupLendingPool: process.env.GROUP_LENDING_POOL_ADDRESS ?? "",
    interBankLendingPool: process.env.INTERBANK_LENDING_POOL_ADDRESS ?? "",
  },
  mlServiceUrl: process.env.ML_SERVICE_URL ?? "http://localhost:8000",
  llmBaseUrl: process.env.LLM_BASE_URL ?? "http://127.0.0.1:11434",
  llmModel: process.env.LLM_MODEL ?? "qwen3:8b",
  oraclePrivateKey: process.env.ORACLE_PRIVATE_KEY ?? "",
};

import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  chainRpcUrl: process.env.CHAIN_RPC_URL ?? "",
  contracts: {
    worldBank: process.env.WORLD_BANK_ADDRESS ?? "",
    nationalBank: process.env.NATIONAL_BANK_ADDRESS ?? "",
    localBank: process.env.LOCAL_BANK_ADDRESS ?? "",
  },
  mlServiceUrl: process.env.ML_SERVICE_URL ?? "http://localhost:8000",
  llmBaseUrl: process.env.LLM_BASE_URL ?? "http://127.0.0.1:1234",
  llmModel: process.env.LLM_MODEL ?? "local-model",
};

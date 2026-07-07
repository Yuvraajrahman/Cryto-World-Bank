/**
 * Copies contract addresses from deployments/testnet/<network>.json into
 * frontend/.env and backend/.env (creates from .env.example if missing).
 */
import * as fs from "fs";
import * as path from "path";

const root = path.join(__dirname, "..");
const network = process.argv[2] ?? "localhost";

type DeploymentFile = {
  network: string;
  chainId: number;
  contracts: Record<string, string>;
};

function loadDeployment(): DeploymentFile {
  const file = path.join(root, "deployments", "testnet", `${network}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Deployment file not found: ${file}\nRun: npm run deploy:${network === "localhost" ? "local" : network}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as DeploymentFile;
}

function upsertEnv(filePath: string, examplePath: string, updates: Record<string, string>) {
  if (!fs.existsSync(filePath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, filePath);
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "", "utf8");
  }

  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const keys = new Set(Object.keys(updates));

  const out = lines
    .map((line) => {
      const match = line.match(/^([A-Z0-9_]+)=/);
      if (match && keys.has(match[1])) {
        keys.delete(match[1]);
        return `${match[1]}=${updates[match[1]]}`;
      }
      return line;
    })
    .filter((line, idx, arr) => !(line === "" && idx === arr.length - 1));

  for (const key of keys) {
    out.push(`${key}=${updates[key]}`);
  }

  fs.writeFileSync(filePath, `${out.join("\n").trimEnd()}\n`, "utf8");
}

function main() {
  const dep = loadDeployment();
  const c = dep.contracts;

  const shared = {
    VITE_CHAIN_ID: String(dep.chainId),
    VITE_WORLD_BANK_ADDRESS: c.WorldBankReserve ?? "",
    VITE_NATIONAL_BANK_ADDRESS: c.NationalBank ?? "",
    VITE_LOCAL_BANK_ADDRESS: c.LocalBank ?? "",
    VITE_LOAN_CONTROLLER_ADDRESS: c.LoanController ?? "",
    VITE_MOCK_USDC_ADDRESS: c.MockUSDC ?? "",
    VITE_CREDIT_PASSPORT_ADDRESS: c.CreditPassport ?? "",
    VITE_UPWARD_DEPOSIT_ADDRESS: c.UpwardDepositFacility ?? "",
    VITE_SAVINGS_VAULT_ADDRESS: c.SavingsVault ?? "",
    VITE_GROUP_LENDING_POOL_ADDRESS: c.GroupLendingPool ?? "",
    VITE_INTERBANK_LENDING_POOL_ADDRESS: c.InterBankLendingPool ?? "",
    VITE_GOVERNOR_MULTISIG_ADDRESS: c.GovernorMultisig2of3 ?? "",
    WORLD_BANK_ADDRESS: c.WorldBankReserve ?? "",
    NATIONAL_BANK_ADDRESS: c.NationalBank ?? "",
    LOCAL_BANK_ADDRESS: c.LocalBank ?? "",
    LOAN_CONTROLLER_ADDRESS: c.LoanController ?? "",
    MOCK_USDC_ADDRESS: c.MockUSDC ?? "",
    CREDIT_PASSPORT_ADDRESS: c.CreditPassport ?? "",
    UPWARD_DEPOSIT_ADDRESS: c.UpwardDepositFacility ?? "",
    SAVINGS_VAULT_ADDRESS: c.SavingsVault ?? "",
    GROUP_LENDING_POOL_ADDRESS: c.GroupLendingPool ?? "",
    INTERBANK_LENDING_POOL_ADDRESS: c.InterBankLendingPool ?? "",
    GOVERNOR_MULTISIG_ADDRESS: c.GovernorMultisig2of3 ?? "",
    CHAIN_RPC_URL:
      dep.chainId === 31337
        ? "http://127.0.0.1:8545"
        : dep.chainId === 11155111
          ? process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com"
          : process.env.AMOY_RPC_URL ?? "https://rpc-amoy.polygon.technology",
  };

  upsertEnv(path.join(root, "frontend", ".env"), path.join(root, "frontend", ".env.example"), {
    VITE_CHAIN_ID: shared.VITE_CHAIN_ID,
    VITE_WORLD_BANK_ADDRESS: shared.VITE_WORLD_BANK_ADDRESS,
    VITE_NATIONAL_BANK_ADDRESS: shared.VITE_NATIONAL_BANK_ADDRESS,
    VITE_LOCAL_BANK_ADDRESS: shared.VITE_LOCAL_BANK_ADDRESS,
    VITE_LOAN_CONTROLLER_ADDRESS: shared.VITE_LOAN_CONTROLLER_ADDRESS,
    VITE_MOCK_USDC_ADDRESS: shared.VITE_MOCK_USDC_ADDRESS,
    VITE_CREDIT_PASSPORT_ADDRESS: shared.VITE_CREDIT_PASSPORT_ADDRESS,
    VITE_UPWARD_DEPOSIT_ADDRESS: shared.VITE_UPWARD_DEPOSIT_ADDRESS,
    VITE_SAVINGS_VAULT_ADDRESS: shared.VITE_SAVINGS_VAULT_ADDRESS,
    VITE_GROUP_LENDING_POOL_ADDRESS: shared.VITE_GROUP_LENDING_POOL_ADDRESS,
    VITE_INTERBANK_LENDING_POOL_ADDRESS: shared.VITE_INTERBANK_LENDING_POOL_ADDRESS,
    VITE_GOVERNOR_MULTISIG_ADDRESS: shared.GOVERNOR_MULTISIG_ADDRESS,
  });

  upsertEnv(path.join(root, "backend", ".env"), path.join(root, "backend", ".env.example"), {
    WORLD_BANK_ADDRESS: shared.WORLD_BANK_ADDRESS,
    NATIONAL_BANK_ADDRESS: shared.NATIONAL_BANK_ADDRESS,
    LOCAL_BANK_ADDRESS: shared.LOCAL_BANK_ADDRESS,
    LOAN_CONTROLLER_ADDRESS: shared.LOAN_CONTROLLER_ADDRESS,
    MOCK_USDC_ADDRESS: shared.MOCK_USDC_ADDRESS,
    CREDIT_PASSPORT_ADDRESS: shared.CREDIT_PASSPORT_ADDRESS,
    UPWARD_DEPOSIT_ADDRESS: shared.UPWARD_DEPOSIT_ADDRESS,
    SAVINGS_VAULT_ADDRESS: shared.SAVINGS_VAULT_ADDRESS,
    GROUP_LENDING_POOL_ADDRESS: shared.GROUP_LENDING_POOL_ADDRESS,
    INTERBANK_LENDING_POOL_ADDRESS: shared.INTERBANK_LENDING_POOL_ADDRESS,
    GOVERNOR_MULTISIG_ADDRESS: shared.GOVERNOR_MULTISIG_ADDRESS,
    CHAIN_RPC_URL: shared.CHAIN_RPC_URL,
    ...(dep.chainId === 31337
      ? {
          ORACLE_PRIVATE_KEY:
            process.env.ORACLE_PRIVATE_KEY ??
            "0x5de4111afa1a4b94908f83103eb1f1709b719baa8af4d696e4ebf879d12f2e5",
        }
      : {}),
  });

  console.log(`Synced ${network} deployment → frontend/.env and backend/.env`);
  console.log(JSON.stringify(c, null, 2));
}

main();

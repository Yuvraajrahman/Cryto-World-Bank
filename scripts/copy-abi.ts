/**
 * Copy compiled contract ABI to frontend.
 * Run after: npx hardhat compile
 */
import * as fs from "fs";
import * as path from "path";

const artifactPath = path.join(
  __dirname,
  "../artifacts/contracts/WorldBankReserve.sol/WorldBankReserve.json"
);
const outDir = path.join(__dirname, "../frontend/src/contracts");
const outPath = path.join(outDir, "WorldBankReserveABI.json");

if (!fs.existsSync(artifactPath)) {
  console.error("Run 'npx hardhat compile' first.");
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(outPath, JSON.stringify(artifact.abi, null, 2));
console.log("ABI copied to frontend/src/contracts/WorldBankReserveABI.json");
console.log("Update frontend to import from this file if you need the full ABI.");

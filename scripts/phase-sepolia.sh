#!/usr/bin/env sh
# Full Phase I + II Sepolia deployment — deploy, sync env, verify G1 + G2.
set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env — copy .env.example and set PRIVATE_KEY or SEPOLIA_MNEMONIC"
  echo "  cp .env.example .env"
  exit 1
fi

echo "▸ Compiling contracts..."
npm run compile

echo "▸ Deploying Phase I + II to Sepolia..."
npm run deploy:sepolia

echo "▸ Syncing contract addresses..."
npm run sync:env sepolia

echo "▸ Running Phase I verification on Sepolia..."
npm run verify:phase1:sepolia

echo "▸ Running Phase II verification on Sepolia..."
npm run verify:phase2:sepolia

echo ""
echo "✓ Sepolia deployment complete."
echo "  Manifest: deployments/testnet/sepolia.json"
echo "  Fund persona wallets if verify used extra ETH (see Documentation/SEPOLIA.md)"
echo "  npm run dev  →  connect MetaMask to Sepolia with imported persona accounts"
echo ""

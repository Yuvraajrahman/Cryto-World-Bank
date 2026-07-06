#!/usr/bin/env sh
# Phase I local testnet — deploy contracts and sync env (chain must already be running).
set -e
cd "$(dirname "$0")/.."

echo "▸ Deploying to localhost..."
npm run deploy:local

echo "▸ Syncing contract addresses to frontend + backend .env..."
npm run sync:env localhost

echo "▸ Running Phase I verification..."
npm run verify:phase1

echo ""
echo "✓ Phase I local setup complete."
echo ""
echo "Next:"
echo "  1. Import Hardhat accounts #0–#5 (see Documentation/PHASE1.md)"
echo "  2. Add network: RPC http://127.0.0.1:8545, chainId 31337"
echo "  3. npm run dev"
echo "  4. Sign in as a persona → connect matching MetaMask account"
echo ""

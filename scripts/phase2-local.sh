#!/usr/bin/env sh
# Phase II local testnet — deploy Phase I+II contracts, sync env, verify G2.
set -e
cd "$(dirname "$0")/.."

echo "▸ Deploying Phase I + II to localhost..."
npm run deploy:local

echo "▸ Syncing contract addresses..."
npm run sync:env localhost

echo "▸ Running Phase II verification..."
npm run verify:phase2

echo ""
echo "✓ Phase II local setup complete."
echo "  npm run dev  →  test loan + upward funding + savings in UI"
echo ""

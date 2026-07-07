#!/usr/bin/env sh
# Phase III local testnet — deploy Phase I–III contracts, sync env, verify G3.
set -e
cd "$(dirname "$0")/.."

echo "▸ Deploying Phase I + II + III to localhost..."
npm run deploy:local

echo "▸ Syncing contract addresses..."
npm run sync:env localhost

echo "▸ Running Phase III verification..."
npm run verify:phase3

echo ""
echo "✓ Phase III local setup complete."
echo ""
echo "Next:"
echo "  1. npm run ml:dev          # FastAPI on :8000"
echo "  2. npm run dev             # frontend + backend"
echo "  3. Optional: ollama run qwen3:8b  # agent LLM"
echo ""

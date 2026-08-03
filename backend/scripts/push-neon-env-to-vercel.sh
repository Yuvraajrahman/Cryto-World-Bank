#!/usr/bin/env bash
# Push Neon connection strings to Vercel after resetting the role password in Neon Console.
# Usage:
#   cd backend
#   export DATABASE_URL_UNPOOLED='postgresql://neondb_owner:NEW_PASS@...neon.tech/neondb?sslmode=require'
#   ./scripts/push-neon-env-to-vercel.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

UNPOOLED="${DATABASE_URL_UNPOOLED:-}"
if [[ -z "$UNPOOLED" ]]; then
  echo "Set DATABASE_URL_UNPOOLED to the unpooled URL from Neon Console (Connect)." >&2
  exit 1
fi

# Parse user:pass@host/db from unpooled URL
rest="${UNPOOLED#postgresql://}"
creds="${rest%%@*}"
hostpath="${rest#*@}"
USER="${creds%%:*}"
PASS="${creds#*:}"
host="${hostpath%%/*}"
DB="${hostpath#*/}"
DB="${DB%%\?*}"

POOL_HOST="$host"
if [[ "$host" != *"-pooler."* ]]; then
  POOL_HOST="${host/.c-/-pooler.c-}"
fi

DATABASE_URL="postgresql://${USER}:${PASS}@${POOL_HOST}/${DB}?channel_binding=require&sslmode=require"
POSTGRES_PRISMA_URL="postgresql://${USER}:${PASS}@${POOL_HOST}/${DB}?channel_binding=require&connect_timeout=15&sslmode=require"
POSTGRES_URL="postgresql://${USER}:${PASS}@${POOL_HOST}/${DB}?channel_binding=require&sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://${USER}:${PASS}@${host}/${DB}?channel_binding=require&sslmode=require"
POSTGRES_URL_NO_SSL="postgresql://${USER}:${PASS}@${POOL_HOST}/${DB}"

update_env() {
  local name="$1" value="$2"
  for env in production preview development; do
    vercel env rm "$name" "$env" -y 2>/dev/null || true
    printf '%s' "$value" | vercel env add "$name" "$env"
  done
}

echo "Updating Vercel env for cryto-world-bank-api…"
update_env DATABASE_URL "$DATABASE_URL"
update_env DATABASE_URL_UNPOOLED "$UNPOOLED"
update_env POSTGRES_PRISMA_URL "$POSTGRES_PRISMA_URL"
update_env POSTGRES_URL "$POSTGRES_URL"
update_env POSTGRES_URL_NON_POOLING "$POSTGRES_URL_NON_POOLING"
update_env POSTGRES_URL_NO_SSL "$POSTGRES_URL_NO_SSL"
update_env PGPASSWORD "$PASS"
update_env POSTGRES_PASSWORD "$PASS"

NEW_JWT="${JWT_SECRET:-$(openssl rand -hex 32)}"
for env in production development; do
  vercel env rm JWT_SECRET "$env" -y 2>/dev/null || true
  printf '%s' "$NEW_JWT" | vercel env add JWT_SECRET "$env"
done

if grep -q '^NEON_SYNC_URL=' .env 2>/dev/null; then
  sed -i '' "s|^NEON_SYNC_URL=.*|NEON_SYNC_URL=${UNPOOLED}|" .env
fi
vercel env pull .env.vercel --environment=production --yes

echo "Done. Redeploy API: cd backend && vercel --prod"

#!/usr/bin/env bash
# [LEGACY/DISABLED by default as of 2026-08-03] Push local Docker Postgres →
# Neon (one-way). This was used when local Postgres was primary; Neon is
# primary now (see backend/.env), so nothing calls this script automatically
# anymore (SYNC_NEON_ON_START is commented out in backend/.env). Kept for
# manual use if you ever re-enable local-Postgres-primary mode.
#
# Requires:
#   - cwb-postgres container running
#   - NEON_SYNC_URL (direct/unpooled Neon connection string)
#
# Usage:
#   cd backend && NEON_SYNC_URL='postgresql://...' ./scripts/sync-local-to-neon.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LOCAL_CONTAINER="${LOCAL_PG_CONTAINER:-cwb-postgres}"
LOCAL_USER="${LOCAL_PG_USER:-cwb}"
LOCAL_DB="${LOCAL_PG_DB:-crypto_world_bank}"
NEON_URL="${NEON_SYNC_URL:-${DATABASE_URL_UNPOOLED:-}}"

if [[ -z "$NEON_URL" ]]; then
  echo "NEON_SYNC_URL (or DATABASE_URL_UNPOOLED) is required" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$LOCAL_CONTAINER"; then
  echo "Local Postgres container '$LOCAL_CONTAINER' is not running" >&2
  exit 1
fi

LOCK="/tmp/cwb-neon-sync.lock"
if [[ -f "$LOCK" ]]; then
  pid="$(cat "$LOCK" 2>/dev/null || true)"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    echo "Sync already running (pid $pid)" >&2
    exit 0
  fi
fi
echo $$ > "$LOCK"
trap 'rm -f "$LOCK"' EXIT

STAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "[$STAMP] Starting local → Neon sync…"

LOCAL_COUNT="$(docker exec "$LOCAL_CONTAINER" psql -U "$LOCAL_USER" -d "$LOCAL_DB" -tAc 'SELECT COUNT(*) FROM "User";' | tr -d '[:space:]')"
echo "Local users: ${LOCAL_COUNT:-?}"

DUMP_FILE="$(mktemp /tmp/cwb-neon-sync.XXXXXX.sql)"
cleanup() { rm -f "$DUMP_FILE" "$LOCK"; }
trap cleanup EXIT

echo "Dumping local database…"
docker exec "$LOCAL_CONTAINER" pg_dump \
  -U "$LOCAL_USER" \
  -d "$LOCAL_DB" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > "$DUMP_FILE"

echo "Restoring to Neon (this may take several minutes)…"
docker run --rm -i postgres:16-alpine psql "$NEON_URL" -v ON_ERROR_STOP=1 < "$DUMP_FILE"

NEON_COUNT="$(docker run --rm postgres:16-alpine psql "$NEON_URL" -tAc 'SELECT COUNT(*) FROM "User";' 2>/dev/null | tr -d '[:space:]' || echo '?')"
echo "[$STAMP] Done. Neon users: ${NEON_COUNT:-?} (local was ${LOCAL_COUNT:-?})"

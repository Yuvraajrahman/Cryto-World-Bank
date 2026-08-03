#!/usr/bin/env bash
# [LEGACY/DISABLED by default as of 2026-08-03] Pull Neon → local Docker
# Postgres (one-way, reverse of sync-local-to-neon.sh). Not called by
# scripts/start-everything.sh anymore — Neon is primary now, so there's
# nothing local to "catch up". Kept for manual use if you ever re-enable
# local-Postgres-primary mode.
#
# Use this when the Mac was off (or unreachable) and the cloud API/Neon may
# have accepted writes in the meantime. Run this BEFORE the backend starts
# serving traffic so local Postgres catches up, then the normal local → Neon
# push job keeps Neon current going forward.
#
# This is a full clobber of the local database from Neon's snapshot — it is
# NOT a merge. Any local-only writes made while Mac was off will be lost.
# For this project's usage pattern (only one side is "live" at a time), that
# is the correct behavior.
#
# Requires:
#   - cwb-postgres container running
#   - NEON_SYNC_URL (direct/unpooled Neon connection string)
#
# Usage:
#   cd backend && NEON_SYNC_URL='postgresql://...' ./scripts/sync-neon-to-local.sh
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

LOCK="/tmp/cwb-neon-pull.lock"
if [[ -f "$LOCK" ]]; then
  pid="$(cat "$LOCK" 2>/dev/null || true)"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    echo "Pull already running (pid $pid)" >&2
    exit 0
  fi
fi
echo $$ > "$LOCK"

STAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "[$STAMP] Starting Neon → local sync…"

# Use a client image new enough for Neon's server version (Neon tracks recent
# Postgres major versions; pg_dump requires client >= server major version).
DUMP_IMAGE="postgres:17-alpine"

NEON_COUNT="$(docker run --rm "$DUMP_IMAGE" psql "$NEON_URL" -tAc 'SELECT COUNT(*) FROM "User";' 2>/dev/null | tr -d '[:space:]' || echo '?')"
echo "Neon users: ${NEON_COUNT:-?}"

DUMP_FILE="$(mktemp /tmp/cwb-neon-pull.XXXXXX.sql)"
cleanup() { rm -f "$DUMP_FILE" "$LOCK"; }
trap cleanup EXIT

echo "Dumping Neon database…"
# Strip GUCs pg_dump emits that only exist on newer Postgres majors than our
# local server (e.g. `transaction_timeout` is Postgres 17+); harmless to drop
# since these are just pg_dump preamble, not user data.
docker run --rm "$DUMP_IMAGE" pg_dump \
  "$NEON_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  | grep -v -E '^SET (transaction_timeout|idle_session_timeout)\s*=' \
  > "$DUMP_FILE"

echo "Restoring to local Postgres (this may take a minute)…"
docker exec -i "$LOCAL_CONTAINER" psql -U "$LOCAL_USER" -d "$LOCAL_DB" -v ON_ERROR_STOP=1 < "$DUMP_FILE"

LOCAL_COUNT="$(docker exec "$LOCAL_CONTAINER" psql -U "$LOCAL_USER" -d "$LOCAL_DB" -tAc 'SELECT COUNT(*) FROM "User";' | tr -d '[:space:]')"
echo "[$STAMP] Done. Local users: ${LOCAL_COUNT:-?} (Neon was ${NEON_COUNT:-?})"

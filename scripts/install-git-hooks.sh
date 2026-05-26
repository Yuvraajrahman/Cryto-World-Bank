#!/bin/sh
# Point this clone at shared hooks so Cursor attribution never reaches GitHub.
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "install-git-hooks: not a git repository, skipping." >&2
  exit 0
fi

for hook in prepare-commit-msg commit-msg; do
  if [ -f ".githooks/$hook" ]; then
    chmod +x ".githooks/$hook"
  fi
done

current="$(git config --get core.hooksPath 2>/dev/null || true)"
if [ "$current" != ".githooks" ]; then
  git config core.hooksPath .githooks
fi

echo "Git hooks active (.githooks): Cursor attribution will be stripped from commits."

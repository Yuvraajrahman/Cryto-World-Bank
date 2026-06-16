#!/usr/bin/env bash
# Run training inside tmux so SSH disconnect does not kill the job.
# Loadshedding: re-attach after power returns and run ./run.sh again (checkpoints resume).
set -euo pipefail
cd "$(dirname "$0")"

SESSION="cwb-ml-train"

if ! command -v tmux &>/dev/null; then
  echo "tmux not installed. Run: sudo apt install -y tmux"
  echo "Falling back to foreground ./run.sh"
  exec ./run.sh "$@"
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Session '$SESSION' already running. Attach with:"
  echo "  tmux attach -t $SESSION"
  exit 0
fi

tmux new-session -d -s "$SESSION" "cd '$(pwd)' && ./run.sh $*; echo; echo 'Finished — press Enter to close'; read"
echo "Started tmux session: $SESSION"
echo "  Attach:  tmux attach -t $SESSION"
echo "  Detach:  Ctrl+B then D"
echo "  Kill:    tmux kill-session -t $SESSION"

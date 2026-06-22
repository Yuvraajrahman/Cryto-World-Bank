#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
SESSION="cwb-ml-ubuntu"

if ! command -v tmux &>/dev/null; then
  echo "Install: sudo apt install -y tmux"
  exec ./run.sh "$@"
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Attach: tmux attach -t $SESSION"
  exit 0
fi

tmux new-session -d -s "$SESSION" "cd '$(pwd)' && ./run.sh $*; echo; read -p 'Done. Press Enter…'"
echo "Started: tmux attach -t $SESSION"

#!/usr/bin/env bash
# (Re)start the shared local ComfyUI on port 8188 with the project's flags.
# Extra args are appended. Log: ComfyUI/user/comfy8188.log
ROOT=/mnt/storage/Projects/Comfy/ComfyUI
PORT=8188
FLAGS=(--enable-manager --use-ck-attention)
PID=$(ss -ltnp "sport = :$PORT" 2>/dev/null | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
if [ -n "$PID" ]; then
  kill "$PID"
  for _ in $(seq 1 30); do kill -0 "$PID" 2>/dev/null || break; sleep 1; done
fi
cd "$ROOT" || exit 1
nohup ../.venv/bin/python main.py --port "$PORT" "${FLAGS[@]}" "$@" > "$ROOT/user/comfy$PORT.log" 2>&1 &
for _ in $(seq 1 90); do curl -s -o /dev/null "localhost:$PORT/system_stats" && { echo "$PORT up (pid $!) args: ${FLAGS[*]} $*"; exit 0; }; sleep 2; done
echo "$PORT failed to start; see $ROOT/user/comfy$PORT.log"; exit 1

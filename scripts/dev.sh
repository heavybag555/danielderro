#!/bin/sh
# Canonical dev-server launcher — always localhost:3000.
#
# Usage:
#   sh scripts/dev.sh          Start dev server (Turbopack)
#   sh scripts/dev.sh --clean  Wipe Next cache first, then start

set -e

PORT=3000
export PORT

LSOF="/usr/sbin/lsof"
if [ ! -x "$LSOF" ]; then
  LSOF="$(command -v lsof || true)"
fi

# Stop whatever owns :3000 (next-server plus parent `next dev` / npm).
# Killing only the LISTEN child leaves the parent alive; Next then fails
# to bind 3000 or silently moves to another port.
free_port() {
  [ -n "$LSOF" ] || return 0
  for pid in $("$LSOF" -tiTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true); do
    ppid="$(/bin/ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')"
    gppid="$(/bin/ps -o ppid= -p "$ppid" 2>/dev/null | tr -d ' ')"
    kill "$pid" 2>/dev/null || true
    [ -n "$ppid" ] && [ "$ppid" -gt 1 ] && kill "$ppid" 2>/dev/null || true
    [ -n "$gppid" ] && [ "$gppid" -gt 1 ] && kill "$gppid" 2>/dev/null || true
  done
}

free_port
sleep 0.4
# If the old tree is stuck in iCloud I/O, force it off the port.
if [ -n "$LSOF" ] && "$LSOF" -tiTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  for pid in $("$LSOF" -tiTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true); do
    kill -9 "$pid" 2>/dev/null || true
  done
  sleep 0.3
fi

# --clean: wipe both cache dirs (this app uses distDir .next.nosync)
if [ "$1" = "--clean" ]; then
  echo "[dev] Removing Next cache…"
  rm -rf .next .next.nosync
fi

# Source maps stall hard on iCloud Desktop file-provider reads.
exec next dev --turbopack --port "${PORT}" --disable-source-maps

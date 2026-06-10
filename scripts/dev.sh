#!/bin/sh
# Canonical dev-server launcher — always targets localhost:3000.
#
# Usage:
#   sh scripts/dev.sh          Start dev server (Turbopack)
#   sh scripts/dev.sh --clean  Wipe .next cache first, then start

set -e

PORT=3000
export PORT

# Stop any existing listener before touching .next (avoids ENOENT 500s mid-navigation)
for pid in $(lsof -tiTCP:${PORT} -sTCP:LISTEN 2>/dev/null); do
  kill "$pid" 2>/dev/null || true
done
sleep 0.3 2>/dev/null || true

# --clean flag: nuke .next after the old server is gone (fixes manifest/cache corruption)
if [ "$1" = "--clean" ]; then
  echo "[dev] Removing .next cache…"
  rm -rf .next
fi

exec next dev --turbopack --port "${PORT}"

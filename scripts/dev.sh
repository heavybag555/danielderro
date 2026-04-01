#!/bin/sh
# Canonical dev-server launcher — always targets localhost:3000.
#
# Usage:
#   sh scripts/dev.sh          Start dev server (Turbopack)
#   sh scripts/dev.sh --clean  Wipe .next cache first, then start

set -e

PORT=3000

# --clean flag: nuke .next before starting (fixes manifest/cache corruption)
if [ "$1" = "--clean" ]; then
  echo "[dev] Removing .next cache…"
  rm -rf .next
fi

# Kill any process already listening on the port (avoids EADDRINUSE)
for pid in $(lsof -tiTCP:${PORT} -sTCP:LISTEN 2>/dev/null); do
  kill "$pid" 2>/dev/null || true
done

exec next dev --turbopack -p ${PORT}

#!/bin/sh
set -e

echo "[entrypoint] Running schema verification..."
node scripts/ensure-schema.mjs || echo "[entrypoint] Schema check had warnings (non-fatal)"

echo "[entrypoint] Starting Next.js server..."
exec node server.js

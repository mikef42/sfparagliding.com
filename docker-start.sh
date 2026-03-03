#!/bin/sh
set -e

echo "=== SF Paragliding — Starting ==="

# Push database schema and seed admin user if needed
echo "[startup] Running database initialization..."
npx tsx scripts/db-init.ts 2>&1 || {
  echo "[startup] WARNING: DB init had issues, attempting to start anyway..."
}

echo "[startup] Starting Next.js server..."
exec npx next start -H 0.0.0.0 -p 3000

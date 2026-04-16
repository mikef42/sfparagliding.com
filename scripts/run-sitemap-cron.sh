#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

cd "$APP_DIR"

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
CRON_SECRET="${SITEMAP_CRON_SECRET:-${ANALYTICS_CRON_SECRET:-}}"

if [ -z "$CRON_SECRET" ]; then
  echo "[sitemap-cron] Missing SITEMAP_CRON_SECRET and ANALYTICS_CRON_SECRET."
  exit 1
fi

curl -fsS -X POST "${SITE_URL%/}/api/cron/sitemap-settings" \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json"

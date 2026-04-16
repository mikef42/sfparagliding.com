#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
CRON_LOG="${CRON_LOG:-/var/log/sitemap-cron.log}"
CRON_SCHEDULE="${CRON_SCHEDULE:-*/15 * * * *}"
CRON_CMD="cd ${APP_DIR} && /bin/bash ${APP_DIR}/scripts/run-sitemap-cron.sh >> ${CRON_LOG} 2>&1"
CRON_LINE="${CRON_SCHEDULE} ${CRON_CMD}"

EXISTING_CRON="$(crontab -l 2>/dev/null | grep -v 'run-sitemap-cron.sh' || true)"

{
  if [ -n "$EXISTING_CRON" ]; then
    printf '%s\n' "$EXISTING_CRON"
  fi
  printf '%s\n' "$CRON_LINE"
} | crontab -

echo "[sitemap-cron] Installed cron entry:"
echo "$CRON_LINE"

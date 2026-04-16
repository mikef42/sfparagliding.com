#!/usr/bin/env bash
#
# Server-side deploy script for sfparagliding.com (Next.js + Payload)
#
# Triggered by GitHub Actions via SSH. Downloads the latest repo zipball,
# rsyncs preserving runtime data, runs npm install + build + migrations,
# and restarts the PM2 process.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

ROOT="/var/www/sfparagliding.com"
REPO="mikef42/sfparagliding.com"
BRANCH="main"
PM2_NAME="sfparagliding"
LOCK="/tmp/deploy_sfpg.lock"
LOG="$ROOT/deploy.log"
ERRORS=0

mkdir -p "$(dirname "$LOG")"
exec >>"$LOG" 2>&1

fail() { echo "  ERROR: $1"; ERRORS=$((ERRORS + 1)); }

# shellcheck disable=SC1091
source /etc/hetzner-deploy/config.env

if [[ -f "$LOCK" ]] && [[ $(($(date +%s) - $(stat -c %Y "$LOCK"))) -lt 900 ]]; then
    echo "=== Deploy skipped at $(date): already in progress ==="
    exit 0
fi

TMP_ZIP=""
TMP_DIR=""
cleanup() {
    rm -f "$LOCK" "$TMP_ZIP"
    [[ -n "$TMP_DIR" && -d "$TMP_DIR" ]] && rm -rf "$TMP_DIR"
    if [[ -f "$LOG" ]] && [[ $(wc -l <"$LOG") -gt 1000 ]]; then
        tail -1000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
    fi
}
trap cleanup EXIT
echo $$ > "$LOCK"

echo ""
echo "=== Deploy started at $(date) ==="

TMP_ZIP=$(mktemp /tmp/deploy_sfpg_XXXXXX.zip)
TMP_DIR=$(mktemp -d /tmp/deploy_sfpg_extract_XXXXXX)

echo "[1/5] Downloading from GitHub..."
HTTP_CODE=$(curl -sL -o "$TMP_ZIP" -w "%{http_code}" \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "User-Agent: deploy-hetzner" \
    "https://api.github.com/repos/${REPO}/zipball/${BRANCH}")

if [[ "$HTTP_CODE" != "200" ]]; then
    echo "  FATAL: GitHub download returned HTTP $HTTP_CODE"
    exit 1
fi
echo "  Downloaded $(du -h "$TMP_ZIP" | cut -f1)"

unzip -q "$TMP_ZIP" -d "$TMP_DIR"
SOURCE_DIR=$(find "$TMP_DIR" -maxdepth 1 -mindepth 1 -type d | head -1)

echo "[2/5] Syncing code..."
rsync -rlptD --delete --no-owner --no-group \
    --exclude='.git/' \
    --exclude='.github/' \
    --exclude='.claude/' \
    --exclude='.gitignore' \
    --exclude='.playwright-mcp/' \
    --exclude='node_modules/' \
    --exclude='.next/' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='.env.production' \
    --exclude='media/' \
    --exclude='public/media/' \
    --exclude='clone/' \
    --exclude='deploy.sh' \
    --exclude='deploy-server.sh' \
    --exclude='Dockerfile' \
    --exclude='docker-compose.yml' \
    "${SOURCE_DIR}/" "${ROOT}/" \
    && echo "  Sync OK" \
    || fail "rsync had errors"

if [[ -f "${SOURCE_DIR}/deploy-server.sh" ]] && ! cmp -s "${SOURCE_DIR}/deploy-server.sh" "${ROOT}/deploy-server.sh"; then
    cp "${SOURCE_DIR}/deploy-server.sh" "${ROOT}/deploy-server.sh.new"
    chmod +x "${ROOT}/deploy-server.sh.new"
    mv "${ROOT}/deploy-server.sh.new" "${ROOT}/deploy-server.sh"
    echo "  Updated deploy-server.sh"
fi

echo "[3/5] Installing dependencies..."
cd "$ROOT"
npm install --legacy-peer-deps 2>&1 | tail -5 || fail "npm install failed"

echo "[4/5] Building Next.js..."
npm run build 2>&1 | tail -10 || fail "build failed"

echo "[5/5] Running migrations & restarting PM2..."
npx payload migrate 2>&1 | tail -5 || echo "  (no migrations or skipped)"
pm2 restart "$PM2_NAME" 2>&1 | tail -3 || fail "pm2 restart failed"

echo ""
if [[ "$ERRORS" -gt 0 ]]; then
    echo "=== Deploy completed with $ERRORS error(s) at $(date) ==="
else
    echo "=== Deploy completed successfully at $(date) ==="
fi

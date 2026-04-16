#!/usr/bin/env bash
#
# Server-side deploy script for sfparagliding.com (Next.js + Payload)
#
# Safety properties:
#   - Logs outside site root (rsync --delete can't wipe them)
#   - Backs up .next/ before building; on build failure, restores the old build
#     and skips pm2 restart so the site keeps serving the last known-good build.
#   - Concurrent-run lock with 15 min staleness.
#   - Cleans up temp zips, extract dirs, and .next.bak on exit.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

ROOT="/var/www/sfparagliding.com"
REPO="mikef42/sfparagliding.com"
BRANCH="main"
PM2_NAME="sfparagliding"
LOCK="/tmp/deploy_sfpg.lock"
LOG="/var/log/hetzner-deploys/sfpg.log"
NEXT_BAK="$ROOT/.next.bak"
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
    [[ -d "$NEXT_BAK" ]] && rm -rf "$NEXT_BAK"
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

echo "[1/6] Downloading from GitHub..."
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

echo "[2/6] Syncing code..."
rsync -rlptD --delete --no-owner --no-group \
    --exclude='.git/' \
    --exclude='.github/' \
    --exclude='.claude/' \
    --exclude='.gitignore' \
    --exclude='.playwright-mcp/' \
    --exclude='node_modules/' \
    --exclude='.next/' \
    --exclude='.next.bak/' \
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

echo "[3/6] Installing dependencies..."
cd "$ROOT"
if ! npm install --legacy-peer-deps 2>&1 | tail -5; then
    fail "npm install failed — keeping old build running"
    exit 1
fi

echo "[4/6] Backing up current .next/ and building..."
# Hardlink-based backup is fast and space-efficient (cp -al uses hardlinks).
rm -rf "$NEXT_BAK"
if [[ -d "$ROOT/.next" ]]; then
    cp -al "$ROOT/.next" "$NEXT_BAK" 2>/dev/null || cp -a "$ROOT/.next" "$NEXT_BAK"
    echo "  .next/ backed up"
fi

if npm run build 2>&1 | tail -10; then
    echo "  Build succeeded"
    BUILD_OK=1
else
    echo "  BUILD FAILED — restoring old .next/ and skipping pm2 restart"
    rm -rf "$ROOT/.next"
    if [[ -d "$NEXT_BAK" ]]; then
        mv "$NEXT_BAK" "$ROOT/.next"
    fi
    fail "build failed"
    BUILD_OK=0
fi

echo "[5/6] Running migrations..."
if [[ "${BUILD_OK:-0}" == "1" ]]; then
    npx payload migrate 2>&1 | tail -5 || echo "  (no migrations or skipped)"
fi

echo "[6/6] Restarting PM2..."
if [[ "${BUILD_OK:-0}" == "1" ]]; then
    pm2 restart "$PM2_NAME" 2>&1 | tail -3 || fail "pm2 restart failed"
else
    echo "  Skipped (build failed — site keeps running previous build)"
fi

echo ""
if [[ "$ERRORS" -gt 0 ]]; then
    echo "=== Deploy completed with $ERRORS error(s) at $(date) ==="
else
    echo "=== Deploy completed successfully at $(date) ==="
fi

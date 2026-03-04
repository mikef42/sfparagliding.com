#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# SF Paragliding — Deploy to Production
# ═══════════════════════════════════════════════════════════════
# Rsyncs source to the server, installs deps, builds Next.js,
# and restarts the PM2 process.
#
# Usage:  ./deploy.sh
# ═══════════════════════════════════════════════════════════════

SERVER="root@cp.gotoix.com"
APP_DIR="/var/www/sfparagliding.com"
SITE_URL="https://sfparagliding.com"
PM2_NAME="sfparagliding"
DEPLOY_START=$(date +%s)

# ─── Colors ───
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }

HEALTH_OK=true

# ─── Banner ───
echo ""
echo -e "${BOLD}╔════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   SF Paragliding — Production Deployment   ║${NC}"
echo -e "${BOLD}╚════════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════════════════
# 0. Pre-flight
# ═══════════════════════════════════════════════════════
echo -e "${BOLD}[0/4] Pre-flight checks...${NC}"

if ssh "$SERVER" "echo ok" &>/dev/null; then
  ok "SSH connection verified"
else
  fail "Cannot connect to $SERVER — aborting"
  exit 1
fi

# ═══════════════════════════════════════════════════════
# 1. Rsync to Server
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}[1/4] Syncing files to server...${NC}"

RSYNC_OUTPUT=$(rsync -az --delete --stats \
  --exclude='.git/' \
  --exclude='.env' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.DS_Store' \
  --exclude='.claude/' \
  --exclude='.idea/' \
  --exclude='.vscode/' \
  --exclude='deploy.sh' \
  --exclude='Dockerfile' \
  --exclude='docker-compose.yml' \
  --exclude='docker-start.sh' \
  --exclude='Caddyfile' \
  --exclude='media/' \
  --exclude='clone/' \
  --exclude='img/' \
  --exclude='*.png' \
  --exclude='redeploy.sh' \
  --exclude='src/migrations/' \
  ./ "$SERVER:$APP_DIR/" 2>&1)

FILES_TRANSFERRED=$(echo "$RSYNC_OUTPUT" | grep "Number of files transferred" | grep -o '[0-9]*')
ok "Synced ${FILES_TRANSFERRED:-0} file(s)"

# ═══════════════════════════════════════════════════════
# 2. Build on Server
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}[2/4] Building on server...${NC}"

ssh "$SERVER" bash -s <<'REMOTE'
set -euo pipefail
cd /var/www/sfparagliding.com

echo "  Installing dependencies..."
npm install

echo "  Building Next.js..."
NODE_OPTIONS="--max-old-space-size=1536" npm run build
REMOTE

ok "Build complete"

# ═══════════════════════════════════════════════════════
# 3. Restart PM2
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}[3/4] Restarting PM2 process...${NC}"

ssh "$SERVER" "pm2 restart $PM2_NAME"
ok "PM2 restarted"

# ═══════════════════════════════════════════════════════
# 4. Health Check
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}[4/4] Health check...${NC}"

sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$SITE_URL/" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  ok "Homepage → HTTP $HTTP_CODE"
else
  fail "Homepage → HTTP $HTTP_CODE"
  HEALTH_OK=false
fi

HTTP_ADMIN=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$SITE_URL/admin" 2>/dev/null || echo "000")
if [ "$HTTP_ADMIN" = "200" ] || [ "$HTTP_ADMIN" = "302" ]; then
  ok "Admin panel → HTTP $HTTP_ADMIN"
else
  fail "Admin panel → HTTP $HTTP_ADMIN"
  HEALTH_OK=false
fi

# ═══════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════
DEPLOY_END=$(date +%s)
DURATION=$((DEPLOY_END - DEPLOY_START))
MINS=$((DURATION / 60)); SECS=$((DURATION % 60))
[ "$MINS" -gt 0 ] && TIME_STR="${MINS}m ${SECS}s" || TIME_STR="${SECS}s"

echo ""
echo -e "${BOLD}══════════════════════════════════════${NC}"
if [ "$HEALTH_OK" = true ]; then
  echo -e "  ${GREEN}${BOLD}✓ Deployment successful${NC}  (${TIME_STR})"
else
  echo -e "  ${YELLOW}${BOLD}⚠ Deployed with warnings${NC}  (${TIME_STR})"
fi
echo ""
echo -e "  ${CYAN}Site${NC}   $SITE_URL"
echo -e "  ${CYAN}Admin${NC}  $SITE_URL/admin"
echo -e "${BOLD}══════════════════════════════════════${NC}"
echo ""

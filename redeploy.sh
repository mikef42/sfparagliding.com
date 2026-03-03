#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# SF Paragliding — Redeploy (push code + trigger Coolify build)
# ═══════════════════════════════════════════════════════════════

COOLIFY_URL="${COOLIFY_URL:-http://cp.gotoix.com:8000}"
API="${COOLIFY_URL}/api/v1"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# Load saved credentials
if [ -f .deploy-credentials ]; then
  source .deploy-credentials
else
  err "No .deploy-credentials found. Run ./deploy.sh first."
fi

# Get API token
if [ -z "${COOLIFY_TOKEN:-}" ]; then
  err "COOLIFY_TOKEN environment variable is required"
fi

AUTH="Authorization: Bearer ${COOLIFY_TOKEN}"
CT="Content-Type: application/json"

# 1. Push latest code to GitHub
info "Pushing latest code to GitHub..."
git push origin main 2>&1
log "Code pushed"

# 2. Trigger Coolify deployment
info "Triggering Coolify rebuild..."
RESPONSE=$(curl -sS -X POST "${API}/applications/${APP_UUID}/deploy" \
  -H "$AUTH" -H "$CT")

DEPLOY_UUID=$(echo "$RESPONSE" | jq -r '.deployment_uuid // .uuid // "started"')
log "Deployment triggered: ${DEPLOY_UUID}"

echo ""
echo -e "${GREEN}Redeploy initiated!${NC}"
echo "Monitor at: ${COOLIFY_URL}/project/${COOLIFY_PROJECT}/production/application/${APP_UUID}"

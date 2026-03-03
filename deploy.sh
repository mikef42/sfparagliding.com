#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# SF Paragliding — Deploy to Coolify
# ═══════════════════════════════════════════════════════════════
# Commits, pushes, and triggers a full rebuild on Coolify.
#
# Usage:
#   ./deploy.sh                    # auto-generates commit message
#   ./deploy.sh "my commit msg"    # custom commit message
# ═══════════════════════════════════════════════════════════════

COOLIFY_URL="http://cp.gotoix.com:8000"
COOLIFY_TOKEN="OgR76Ww7p5fOApPDADsPoS8Cwmb4AmV0m9cxuKX28e324284"
APP_UUID="c44o4sg4ogs0w8ocg4k4kg40"

# ─── Colors ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

# ─── Check for changes ───
if git diff --quiet HEAD && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  warn "No local changes to commit — deploying current HEAD"
else
  # ─── Stage and commit ───
  info "Staging changes..."
  git add -A

  COMMIT_MSG="${1:-Deploy: $(date +%Y-%m-%d\ %H:%M)}"
  info "Committing: ${COMMIT_MSG}"
  git commit -m "$COMMIT_MSG" || true
fi

# ─── Push to GitHub ───
info "Pushing to GitHub..."
git push origin main || err "Failed to push to GitHub"
log "Code pushed"

# ─── Trigger Coolify rebuild ───
info "Triggering Coolify deployment (force rebuild)..."
RESPONSE=$(curl -sS -X GET \
  "${COOLIFY_URL}/api/v1/deploy?uuid=${APP_UUID}&force=true" \
  -H "Authorization: Bearer ${COOLIFY_TOKEN}" 2>&1)

# Check response
DEPLOY_UUID=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    deps = d.get('deployments', [])
    if deps:
        print(deps[0].get('deployment_uuid', 'unknown'))
    else:
        print('error: ' + json.dumps(d))
except:
    print('error: could not parse response')
" 2>&1)

if [[ "$DEPLOY_UUID" == error:* ]]; then
  err "Deploy failed: ${DEPLOY_UUID}"
fi

log "Deployment triggered: ${DEPLOY_UUID}"

# ─── Monitor build ───
echo ""
info "Monitoring build progress..."
for i in $(seq 1 40); do
  sleep 15
  STATUS=$(curl -sS "${COOLIFY_URL}/api/v1/deployments/${DEPLOY_UUID}" \
    -H "Authorization: Bearer ${COOLIFY_TOKEN}" 2>&1 | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>&1)

  case "$STATUS" in
    finished)
      echo ""
      log "Build complete — site is live!"
      echo ""
      echo -e "  ${GREEN}https://sfparagliding.com${NC}"
      echo -e "  ${GREEN}https://sfparagliding.com/admin${NC}"
      echo ""
      exit 0
      ;;
    failed)
      echo ""
      err "Build failed. Check Coolify logs: ${COOLIFY_URL}"
      ;;
    *)
      printf "\r  Building... (%ds)" $((i * 15))
      ;;
  esac
done

echo ""
warn "Build still in progress after 10 minutes. Check Coolify manually."
echo "  ${COOLIFY_URL}"

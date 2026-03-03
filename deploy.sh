#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# SF Paragliding — Coolify Deployment Script
# ═══════════════════════════════════════════════════════════════
#
# This script deploys the SF Paragliding application to Coolify.
# It creates a PostgreSQL database and the application, then
# links them together with proper environment variables.
#
# Prerequisites:
#   1. A Coolify API token (Settings → API Tokens in Coolify)
#   2. curl and jq installed
#
# Usage:
#   ./deploy.sh
#
# Environment variables (set these or you'll be prompted):
#   COOLIFY_TOKEN    — Coolify API token
#   COOLIFY_URL      — Coolify base URL (default: http://cp.gotoix.com:8000)
#   COOLIFY_SERVER   — Server UUID to deploy to
#   COOLIFY_PROJECT  — Project UUID (optional, creates new if empty)
# ═══════════════════════════════════════════════════════════════

COOLIFY_URL="${COOLIFY_URL:-http://cp.gotoix.com:8000}"
API="${COOLIFY_URL}/api/v1"
GITHUB_REPO="mikef42/sfparagliding.com"
DOMAIN="sfparagliding.com"
APP_NAME="sfparagliding"
DB_NAME="postgres-sfparagliding"

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

# ─── Check prerequisites ───
command -v curl >/dev/null 2>&1 || err "curl is required"
command -v jq   >/dev/null 2>&1 || err "jq is required"

# ─── Get API Token ───
if [ -z "${COOLIFY_TOKEN:-}" ]; then
  echo ""
  echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  SF Paragliding — Coolify Deployment${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
  echo ""
  echo "To deploy, you need a Coolify API token."
  echo "Get one from: ${COOLIFY_URL} → Settings → API Tokens"
  echo ""
  read -rp "Paste your Coolify API token: " COOLIFY_TOKEN
  [ -z "$COOLIFY_TOKEN" ] && err "Token is required"
fi

# ─── Auth header ───
AUTH="Authorization: Bearer ${COOLIFY_TOKEN}"
CT="Content-Type: application/json"

# Helper: Coolify API call
api() {
  local method=$1 endpoint=$2
  shift 2
  curl -sS -X "$method" "${API}${endpoint}" -H "$AUTH" -H "$CT" "$@"
}

# ─── Verify API access ───
info "Verifying Coolify API access..."
VERSION=$(api GET /version 2>/dev/null | tr -d '"' || echo "")
if [ -z "$VERSION" ]; then
  err "Cannot connect to Coolify API at ${COOLIFY_URL}. Check your token."
fi
log "Connected to Coolify ${VERSION}"

# ─── List servers and pick one ───
if [ -z "${COOLIFY_SERVER:-}" ]; then
  info "Fetching available servers..."
  SERVERS_JSON=$(api GET /servers)
  SERVERS=$(echo "$SERVERS_JSON" | jq -r '.[] | "\(.uuid)\t\(.name)\t\(.ip)"')

  if [ -z "$SERVERS" ]; then
    err "No servers found in Coolify"
  fi

  echo ""
  echo "Available servers:"
  echo "──────────────────────────────────────"
  i=1
  declare -a SERVER_UUIDS
  while IFS=$'\t' read -r uuid name ip; do
    echo "  ${i}) ${name} (${ip}) — ${uuid}"
    SERVER_UUIDS[$i]="$uuid"
    ((i++))
  done <<< "$SERVERS"

  echo ""
  read -rp "Select server number [1]: " SERVER_NUM
  SERVER_NUM=${SERVER_NUM:-1}
  COOLIFY_SERVER="${SERVER_UUIDS[$SERVER_NUM]}"
fi
log "Using server: ${COOLIFY_SERVER}"

# ─── List projects and pick/create one ───
if [ -z "${COOLIFY_PROJECT:-}" ]; then
  info "Fetching projects..."
  PROJECTS_JSON=$(api GET /projects)
  PROJECTS=$(echo "$PROJECTS_JSON" | jq -r '.[] | "\(.uuid)\t\(.name)"')

  echo ""
  echo "Available projects:"
  echo "──────────────────────────────────────"
  i=1
  declare -a PROJECT_UUIDS
  while IFS=$'\t' read -r uuid name; do
    echo "  ${i}) ${name} — ${uuid}"
    PROJECT_UUIDS[$i]="$uuid"
    ((i++))
  done <<< "$PROJECTS"
  echo "  ${i}) [Create new project]"
  PROJECT_UUIDS[$i]="NEW"

  echo ""
  read -rp "Select project number [1]: " PROJECT_NUM
  PROJECT_NUM=${PROJECT_NUM:-1}

  if [ "${PROJECT_UUIDS[$PROJECT_NUM]}" = "NEW" ]; then
    info "Creating new project..."
    NEW_PROJECT=$(api POST /projects -d '{"name":"sfparagliding","description":"SF Paragliding e-commerce site"}')
    COOLIFY_PROJECT=$(echo "$NEW_PROJECT" | jq -r '.uuid')
    log "Created project: ${COOLIFY_PROJECT}"
  else
    COOLIFY_PROJECT="${PROJECT_UUIDS[$PROJECT_NUM]}"
  fi
fi
log "Using project: ${COOLIFY_PROJECT}"

# ─── Get environment UUID ───
info "Fetching project environments..."
ENVS_JSON=$(api GET "/projects/${COOLIFY_PROJECT}/environments")
ENV_NAME=$(echo "$ENVS_JSON" | jq -r '.[0].name // "production"')
log "Using environment: ${ENV_NAME}"

# ─── Generate a secure password for the database ───
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
PAYLOAD_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 48)

# ═══════════════════════════════════════════════════════════════
# Step 1: Create PostgreSQL Database
# ═══════════════════════════════════════════════════════════════
echo ""
info "Creating PostgreSQL database..."

DB_RESPONSE=$(api POST /databases -d "{
  \"server_uuid\": \"${COOLIFY_SERVER}\",
  \"project_uuid\": \"${COOLIFY_PROJECT}\",
  \"environment_name\": \"${ENV_NAME}\",
  \"type\": \"postgresql\",
  \"name\": \"${DB_NAME}\",
  \"description\": \"PostgreSQL for SF Paragliding\",
  \"image\": \"postgres:16-alpine\",
  \"postgres_user\": \"sfparagliding\",
  \"postgres_password\": \"${DB_PASSWORD}\",
  \"postgres_db\": \"sfparagliding\",
  \"is_public\": false,
  \"instant_deploy\": true
}")

DB_UUID=$(echo "$DB_RESPONSE" | jq -r '.uuid // empty')
if [ -z "$DB_UUID" ]; then
  warn "Database may already exist. Response: $(echo "$DB_RESPONSE" | jq -c .)"
  echo ""
  read -rp "Enter the DATABASE_URI manually (postgresql://user:pass@host:5432/db): " MANUAL_DB_URI
  DATABASE_URI="$MANUAL_DB_URI"
else
  log "Database created: ${DB_UUID}"
  # Coolify internal networking: database is accessible by service name
  DATABASE_URI="postgresql://sfparagliding:${DB_PASSWORD}@${DB_UUID}:5432/sfparagliding"

  # Wait for database to be ready
  info "Waiting for database to start..."
  sleep 10
  log "Database should be ready"
fi

# ═══════════════════════════════════════════════════════════════
# Step 2: Create Application from GitHub repo
# ═══════════════════════════════════════════════════════════════
echo ""
info "Creating application from GitHub repo..."

APP_RESPONSE=$(api POST /applications -d "{
  \"server_uuid\": \"${COOLIFY_SERVER}\",
  \"project_uuid\": \"${COOLIFY_PROJECT}\",
  \"environment_name\": \"${ENV_NAME}\",
  \"type\": \"dockerfile\",
  \"name\": \"${APP_NAME}\",
  \"description\": \"SF Paragliding — Next.js + Payload CMS\",
  \"git_repository\": \"https://github.com/${GITHUB_REPO}\",
  \"git_branch\": \"main\",
  \"build_pack\": \"dockerfile\",
  \"dockerfile_location\": \"/Dockerfile\",
  \"ports_exposes\": \"3000\",
  \"instant_deploy\": false
}")

APP_UUID=$(echo "$APP_RESPONSE" | jq -r '.uuid // empty')
if [ -z "$APP_UUID" ]; then
  err "Failed to create application. Response: $(echo "$APP_RESPONSE" | jq -c .)"
fi
log "Application created: ${APP_UUID}"

# ═══════════════════════════════════════════════════════════════
# Step 3: Configure environment variables
# ═══════════════════════════════════════════════════════════════
echo ""
info "Setting environment variables..."

# Build the env vars payload
ENV_VARS=$(cat <<ENVJSON
[
  {"key": "DATABASE_URI", "value": "${DATABASE_URI}", "is_build_time": false, "is_preview": false},
  {"key": "PAYLOAD_SECRET", "value": "${PAYLOAD_SECRET}", "is_build_time": false, "is_preview": false},
  {"key": "NEXT_PUBLIC_SERVER_URL", "value": "https://${DOMAIN}", "is_build_time": true, "is_preview": false},
  {"key": "NEXT_PUBLIC_SITE_URL", "value": "https://${DOMAIN}", "is_build_time": true, "is_preview": false},
  {"key": "SQUARE_ENVIRONMENT", "value": "sandbox", "is_build_time": false, "is_preview": false},
  {"key": "SQUARE_ACCESS_TOKEN", "value": "", "is_build_time": false, "is_preview": false},
  {"key": "SQUARE_LOCATION_ID", "value": "", "is_build_time": false, "is_preview": false},
  {"key": "NEXT_PUBLIC_SQUARE_APP_ID", "value": "", "is_build_time": true, "is_preview": false},
  {"key": "NEXT_PUBLIC_SQUARE_LOCATION_ID", "value": "", "is_build_time": true, "is_preview": false}
]
ENVJSON
)

# Set each env var
echo "$ENV_VARS" | jq -c '.[]' | while read -r var; do
  KEY=$(echo "$var" | jq -r '.key')
  api POST "/applications/${APP_UUID}/envs" -d "$var" > /dev/null 2>&1
  log "  Set ${KEY}"
done

# ═══════════════════════════════════════════════════════════════
# Step 4: Configure domain
# ═══════════════════════════════════════════════════════════════
echo ""
info "Configuring domain: ${DOMAIN}..."

api PATCH "/applications/${APP_UUID}" -d "{
  \"domains\": \"https://${DOMAIN}\"
}" > /dev/null 2>&1

log "Domain configured"

# ═══════════════════════════════════════════════════════════════
# Step 5: Deploy
# ═══════════════════════════════════════════════════════════════
echo ""
info "Triggering deployment..."

DEPLOY_RESPONSE=$(api POST "/applications/${APP_UUID}/deploy")
DEPLOY_UUID=$(echo "$DEPLOY_RESPONSE" | jq -r '.deployment_uuid // .uuid // "started"')

log "Deployment triggered: ${DEPLOY_UUID}"

# ═══════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment initiated successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""
echo "  Application UUID:  ${APP_UUID}"
echo "  Database UUID:     ${DB_UUID:-manual}"
echo "  Domain:            https://${DOMAIN}"
echo "  Admin panel:       https://${DOMAIN}/admin"
echo ""
echo "  Monitor deployment at:"
echo "  ${COOLIFY_URL}/project/${COOLIFY_PROJECT}/${ENV_NAME}/application/${APP_UUID}"
echo ""
echo -e "${YELLOW}  Important next steps:${NC}"
echo "  1. Point ${DOMAIN} DNS → your server IP"
echo "  2. Wait for the build to complete (~3-5 minutes)"
echo "  3. Visit https://${DOMAIN}/admin to create your first admin user"
echo "  4. Run the seed script (optional):"
echo "     ssh to server → docker exec into the container → node seed"
echo "  5. Add your Square API keys in Coolify env vars"
echo ""
echo -e "${BLUE}  Credentials saved to: .deploy-credentials${NC}"

# Save credentials locally
cat > .deploy-credentials <<CREDS
# SF Paragliding Deployment Credentials
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# ⚠️  DO NOT COMMIT THIS FILE

APP_UUID=${APP_UUID}
DB_UUID=${DB_UUID:-manual}
DATABASE_URI=${DATABASE_URI}
PAYLOAD_SECRET=${PAYLOAD_SECRET}
DB_PASSWORD=${DB_PASSWORD}
COOLIFY_PROJECT=${COOLIFY_PROJECT}
COOLIFY_SERVER=${COOLIFY_SERVER}
DOMAIN=${DOMAIN}
CREDS

chmod 600 .deploy-credentials
echo ".deploy-credentials" >> .gitignore

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
#   1. A Coolify API token (Settings → API Tokens in Coolify).   4|VnoDP2eaUkCmjovbjBhYPxKZSaxTKL6hC8pfQNYx7e83e49b
#   2. curl and jq installed
#
# Usage:
#   ./deploy.sh
#
# Environment variables (set these or you'll be prompted):
#   COOLIFY_TOKEN    — Coolify API token
#   COOLIFY_URL      — Coolify base URL (default: http://cp.gotoix.com:8000)
#   COOLIFY_SERVER   — Server UUID to deploy to
#   COOLIFY_PROJECT  — Project UUID (default: sfparagliding project)
# ═══════════════════════════════════════════════════════════════

COOLIFY_TOKEN="4|VnoDP2eaUkCmjovbjBhYPxKZSaxTKL6hC8pfQNYx7e83e49b"
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
  err "COOLIFY_TOKEN environment variable is required"
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

  # Auto-select the first server
  FIRST_SERVER_UUID=$(echo "$SERVERS_JSON" | jq -r '.[0].uuid')
  COOLIFY_SERVER="$FIRST_SERVER_UUID"
  log "Auto-selected first server: ${COOLIFY_SERVER}"
fi
log "Using server: ${COOLIFY_SERVER}"

# ─── List projects and pick/create one ───
if [ -z "${COOLIFY_PROJECT:-}" ]; then
  # Use hardcoded sfparagliding project UUID from user context
  COOLIFY_PROJECT="x08k0w8goccgockskkwgog8c"
  log "Using specific project: ${COOLIFY_PROJECT}"
fi

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
  info "Database creation failed, looking for existing one..."
  EXISTING_DBS=$(api GET "/databases")
  EXISTING_DB_UUID=$(echo "$EXISTING_DBS" | jq -r '(.[] | select(.name == "'"${DB_NAME}"'") | .uuid) // empty' | head -n 1)

  if [ -z "$EXISTING_DB_UUID" ]; then
    err "Failed to create database and no existing database found. Response: $(echo "$DB_RESPONSE" | jq -c .)"
  fi
  DB_UUID="$EXISTING_DB_UUID"
  log "Found existing Database: ${DB_UUID}"
  # Extract DB password directly from the server if it already exists to avoid bad credentials
  DB_DETAILS=$(api GET "/databases/${DB_UUID}")
  DB_PASSWORD_REMOTE=$(echo "$DB_DETAILS" | jq -r '.postgres_password // empty')
  DATABASE_URI="postgresql://sfparagliding:${DB_PASSWORD_REMOTE}@${DB_UUID}:5432/sfparagliding"
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
  info "Application creation failed, looking for existing one..."
  EXISTING_APPS=$(api GET "/applications")
  EXISTING_APP_UUID=$(echo "$EXISTING_APPS" | jq -r '(.[] | select(.name == "'"${APP_NAME}"'") | .uuid) // empty' | head -n 1)

  if [ -z "$EXISTING_APP_UUID" ]; then
     err "Failed to create application and no existing application found. Response: $(echo "$APP_RESPONSE" | jq -c .)"
  fi
  APP_UUID="$EXISTING_APP_UUID"
  log "Found existing application: ${APP_UUID}"
fi
log "Using Target Application: ${APP_UUID}"

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

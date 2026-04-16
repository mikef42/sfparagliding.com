#!/usr/bin/env bash
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
SITE_URL="https://sfparagliding.com"
SSH_HOST="pgsf"
REMOTE_DIR="/var/www/sfparagliding.com"
PM2_NAME="sfparagliding"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info() { echo -e "${BLUE}▸${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "  (no args)     Commit, push to GitHub, rsync to server + build & restart"
    echo "  --github      Commit and push to GitHub only"
    echo "  --sync        Rsync to server + build & restart (no git)"
    echo "  --pull        Pull server files → local"
    echo "  --diff        Dry-run showing what would change"
    exit 0
}

# ── Parse args ────────────────────────────────────────────────────────────────
MODE="full"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --help|-h)   usage ;;
        --github)    MODE="github"; shift ;;
        --sync)      MODE="sync"; shift ;;
        --pull)      MODE="pull"; shift ;;
        --diff)      MODE="diff"; shift ;;
        *)           fail "Unknown option: $1" ;;
    esac
done

# ── Rsync excludes ────────────────────────────────────────────────────────────
RSYNC_EXCLUDES=(
    --exclude='.git/'
    --exclude='.env'
    --exclude='node_modules/'
    --exclude='.next/'
    --exclude='.DS_Store'
    --exclude='.claude/'
    --exclude='.idea/'
    --exclude='.vscode/'
    --exclude='deploy.sh'
    --exclude='Dockerfile'
    --exclude='docker-compose.yml'
    --exclude='docker-start.sh'
    --exclude='Caddyfile'
    --exclude='media/'
    --exclude='clone/'
    --exclude='img/'
    --exclude='*.png'
    --exclude='redeploy.sh'
    --exclude='src/migrations/'
    --exclude='.playwright-mcp/'
)

# ── Git commit & push to GitHub ───────────────────────────────────────────────
git_push() {
    cd "$LOCAL_DIR"
    if [[ -n $(git status --porcelain) ]]; then
        info "Staging and committing changes..."
        git add -A
        git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
        ok "Committed"
    else
        info "No local changes to commit"
    fi
    info "Pushing to GitHub..."
    git push origin main
    ok "Pushed to GitHub"
}

# ── Rsync to server + build & restart ────────────────────────────────────────
sync_files() {
    cd "$LOCAL_DIR"
    info "Syncing files to server..."
    rsync -az --delete --stats \
        "${RSYNC_EXCLUDES[@]}" \
        ./ "${SSH_HOST}:${REMOTE_DIR}/"
    ok "Files synced"

    info "Installing dependencies, building & restarting app..."
    ssh "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
cd ${REMOTE_DIR}

echo "  Installing dependencies..."
npm install --legacy-peer-deps 2>&1 | tail -3

echo "  Building Next.js..."
npm run build 2>&1 | tail -5

echo "  Restarting PM2 process..."
pm2 restart ${PM2_NAME}

echo "  Running migrations..."
npx payload migrate 2>/dev/null || true

echo "  Done"
REMOTE
    ok "App built and restarted"
}

# ── Pull server → local ───────────────────────────────────────────────────────
pull_files() {
    cd "$LOCAL_DIR"
    info "Pulling server files → local..."
    rsync -az --stats \
        "${RSYNC_EXCLUDES[@]}" \
        "${SSH_HOST}:${REMOTE_DIR}/" ./
    ok "Pull complete"
}

# ── Diff (dry-run both directions) ───────────────────────────────────────────
show_diff() {
    cd "$LOCAL_DIR"
    echo ""
    info "Changes that would be pushed to server:"
    rsync -az --dry-run --itemize-changes \
        "${RSYNC_EXCLUDES[@]}" \
        ./ "${SSH_HOST}:${REMOTE_DIR}/" | grep '^[<>]' || echo "  (no changes)"

    echo ""
    info "Changes on server not yet pulled:"
    rsync -az --dry-run --itemize-changes \
        "${RSYNC_EXCLUDES[@]}" \
        "${SSH_HOST}:${REMOTE_DIR}/" ./ | grep '^[<>]' || echo "  (no changes)"
    echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════╗"
echo "║   SF Paragliding — Deploy            ║"
echo "╚══════════════════════════════════════╝"
echo ""

case "$MODE" in
    full)
        git_push
        echo ""
        sync_files
        ;;
    github)
        git_push
        ;;
    sync)
        sync_files
        ;;
    pull)
        pull_files
        ;;
    diff)
        show_diff
        ;;
esac

echo ""
ok "Done!  ${SITE_URL}"
echo ""

#!/usr/bin/env zsh
# ─────────────────────────────────────────────────────────────────────────────
# rebuild.sh — Rebuild and reinstall all CSTOL extensions
#
# Usage:
#   ./rebuild.sh              # rebuild + install all three
#   ./rebuild.sh syntax       # only cstol-syntax
#   ./rebuild.sh highlighter  # only cstol-highlighter
#   ./rebuild.sh theme        # only cstol-5-theme
#   ./rebuild.sh --push       # rebuild all + git commit + push
# ─────────────────────────────────────────────────────────────────────────────

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-all}"
PUSH=false
[[ "$1" == "--push" ]] && { TARGET="all"; PUSH=true; }

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo "${GREEN}✓${NC} $1"; }
warn() { echo "${YELLOW}⚠${NC}  $1"; }
err()  { echo "${RED}✗${NC}  $1"; exit 1; }

# Check vsce is available
command -v vsce >/dev/null 2>&1 || err "vsce not found. Run: npm install -g @vscode/vsce"

# ── Detect installed editors ─────────────────────────────────────────────────
HAS_VSCODE=false
HAS_AG=false
command -v code        >/dev/null 2>&1 && HAS_VSCODE=true
command -v antigravity >/dev/null 2>&1 && HAS_AG=true

echo ""
echo "Editors detected:"
$HAS_VSCODE && echo "  ✓ VS Code" || echo "  ✗ VS Code (not found)"
$HAS_AG     && echo "  ✓ Antigravity" || echo "  ✗ Antigravity (not found)"

if ! $HAS_VSCODE && ! $HAS_AG; then
    echo ""
    err "Neither VS Code nor Antigravity CLI found. Nothing to install into. Exiting."
fi

# ── Ask where to install (if both present and running interactively) ──────────
INSTALL_VSCODE=$HAS_VSCODE
INSTALL_AG=$HAS_AG

if $HAS_VSCODE && $HAS_AG && [[ -t 0 ]]; then
    echo ""
    echo "Install target:"
    echo "  1) Both VS Code and Antigravity"
    echo "  2) VS Code only"
    echo "  3) Antigravity only"
    echo "  q) Quit"
    printf "Choice [1]: "
    read -r CHOICE
    case "${CHOICE:-1}" in
        1) ;;
        2) INSTALL_AG=false ;;
        3) INSTALL_VSCODE=false ;;
        q|Q) echo "Aborted."; exit 0 ;;
        *) warn "Invalid choice — defaulting to both" ;;
    esac
elif $HAS_VSCODE && ! $HAS_AG; then
    echo "  → Installing to VS Code only"
elif $HAS_AG && ! $HAS_VSCODE; then
    echo "  → Installing to Antigravity only"
fi
echo ""

build_and_install() {
    local name="$1"
    local dir="$BASE/$name"
    local label="$2"

    echo "── $label ──────────────────────────────────────"
    cd "$dir"

    # Package
    yes | vsce package --allow-missing-repository 2>&1 | grep -E "DONE|error|ERROR" || true
    VSIX=$(ls *.vsix 2>/dev/null | head -1)
    [[ -z "$VSIX" ]] && err "No VSIX produced in $dir"
    SIZE=$(du -sh "$VSIX" | cut -f1)
    ok "Packaged: $VSIX ($SIZE)"

    # Install in VS Code
    if $INSTALL_VSCODE; then
        code --install-extension "$VSIX" --force 2>&1 | tail -1 | grep -q "successfully" \
            && ok "Installed in VS Code" \
            || warn "VS Code install may have failed"
    fi

    # Install in Antigravity
    if $INSTALL_AG; then
        antigravity --install-extension "$VSIX" 2>&1 | tail -1 | grep -q "successfully" \
            && ok "Installed in Antigravity" \
            || warn "Antigravity install may have failed"
    fi
    echo ""
}

echo "CSTOL Extension Rebuilder"
echo "Base: $BASE"

if [[ "$TARGET" == "all" || "$TARGET" == "syntax" ]]; then
    build_and_install "cstol-syntax" "Grammar + Snippets (cstol-syntax)"
fi
if [[ "$TARGET" == "all" || "$TARGET" == "highlighter" ]]; then
    build_and_install "cstol-highlighter" "Background Highlighter (cstol-highlighter)"
fi
if [[ "$TARGET" == "all" || "$TARGET" == "theme" ]]; then
    build_and_install "cstol-5-theme" "CSTOL 5 Theme (cstol-5-theme)"
fi
if [[ "$TARGET" != "all" && "$TARGET" != "syntax" && "$TARGET" != "highlighter" && "$TARGET" != "theme" ]]; then
    err "Unknown target '$TARGET'. Use: syntax | highlighter | theme | --push | (empty for all)"
fi

# Git commit + push if requested
if $PUSH; then
    echo ""
    echo "── Git ─────────────────────────────────────────"
    cd "$BASE"
    if git diff --quiet && git diff --staged --quiet; then
        warn "No changes to commit"
    else
        MSG="${COMMIT_MSG:-Rebuild: update CSTOL extensions}"
        git add -A
        git commit -m "$MSG

Co-Authored-By: Oz <oz-agent@warp.dev>"
        git push
        ok "Committed and pushed"
    fi
fi

echo ""
echo "─────────────────────────────────────────────────"
ok "Done. Reload both editors:"
echo "   Cmd+Shift+P → Developer: Reload Window"

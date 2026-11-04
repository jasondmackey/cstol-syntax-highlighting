#!/usr/bin/env bash
# Install the CSTOL syntax + CSTOL 5 theme into bat, so `bat file.prc`
# shows highlighted procedures in any terminal (Warp, Ghostty, iTerm, ...).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
BAT="$(command -v bat || command -v batcat || true)"
[[ -z "$BAT" ]] && { echo "bat not found — install it first (brew install bat)"; exit 1; }

CFG="$("$BAT" --config-dir)"
mkdir -p "$CFG/syntaxes" "$CFG/themes"
cp "$HERE/bat/CSTOL.sublime-syntax" "$CFG/syntaxes/"
cp "$HERE/../CSTOL 5.tmTheme" "$CFG/themes/"
"$BAT" cache --build >/dev/null
echo "✓ Installed into $CFG"
echo "  Try:  $(basename "$BAT") --theme='CSTOL 5' your_proc.prc"
echo "  Make it the default for .prc only by adding to $CFG/config:"
echo "        --map-syntax='*.prc:CSTOL'"

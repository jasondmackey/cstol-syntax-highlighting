# CSTOL Syntax Highlighting — Installation & Editing Guide

## What's Included

| File | Purpose |
|---|---|
| `cstol-syntax-1.0.0.vsix` | Language extension — registers `.prc` files as CSTOL |
| `cstol-highlighter-1.0.0.vsix` | Background decorator — applies colored highlights |
| `cstol-5-theme-1.0.0.vsix` | CSTOL 5 color theme (Monokai-based dark theme) |
| `settings_snippet.json` | Required settings for `goto` purple highlight |

---

## Installation

### Step 1 — Install the three extensions

**VS Code:**
```bash
code --install-extension cstol-syntax-1.0.0.vsix
code --install-extension cstol-highlighter-1.0.0.vsix
code --install-extension cstol-5-theme-1.0.0.vsix
```

**Antigravity IDE:**
```bash
antigravity --install-extension cstol-syntax-1.0.0.vsix
antigravity --install-extension cstol-highlighter-1.0.0.vsix
antigravity --install-extension cstol-5-theme-1.0.0.vsix
```

**Cursor:**
```bash
cursor --install-extension cstol-syntax-1.0.0.vsix
cursor --install-extension cstol-highlighter-1.0.0.vsix
cursor --install-extension cstol-5-theme-1.0.0.vsix
```

Or via the Extensions panel: `Extensions` → `...` → `Install from VSIX...`

### Step 2 — Add the settings snippet

Open your user `settings.json`:
- **VS Code**: `Cmd+Shift+P` → `Preferences: Open User Settings (JSON)`
- **Antigravity**: `Cmd+Shift+P` → `Preferences: Open User Settings (JSON)`

Add the following inside the root `{}` object (merge with existing content):

```json
"editor.tokenColorCustomizations": {
    "textMateRules": [
        {
            "scope": "keyword.control.flow.goto.cstol",
            "settings": {
                "foreground": "#DA70D6",
                "fontStyle": "bold"
            }
        }
    ]
}
```

> If you already have an `editor.tokenColorCustomizations` block, add the `textMateRules` array inside it.

### Step 3 — Set the color theme

`Cmd+Shift+P` → **Color Theme** → select **CSTOL 5**

### Step 4 — Remove conflicting extensions

> ⚠️ **Critical:** If you have an older `prc` grammar extension installed (e.g. `undefined_publisher.prc`), it will **completely override** `cstol-syntax` and nothing will look correct. Remove it:

```bash
# VS Code
rm -rf ~/.vscode/extensions/undefined_publisher.prc-*

# Antigravity
rm -rf ~/.antigravity/extensions/undefined_publisher.prc-*

# Cursor
rm -rf ~/.cursor/extensions/undefined_publisher.prc-*
```

Or: Extensions panel → right-click the old `prc` extension → **Uninstall**.

### Step 5 — Reload

`Cmd+Shift+P` → **Developer: Reload Window**

---

## What the Highlighting Does

| Token | Appearance |
|---|---|
| `wait` statements | Orange background, entire line |
| `goto` / `GOTO` | Purple background on keyword |
| `start` statements | Bright green background, entire line |
| `BEGINPROC:`, `FINISH:`, labels | Black text on sky blue background |
| `declare`, `write`, `cmd`, `check`, `if`, `else`… | Teal/cyan text |
| `$variables`, `$$specials` | Orange italic text |
| Comments (`;`) | Brown/gray text |
| Strings | Yellow-green text |
| Numbers | Purple text |

---

## Making Edits

### Change highlight colors

No rebuild needed: set `cstol.highlight.waitColor`, `gotoColor`, `startColor` or `labelColor` (and `…Enabled`) in your settings. To change the built-in defaults, edit `DEFAULTS` at the top of `cstol-highlighter/extension.js`, and the matching `default` values in `cstol-highlighter/package.json`. For example, in `settings.json`:

```json
"cstol.highlight.waitColor": "rgba(255, 165, 0, 0.5)",
"cstol.highlight.labelEnabled": false
```

After editing the extension source, rebuild and reinstall with `./rebuild.sh highlighter`.

### Add new highlighted keywords

In `cstol-highlighter/extension.js`, add a new pattern alongside the existing ones:

```javascript
// Example: highlight 'hazard' keyword in red
const HAZARD_RE = /\bhazard\b/gi;
```

Then add an entry to `DEFAULTS` (which creates the decoration type) and collect its ranges in `applyDecorations`, the same way as `wait`.

### Add new CSTOL keywords to syntax highlighting

Edit `cstol-syntax/syntaxes/cstol.tmLanguage.json`. For example, to add `elseif`:

```json
{
    "name": "keyword.control.conditional.cstol",
    "match": "\\b(?i:if|elseif|else|endif|end\\s+if)\\b"
}
```

Rebuild and reinstall:
```bash
cd cstol-syntax
vsce package --allow-missing-repository
code --install-extension cstol-syntax-1.0.0.vsix --force
antigravity --install-extension cstol-syntax-1.0.0.vsix
```

### Change the color theme's base colors

Edit `CSTOL 5.tmTheme` (XML plist format) or `cstol-wait-theme.json` (VS Code JSON format).
Then repackage using `vsce package` in the respective folder.

---

## Source Code

All source files are in the `cstol-syntax-highlighting` repository:
- **Grammar**: `cstol-syntax/syntaxes/cstol.tmLanguage.json`
- **Decorator**: `cstol-highlighter/extension.js`
- **CSTOL 5 theme**: `CSTOL 5.tmTheme` and `cstol-5-theme/themes/CSTOL 5.tmTheme`
- **CSTOL Dark theme**: `cstol-wait-theme.json`

**Prerequisite for building**: `npm install -g @vscode/vsce`

# cstol-syntax-highlighting

VSCode and Antigravity IDE extensions for **CSTOL** (Command Scripting Tool for On-board Logic) — the command scripting language used in spacecraft ground support systems at LASP. Provides syntax highlighting, Sublime Text-style background highlights, code snippets, and mission-specific procedure completions for `.prc` files.

## Latest Release

**[v1.2.0](https://github.com/jasondmackey/cstol-syntax-highlighting/releases/latest)** — Download `cstol-syntax-highlighting-dist.zip` from the release page for a ready-to-install package.

## Extensions

| Extension | Description |
|---|---|
| `cstol-syntax/` | Language grammar — registers `.prc` as CSTOL, provides token scopes, snippets, and mission completions |
| `cstol-highlighter/` | Background decorator — Sublime Text-style colored highlights via VS Code decoration API |
| `cstol-5-theme/` | CSTOL 5 color theme — Monokai-based dark theme optimized for CSTOL |
| `cstol-wait-theme.json` | CSTOL Dark Theme (alternate) — VS Code JSON theme format |

---

## Installation

### Quick Install (recommended)

Download `cstol-syntax-highlighting-dist.zip` from the **[latest release](https://github.com/jasondmackey/cstol-syntax-highlighting/releases/latest)**, unzip, then:

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

Or drag each `.vsix` onto the Extensions panel.

### Required settings

Add to your `settings.json` (`Cmd+Shift+P` → *Preferences: Open User Settings JSON*):

```json
"editor.tokenColorCustomizations": {
    "textMateRules": [{
        "scope": "keyword.control.flow.goto.cstol",
        "settings": { "foreground": "#DA70D6", "fontStyle": "bold" }
    }]
}
```

The `settings_snippet.json` in the dist zip contains this ready to copy-paste.

### Activate the theme

`Cmd+Shift+P` → **Color Theme** → **CSTOL 5**

### Reload

`Cmd+Shift+P` → **Developer: Reload Window**

> ⚠️ **Critical:** If you have an older `prc` grammar extension installed (e.g. `undefined_publisher.prc`), it will completely override `cstol-syntax` and nothing will look correct. Remove it with `rm -rf ~/.vscode/extensions/undefined_publisher.prc-*` before reloading.

### Build from source

```bash
npm install -g @vscode/vsce
cd cstol-syntax && vsce package --allow-missing-repository
cd cstol-highlighter && vsce package --allow-missing-repository
cd cstol-5-theme && vsce package --allow-missing-repository
```

---

## Syntax Highlighting

### Background highlights (via decorator extension)

| Token | Highlight | Notes |
|---|---|---|
| `wait` statements | Orange background, entire line | Skips keywords inside strings/comments |
| `goto` / `GOTO` | Purple background on keyword | Case-insensitive |
| `start` statements | Bright green background, entire line | |
| Labels (`BEGIN:`, `FINISH:`) | Black text on sky blue background | |

### Token colors (via CSTOL 5 theme)

| Token | Color | Example |
|---|---|---|
| Keywords (`if`, `else`, `declare`, `write`…) | Cyan `#00FFFF` | `if $$ERROR = TIME_OUT` |
| `$variables` / `$$specials` | Orange italic `#FD971F` | `$MASK_TIME`, `$$CURRENT_TIME` |
| Comments (`;`) | Brown `#75715E` | `; this is a comment` |
| Strings | Yellow-green `#E6DB74` | `"<C> message"` |
| Numbers | Purple `#AE81FF` | `00:01:00` |
| Labels | Sky blue `#87CEEB` | `BEGIN:` |
| `goto` / `GOTO` | Orchid `#DA70D6` bold | `GOTO TMON_64` |

---

## Snippets

Type a prefix in any `.prc` file and press **Tab**:

| Prefix | Expands to |
|---|---|
| `if` | `if condition` / `endif` block |
| `loop` | `loop condition` / `end loop` block |
| `ask` | `ask $var "Question"` |
| `proc` | Full `proc` / `LABEL:` / `endproc` skeleton |
| `declare` | `declare INPUT $var = value` |
| `wait` | `wait ... or for 00:00:30` |
| `write` | `write "<C> message"` |
| `if $$error` | `$$error = TIME_OUT` check block with return |

---

## Mission Procedure Completions

Start typing any procedure name — IntelliSense shows the full call with tab-stop parameter placeholders. 3,673 completions across 5 missions:

| Mission | Procedures |
|---|---|
| AIM | 1,029 |
| MMS | 601 |
| QSCAT | 346 |
| Kepler | 264 |
| SORCE | 1,433 |

Converted from the original Sublime Text `.sublime-completions` format. To add a new mission, create a VS Code snippet JSON file in `cstol-syntax/snippets/` and register it in `package.json`.

---

## Grammar Scopes

The grammar (`cstol-syntax/syntaxes/cstol.tmLanguage.json`) emits these TextMate scopes:

| Scope | Matches |
|---|---|
| `keyword.control.wait.cstol` | `wait` (case-insensitive) |
| `keyword.control.flow.goto.cstol` | `goto` / `GOTO` |
| `keyword.control.flow.cstol` | `return` |
| `keyword.control.conditional.cstol` | `if`, `elseif`, `else`, `endif` |
| `keyword.control.command.cstol` | `cmd`, `write`, `proc`, `endproc`, `check`, `let`, `set`, `begin`, `ask`, `declare` |
| `variable.parameter.cstol` | `$variable` |
| `variable.parameter.special.cstol` | `$$special` |
| `variable.parameter.error.cstol` | `$$ERROR` |
| `entity.name.label.cstol` | `LABEL:` |
| `string.quoted.double.cstol` | `"string"` |
| `comment.line.semicolon.cstol` | `; comment` |
| `constant.numeric.*` | integers, floats, hex |
| `constant.other.enum.cstol` | known enum values |
| `entity.name.type.cstol` | known type identifiers |

---

## Related

- [INSTALL.md](INSTALL.md) — detailed installation and editing guide
- [ct2vsix](https://github.com/jasondmackey/ct2vsix) — macOS-compatible tool for packaging color theme JSON as VSIX

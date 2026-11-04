# cstol-syntax-highlighting

Editor and terminal support for **CSTOL** (Command Scripting Tool for On-board Logic) — the command scripting language used in spacecraft ground support systems at LASP. Provides syntax highlighting, Sublime Text-style background highlights, code snippets, and mission-specific procedure completions for `.prc` files.

| Editor / tool | Highlighting | Background highlights | Snippets + completions | Theme |
|---|---|---|---|---|
| VS Code, Cursor, Antigravity, Windsurf, VSCodium | ✅ | ✅ | ✅ | ✅ CSTOL 5 |
| Zed | ✅ (Tree-sitter) | — ¹ | — | use any Zed theme |
| Warp, Ghostty (and any terminal) | ✅ via `bat` | — | — | ✅ CSTOL 5 (terminal palette + `bat` theme) |

¹ Zed has no extension API for custom background decorations yet, so `wait`/`start`/`goto`/label highlights show up as colored keywords only.

## Latest Release

**[v1.2.0](https://github.com/jasondmackey/cstol-syntax-highlighting/releases/latest)** — Download `cstol-syntax-highlighting-dist.zip` from the release page for a ready-to-install package.

## Extensions

| Extension | Description |
|---|---|
| `cstol-syntax/` | Language grammar — registers `.prc` as CSTOL, provides token scopes, snippets, and mission completions |
| `cstol-highlighter/` | Background decorator — Sublime Text-style colored highlights via VS Code decoration API |
| `cstol-5-theme/` | CSTOL 5 color theme — Monokai-based dark theme optimized for CSTOL |
| `cstol-wait-theme.json` | CSTOL Dark Theme (alternate) — VS Code JSON theme format |
| `tree-sitter-cstol/` | Tree-sitter grammar (used by Zed; also usable from Neovim/Helix) |
| `zed/` | Zed extension |
| `terminal/` | `bat` syntax, plus Ghostty and Warp CSTOL 5 themes |

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

**Cursor:**
```bash
cursor --install-extension cstol-syntax-1.0.0.vsix
cursor --install-extension cstol-highlighter-1.0.0.vsix
cursor --install-extension cstol-5-theme-1.0.0.vsix
```
(No `cursor` command? In Cursor: `Cmd+Shift+P` → **Shell Command: Install 'cursor' command**.)

Or drag each `.vsix` onto the Extensions panel. `./rebuild.sh` builds and installs into every one of VS Code, Cursor and Antigravity it finds.

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

### Zed

1. `Cmd+Shift+P` → **zed: install dev extension** → choose the `zed/` folder of this repo.
2. Open any `.prc` file. The language indicator in the status bar should read **CSTOL**.

Zed fetches the grammar from this GitHub repo at the commit pinned in `zed/extension.toml` (`rev`). After changing `tree-sitter-cstol/grammar.js`, run `npx tree-sitter-cli generate` inside `tree-sitter-cstol/`, commit and push, then update `rev` to that commit. Before pushing, you can test locally by pointing `repository` at `file:///path/to/cstol-syntax-highlighting`.

### Warp and Ghostty

Warp and Ghostty are terminals. They can't add languages to their built-in editors, so the way to read highlighted `.prc` files in them is [`bat`](https://github.com/sharkdp/bat) (`brew install bat`):

```bash
./terminal/install-bat.sh
```
```bash
bat --theme='CSTOL 5' my_proc.prc
```

Matching terminal color themes:

- **Ghostty:** `mkdir -p ~/.config/ghostty/themes && cp "terminal/ghostty/CSTOL 5" ~/.config/ghostty/themes/`, then add `theme = CSTOL 5` to `~/.config/ghostty/config`.
- **Warp:** `mkdir -p ~/.warp/themes && cp terminal/warp/cstol_5.yaml ~/.warp/themes/`, then pick **CSTOL 5** in Settings → Appearance → Themes.

Tip: set `export EDITOR=zed` or `export EDITOR=cursor` in your shell so opening a `.prc` from Warp or Ghostty goes to a fully highlighted editor.

### Build from source

```bash
npm install -g @vscode/vsce
(cd cstol-syntax && vsce package)
(cd cstol-highlighter && vsce package)
(cd cstol-5-theme && vsce package)
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

Each highlight can be recolored or turned off in Settings (search **CSTOL Highlighter**), e.g.:

```json
"cstol.highlight.waitColor": "rgba(255, 165, 0, 0.5)",
"cstol.highlight.startEnabled": false
```

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
| `keyword.control.start.cstol` | `start` |
| `keyword.control.loop.cstol` | `loop`, `end loop` |
| `keyword.control.conditional.cstol` | `if`, `elseif`, `else`, `endif` |
| `keyword.control.command.cstol` | `cmd`, `write`, `proc`, `endproc`, `check`, `let`, `set`, `begin`, `ask`, `declare` |
| `variable.parameter.cstol` | `$variable` |
| `variable.parameter.special.cstol` | `$$special` |
| `variable.parameter.error.cstol` | `$$ERROR` |
| `entity.name.label.cstol` | `LABEL:` |
| `string.quoted.double.cstol` | `"string"` (an unclosed string ends at end of line) |
| `comment.line.semicolon.cstol` | `; comment` |
| `constant.numeric.*` | integers, floats, hex |
| `constant.other.enum.cstol` | known enum values |
| `entity.name.type.cstol` | known type identifiers |

---

## Related

- [INSTALL.md](INSTALL.md) — detailed installation and editing guide
- [ct2vsix](https://github.com/jasondmackey/ct2vsix) — macOS-compatible tool for packaging color theme JSON as VSIX

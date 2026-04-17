# cstol-syntax-highlighting

VSCode / Antigravity IDE extensions for **CSTOL** — a command scripting language used in spacecraft ground support systems. Provides syntax highlighting for `.prc` files and a matching dark color theme.

## Contents

| Path | Description |
|---|---|
| `cstol-syntax/` | Language extension — registers `.prc` as CSTOL and provides a TextMate grammar |
| `cstol-wait-theme.json` | CSTOL Dark Theme source — highlights `wait` (yellow) and `goto` (purple) distinctively |

---

## Installation

### Option A — Install pre-built VSIX

**VS Code:**
```bash
code --install-extension cstol-syntax-1.0.0.vsix
code --install-extension cstol-wait-theme-0.1.0.vsix
```

**Antigravity IDE:**
```bash
antigravity --install-extension cstol-syntax-1.0.0.vsix
antigravity --install-extension cstol-wait-theme-0.1.0.vsix
```

After installing, reload the window (`Ctrl/Cmd+Shift+P` → **Developer: Reload Window**).

### Option B — Build from source

**Prerequisites:**
```bash
npm install -g @vscode/vsce
```

**Build the language extension:**
```bash
cd cstol-syntax
vsce package --allow-missing-repository
```

**Build the theme** (requires [ct2vsix](https://github.com/jasondmackey/ct2vsix)):
```bash
python3 /path/to/ct2vsix/ct2vsix.py cstol-wait-theme.json
```

---

## Activating the Theme

1. Open the Command Palette (`Ctrl/Cmd+Shift+P`)
2. Select **Preferences: Color Theme**
3. Choose **CSTOL Dark Theme**

---

## Token Colors

| Token | Color | Style | Example |
|---|---|---|---|
| `wait` | Black on yellow `#FFFF00` | Bold | `wait IXPE SWTM064T = CLR or for 00:00:30` |
| `goto` / `GOTO` | Black on purple `#CCA8DD` | Bold | `GOTO TMON_64` |
| Comments (`;`) | Green `#6A9955` | Italic | `; this is a comment` |
| Commands (`cmd`, `write`, `proc`…) | Yellow `#DCDCAA` | | `cmd IXPE TMONCFGONE with …` |
| Control flow (`if`, `else`, `return`…) | Blue `#569CD6` | | `if $$error = TIME_OUT` |
| Variables (`$VAR`) | Light blue `#9CDCFE` | | `$MASK_TIME` |
| Special variables (`$$VAR`) | Light blue `#9CDCFE` | | `$$CURRENT_TIME` |
| Labels | Light blue `#9CDCFE` | Bold | `BEGIN:` |
| Strings | Orange `#CE9178` | | `"<G> TMON 64 reset"` |
| Numbers | Light green `#B5CEA8` | | `00:00:30` |
| Enum/type constants | Teal `#4EC9B0` | | `TIME_OUT`, `CONNECTED` |

---

## Grammar Scopes

The grammar (`cstol-syntax/syntaxes/cstol.tmLanguage.json`) emits the following TextMate scopes:

| Scope | Matches |
|---|---|
| `keyword.control.wait.cstol` | `wait` (case-insensitive) |
| `keyword.control.flow.goto.cstol` | `goto` / `GOTO` (case-insensitive) |
| `keyword.control.flow.cstol` | `return` |
| `keyword.control.conditional.cstol` | `if`, `else`, `endif`, `end if` |
| `keyword.control.command.cstol` | `cmd`, `write`, `proc`, `endproc`, `check`, `let`, `set`, `begin`, `ask`, `declare` |
| `variable.other.cstol` | `$variable` |
| `variable.language.special.cstol` | `$$special` |
| `variable.language.error.cstol` | `$$ERROR` |
| `entity.name.label.cstol` | `LABEL:` |
| `string.quoted.double.cstol` | `"string"` |
| `comment.line.semicolon.cstol` | `; comment` |
| `constant.numeric.*` | integers, floats, hex |
| `constant.language.boolean.cstol` | `true`, `false` |
| `constant.other.enum.cstol` | known enum values |
| `variable.other.constant.cstol` | `ALL_CAPS` identifiers |
| `entity.name.type.cstol` | known type identifiers |

---

## Related

- [ct2vsix](https://github.com/jasondmackey/ct2vsix) — macOS-compatible fork of the tool used to package the theme JSON into a VSIX

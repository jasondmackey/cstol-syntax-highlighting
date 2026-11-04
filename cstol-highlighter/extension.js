'use strict';
// CSTOL background highlighter.
// Uses only the stable VS Code decoration API, so it runs unchanged in
// VS Code, Cursor, Windsurf, VSCodium and Antigravity.
const vscode = require('vscode');

// ── Defaults (overridable via `cstol.highlight.*` settings) ─────────────────

const DEFAULTS = {
    wait:  { backgroundColor: 'rgba(255, 165, 0, 0.85)', color: '#000000' },
    goto:  { backgroundColor: '#CCA8DD', color: '#000000', fontWeight: 'bold' },
    start: { backgroundColor: 'rgba(0, 255, 0, 0.70)',   color: '#000000' },
    label: { backgroundColor: '#87CEEB', color: '#000000' }
};
const KINDS = Object.keys(DEFAULTS);

let decos = {};

function buildDecorations() {
    Object.values(decos).forEach(d => d.dispose());
    const cfg = vscode.workspace.getConfiguration('cstol.highlight');
    decos = {};
    for (const kind of KINDS) {
        decos[kind] = vscode.window.createTextEditorDecorationType({
            ...DEFAULTS[kind],
            ...(cfg.get(`${kind}Color`) ? { backgroundColor: cfg.get(`${kind}Color`) } : {}),
            borderRadius: kind === 'wait' || kind === 'start' ? undefined : '2px'
        });
    }
}

function isEnabled(kind) {
    return vscode.workspace.getConfiguration('cstol.highlight').get(`${kind}Enabled`, true);
}

// ── Patterns ─────────────────────────────────────────────────────────────────

const WAIT_RE  = /\bwait\b/i;
const START_RE = /\bstart\b/i;
const GOTO_RE  = /\bgoto\b/gi;
const LABEL_RE = /^([ \t]*)([A-Za-z_][A-Za-z0-9_]*[ \t]*:)/;

// ── Line scanning ────────────────────────────────────────────────────────────

// One pass: returns the code portion (before any `;` comment) and the
// quoted-string ranges within it. A string left open at end of line runs to
// the end of the line, matching the grammar.
function scanLine(text) {
    const strings = [];
    let strStart = -1;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') {
            if (strStart < 0) { strStart = i; }
            else { strings.push([strStart, i]); strStart = -1; }
        } else if (ch === ';' && strStart < 0) {
            return { code: text.slice(0, i), strings };
        }
    }
    if (strStart >= 0) { strings.push([strStart, text.length]); }
    return { code: text, strings };
}

const inString = (pos, strings) => strings.some(([s, e]) => pos > s && pos < e);

// First match of `re` in `code` that is not inside a string literal.
function firstOutsideString(re, code, strings) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = g.exec(code)) !== null) {
        if (!inString(m.index, strings)) { return m; }
    }
    return null;
}

function range(lineNo, from, len) {
    return new vscode.Range(lineNo, from, lineNo, from + len);
}

// ── Decoration logic ─────────────────────────────────────────────────────────

function applyDecorations(editor) {
    if (!editor || editor.document.languageId !== 'cstol') { return; }

    const out = { wait: [], goto: [], start: [], label: [] };
    const doc = editor.document;

    for (let li = 0; li < doc.lineCount; li++) {
        const raw = doc.lineAt(li).text;
        if (!raw.trim()) { continue; }

        const { code, strings } = scanLine(raw);
        const lead = raw.search(/\S/);
        const wholeLine = range(li, lead, raw.trimEnd().length - lead);

        if (firstOutsideString(WAIT_RE, code, strings))  { out.wait.push(wholeLine); }
        if (firstOutsideString(START_RE, code, strings)) { out.start.push(wholeLine); }

        const g = new RegExp(GOTO_RE.source, GOTO_RE.flags);
        let m;
        while ((m = g.exec(code)) !== null) {
            if (!inString(m.index, strings)) { out.goto.push(range(li, m.index, m[0].length)); }
        }

        const lm = LABEL_RE.exec(raw);
        if (lm) { out.label.push(range(li, lm[1].length, lm[2].trimEnd().length)); }
    }

    for (const kind of KINDS) {
        editor.setDecorations(decos[kind], isEnabled(kind) ? out[kind] : []);
    }
}

function refreshVisible() {
    vscode.window.visibleTextEditors.forEach(applyDecorations);
}

// Coalesce bursts of edits (typing, paste, multi-cursor) into one rescan.
let timer;
function scheduleRefresh(delay = 120) {
    clearTimeout(timer);
    timer = setTimeout(refreshVisible, delay);
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

function activate(context) {
    buildDecorations();
    refreshVisible();

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => scheduleRefresh(0)),
        vscode.window.onDidChangeVisibleTextEditors(() => scheduleRefresh(0)),
        vscode.workspace.onDidChangeTextDocument(ev => {
            if (ev.document.languageId === 'cstol') { scheduleRefresh(); }
        }),
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.languageId === 'cstol') { scheduleRefresh(0); }
        }),
        vscode.workspace.onDidChangeConfiguration(ev => {
            if (ev.affectsConfiguration('cstol.highlight')) {
                buildDecorations();
                refreshVisible();
            }
        })
    );
}

function deactivate() {
    clearTimeout(timer);
    Object.values(decos).forEach(d => d.dispose());
    decos = {};
}

module.exports = { activate, deactivate };

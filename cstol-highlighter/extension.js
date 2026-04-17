'use strict';
const vscode = require('vscode');

// ── Decoration types ─────────────────────────────────────────────────────────

let waitDeco, gotoDeco, startDeco, labelDeco;

function createDecorations() {
    // wait: full text of the line, bright orange, no bold
    waitDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 165, 0, 0.85)',
        color: '#000000'
    });
    // goto: keyword only, purple
    gotoDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#CCA8DD',
        color: '#000000',
        fontWeight: 'bold',
        borderRadius: '2px'
    });
    // start: full text of the line, bright green, no bold
    startDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0, 255, 0, 0.70)',
        color: '#000000'
    });
    // label: just the label token, black on sky blue
    labelDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#87CEEB',
        color: '#000000',
        borderRadius: '2px'
    });
}

// ── Patterns ─────────────────────────────────────────────────────────────────

const WAIT_RE  = /\bwait\b/gi;
const GOTO_RE  = /\bgoto\b/gi;
const START_RE = /\bstart\b/gi;
const LABEL_RE = /^[ \t]*([A-Za-z_][A-Za-z0-9_]*[ \t]*:)/;

// ── Comment and string detection ────────────────────────────────────────────

function commentStart(text) {
    let inStr = false;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '"') { inStr = !inStr; }
        else if (text[i] === ';' && !inStr) { return i; }
    }
    return text.length;
}

// Returns [[strStart, strEnd], ...] for each quoted string on the line
function stringRanges(text) {
    const ranges = [];
    let inStr = false, start = -1;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '"') {
            if (!inStr) { inStr = true; start = i; }
            else        { inStr = false; ranges.push([start, i]); }
        }
    }
    return ranges;
}

function insideString(pos, ranges) {
    return ranges.some(([s, e]) => pos > s && pos < e);
}

// ── Core decoration logic (line-by-line, comment-aware) ─────────────────────

function applyDecorations(editor) {
    if (!editor || editor.document.languageId !== 'cstol') return;

    const doc        = editor.document;
    const waitRanges  = [];
    const gotoRanges  = [];
    const startRanges = [];
    const labelRanges = [];

    for (let li = 0; li < doc.lineCount; li++) {
        const line = doc.lineAt(li);
        const raw  = line.text;
        const cEnd = commentStart(raw);
        const code   = raw.substring(0, cEnd);
        const strRng = stringRanges(code);
        // trimmed range: from first non-whitespace to end of text
        const trimStart = raw.search(/\S/);
        const textRange = trimStart < 0 ? null
            : lineRange(line, trimStart, raw.trimEnd().length - trimStart);

        let m;

        // wait: whole-line highlight — only if 'wait' is NOT inside a string
        WAIT_RE.lastIndex = 0;
        m = WAIT_RE.exec(code);
        if (textRange && m && !insideString(m.index, strRng))
            waitRanges.push(textRange);

        // start: same — only if not inside a string
        START_RE.lastIndex = 0;
        m = START_RE.exec(code);
        if (textRange && m && !insideString(m.index, strRng))
            startRanges.push(textRange);

        // goto: keyword only — skip if inside a string
        GOTO_RE.lastIndex = 0;
        while ((m = GOTO_RE.exec(code)) !== null) {
            if (!insideString(m.index, strRng))
                gotoRanges.push(lineRange(line, m.index, m[0].length));
        }

        // label: highlight from first non-ws to end of label token (NAME:)
        const lm = LABEL_RE.exec(raw);
        if (lm) {
            const col = lm[0].length - lm[1].length; // skip leading whitespace
            labelRanges.push(lineRange(line, col, lm[1].trimEnd().length));
        }
    }

    editor.setDecorations(waitDeco,  waitRanges);
    editor.setDecorations(gotoDeco,  gotoRanges);
    editor.setDecorations(startDeco, startRanges);
    editor.setDecorations(labelDeco, labelRanges);
}

function lineRange(line, charOffset, length) {
    return new vscode.Range(
        line.range.start.translate(0, charOffset),
        line.range.start.translate(0, charOffset + length)
    );
}

// ── Extension lifecycle ──────────────────────────────────────────────────────

function activate(context) {
    createDecorations();

    // Decorate any already-open editor
    vscode.window.visibleTextEditors.forEach(applyDecorations);

    context.subscriptions.push(
        // New editor becomes active
        vscode.window.onDidChangeActiveTextEditor(applyDecorations),

        // File content changes (live update)
        vscode.workspace.onDidChangeTextDocument(ev => {
            const editor = vscode.window.activeTextEditor;
            if (editor && ev.document === editor.document) {
                applyDecorations(editor);
            }
        }),

        // A new document is opened
        vscode.workspace.onDidOpenTextDocument(() => {
            vscode.window.visibleTextEditors.forEach(applyDecorations);
        })
    );
}

function deactivate() {
    [waitDeco, gotoDeco, startDeco, labelDeco]
        .filter(Boolean)
        .forEach(d => d.dispose());
}

module.exports = { activate, deactivate };

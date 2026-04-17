'use strict';
const vscode = require('vscode');

// ── Decoration types ─────────────────────────────────────────────────────────

let waitDeco, gotoDeco, startDeco;

function createDecorations() {
    // wait: full text of the line, vivid orange
    waitDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 140, 0, 0.65)',
        color: '#000000',
        fontWeight: 'bold'
    });
    // goto: keyword only, purple
    gotoDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#CCA8DD',
        color: '#000000',
        fontWeight: 'bold',
        borderRadius: '2px'
    });
    // start: full text of the line, bright green
    startDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0, 255, 0, 0.55)',
        color: '#000000',
        fontWeight: 'bold'
    });
}

// ── Patterns ─────────────────────────────────────────────────────────────────

const WAIT_RE  = /\bwait\b/gi;
const GOTO_RE  = /\bgoto\b/gi;
const START_RE = /\bstart\b/gi;

// ── Comment detection: first ';' not inside a double-quoted string ───────────

function commentStart(text) {
    let inStr = false;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '"') { inStr = !inStr; }
        else if (text[i] === ';' && !inStr) { return i; }
    }
    return text.length; // no comment
}

// ── Core decoration logic (line-by-line, comment-aware) ─────────────────────

function applyDecorations(editor) {
    if (!editor || editor.document.languageId !== 'cstol') return;

    const doc        = editor.document;
    const waitRanges  = [];
    const gotoRanges  = [];
    const startRanges = [];

    for (let li = 0; li < doc.lineCount; li++) {
        const line = doc.lineAt(li);
        const raw  = line.text;
        const cEnd = commentStart(raw);
        const code = raw.substring(0, cEnd);
        // trimmed range: from first non-whitespace to end of text
        const trimStart = raw.search(/\S/);
        const textRange = trimStart < 0 ? null
            : lineRange(line, trimStart, raw.trimEnd().length - trimStart);

        let m;

        // wait: highlight from first non-ws char to end of text
        WAIT_RE.lastIndex = 0;
        if (textRange && WAIT_RE.exec(code) !== null)
            waitRanges.push(textRange);

        // start: same treatment, bright green
        START_RE.lastIndex = 0;
        if (textRange && START_RE.exec(code) !== null)
            startRanges.push(textRange);

        // goto: keyword only
        GOTO_RE.lastIndex = 0;
        while ((m = GOTO_RE.exec(code)) !== null)
            gotoRanges.push(lineRange(line, m.index, m[0].length));
    }

    editor.setDecorations(waitDeco,  waitRanges);
    editor.setDecorations(gotoDeco,  gotoRanges);
    editor.setDecorations(startDeco, startRanges);
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
    [waitDeco, gotoDeco, startDeco]
        .filter(Boolean)
        .forEach(d => d.dispose());
}

module.exports = { activate, deactivate };

'use strict';
const vscode = require('vscode');

// ── Decoration types ─────────────────────────────────────────────────────────

let waitDeco, gotoDeco;

function createDecorations() {
    // wait: entire line gets orange background
    waitDeco = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: 'rgba(255, 165, 0, 0.35)',   // orange, semi-transparent
        borderRadius: '2px'
    });
    // goto: just the keyword, purple background
    gotoDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#CCA8DD',
        color: '#000000',
        fontWeight: 'bold',
        borderRadius: '2px'
    });
}

// ── Patterns ─────────────────────────────────────────────────────────────────

const WAIT_RE = /\bwait\b/gi;
const GOTO_RE = /\bgoto\b/gi;

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

    const doc       = editor.document;
    const waitRanges = [];
    const gotoRanges = [];

    for (let li = 0; li < doc.lineCount; li++) {
        const line = doc.lineAt(li);
        const raw  = line.text;
        const cEnd = commentStart(raw);
        const code = raw.substring(0, cEnd);

        let m;

        // wait: mark the whole line (isWholeLine decoration)
        WAIT_RE.lastIndex = 0;
        if (WAIT_RE.exec(code) !== null) {
            waitRanges.push(line.range);
        }

        // goto: highlight just the keyword
        GOTO_RE.lastIndex = 0;
        while ((m = GOTO_RE.exec(code)) !== null)
            gotoRanges.push(lineRange(line, m.index, m[0].length));
    }

    editor.setDecorations(waitDeco, waitRanges);
    editor.setDecorations(gotoDeco, gotoRanges);
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
    [waitDeco, gotoDeco]
        .filter(Boolean)
        .forEach(d => d.dispose());
}

module.exports = { activate, deactivate };

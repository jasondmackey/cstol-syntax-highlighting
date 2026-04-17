'use strict';
const vscode = require('vscode');

// ── Decoration types (created once, reused across all editors) ──────────────

let waitDeco, gotoDeco, commandDeco, labelDeco;

function createDecorations() {
    waitDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#FFA500',
        color: '#000000',
        fontWeight: 'bold',
        borderRadius: '2px'
    });
    gotoDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#CCA8DD',
        color: '#000000',
        fontWeight: 'bold',
        borderRadius: '2px'
    });
    commandDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#FFFF00',
        color: '#000000',
        fontWeight: 'bold',
        borderRadius: '2px'
    });
    labelDeco = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#87CEEB',
        color: '#000000',
        fontWeight: 'bold',
        borderRadius: '2px'
    });
}

// ── Patterns (case-insensitive, word-boundary, applied per code segment) ────

const WAIT_RE    = /\bwait\b/gi;
const GOTO_RE    = /\bgoto\b/gi;
const COMMAND_RE = /\b(check|let|set|cmd|write|proc|endproc|begin|ask|declare)\b/gi;
const LABEL_RE   = /^[ \t]*([A-Za-z_][A-Za-z0-9_]*[ \t]*:)/;

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

    const doc  = editor.document;
    const waitRanges    = [];
    const gotoRanges    = [];
    const commandRanges = [];
    const labelRanges   = [];

    for (let li = 0; li < doc.lineCount; li++) {
        const line = doc.lineAt(li);
        const raw  = line.text;
        const cEnd = commentStart(raw);   // code ends here
        const code = raw.substring(0, cEnd);

        // Labels — must start at beginning of the code portion
        const lm = LABEL_RE.exec(code);
        if (lm) {
            const col = lm[0].length - lm[1].length; // skip leading whitespace
            labelRanges.push(lineRange(line, col, lm[1].length));
        }

        let m;

        WAIT_RE.lastIndex = 0;
        while ((m = WAIT_RE.exec(code)) !== null)
            waitRanges.push(lineRange(line, m.index, m[0].length));

        GOTO_RE.lastIndex = 0;
        while ((m = GOTO_RE.exec(code)) !== null)
            gotoRanges.push(lineRange(line, m.index, m[0].length));

        COMMAND_RE.lastIndex = 0;
        while ((m = COMMAND_RE.exec(code)) !== null)
            commandRanges.push(lineRange(line, m.index, m[0].length));
    }

    editor.setDecorations(waitDeco,    waitRanges);
    editor.setDecorations(gotoDeco,    gotoRanges);
    editor.setDecorations(commandDeco, commandRanges);
    editor.setDecorations(labelDeco,   labelRanges);
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
    [waitDeco, gotoDeco, commandDeco, labelDeco]
        .filter(Boolean)
        .forEach(d => d.dispose());
}

module.exports = { activate, deactivate };

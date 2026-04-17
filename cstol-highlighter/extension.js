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

// ── Patterns (case-insensitive, word-boundary) ───────────────────────────────

const WAIT_RE    = /\bwait\b/gi;
const GOTO_RE    = /\bgoto\b/gi;
const COMMAND_RE = /\b(check|let|set|cmd|write|proc|endproc|begin|ask|declare)\b/gi;
// Labels: optional leading whitespace, then WORD followed by colon
const LABEL_RE   = /^[ \t]*([A-Za-z_][A-Za-z0-9_]*[ \t]*:)/gm;

// ── Core decoration logic ────────────────────────────────────────────────────

function applyDecorations(editor) {
    if (!editor || editor.document.languageId !== 'cstol') return;

    const text = editor.document.getText();

    const waitRanges    = [];
    const gotoRanges    = [];
    const commandRanges = [];
    const labelRanges   = [];

    let m;

    // wait
    WAIT_RE.lastIndex = 0;
    while ((m = WAIT_RE.exec(text)) !== null) {
        waitRanges.push(rangeOf(editor, m.index, m[0].length));
    }

    // goto / GOTO
    GOTO_RE.lastIndex = 0;
    while ((m = GOTO_RE.exec(text)) !== null) {
        gotoRanges.push(rangeOf(editor, m.index, m[0].length));
    }

    // commands
    COMMAND_RE.lastIndex = 0;
    while ((m = COMMAND_RE.exec(text)) !== null) {
        commandRanges.push(rangeOf(editor, m.index, m[0].length));
    }

    // labels — match[0] is "  LABEL:" but we only highlight from the word start
    LABEL_RE.lastIndex = 0;
    while ((m = LABEL_RE.exec(text)) !== null) {
        const labelStart = m.index + (m[0].length - m[1].length);
        labelRanges.push(rangeOf(editor, labelStart, m[1].length));
    }

    editor.setDecorations(waitDeco,    waitRanges);
    editor.setDecorations(gotoDeco,    gotoRanges);
    editor.setDecorations(commandDeco, commandRanges);
    editor.setDecorations(labelDeco,   labelRanges);
}

function rangeOf(editor, offset, length) {
    return new vscode.Range(
        editor.document.positionAt(offset),
        editor.document.positionAt(offset + length)
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

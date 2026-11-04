/**
 * Tree-sitter grammar for CSTOL (.prc) — used by the Zed extension.
 *
 * Deliberately flat and line-oriented: CSTOL highlighting is keyword/token
 * based, so a full statement parser would only make the grammar fragile.
 * Keywords are case-insensitive, matching the TextMate grammar.
 */

// Case-insensitive keyword: ci('wait') -> /[wW][aA][iI][tT]/
const ci = (word) =>
  new RegExp(
    word
      .split('')
      .map((c) => (/[a-z]/i.test(c) ? `[${c.toLowerCase()}${c.toUpperCase()}]` : c))
      .join(''),
  );

// Two-word keyword with flexible whitespace: ciPair('end', 'if')
const ciPair = (a, b) =>
  new RegExp(`${ci(a).source}[ \\t]+${ci(b).source}`);

const kw = (name, ...words) => ({
  [name]: () => token(words.length === 1 ? words[0] : choice(...words)),
});

module.exports = grammar({
  name: 'cstol',

  extras: () => [/[ \t\f]+/, /\\\r?\n/],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => seq(repeat($._line), optional($._last_line)),

    _line: ($) => seq(optional($.label), repeat($._token), $._newline),
    // A final line with no trailing newline.
    _last_line: ($) =>
      choice(seq($.label, repeat($._token)), repeat1($._token)),
    _newline: () => /\r?\n/,

    _token: ($) =>
      choice(
        $.comment,
        $.string,
        $.number,
        $.time,
        $.special_variable,
        $.variable,
        $.keyword_wait,
        $.keyword_goto,
        $.keyword_flow,
        $.keyword_start,
        $.keyword_loop,
        $.keyword_conditional,
        $.keyword_command,
        $.keyword_operator,
        $.operator,
        '(', ')', '[', ']', ',', ':',
        $.identifier,
      ),

    comment: () => token(seq(';', /[^\r\n]*/)),

    // A string left open at end of line runs to the end of the line.
    string: () => token(seq('"', /[^"\r\n]*/, optional('"'))),

    time: () => /\d+:\d+(:\d+)?(\.\d+)?/,
    number: () =>
      token(choice(/0[xX][0-9a-fA-F]+/, /\d*\.\d+([eE][+-]?\d+)?/, /\d+([eE][+-]?\d+)?/)),

    variable: () => /\$[a-zA-Z_][a-zA-Z0-9_]*/,
    special_variable: () => /\$\$[a-zA-Z_][a-zA-Z0-9_]*/,

    // NAME:   (only valid at the start of a line — see _line)
    label: () => /[a-zA-Z_][a-zA-Z0-9_]*[ \t]*:/,

    ...kw('keyword_wait', ci('wait')),
    ...kw('keyword_goto', ci('goto')),
    ...kw('keyword_flow', ci('return')),
    ...kw('keyword_start', ci('start')),
    ...kw('keyword_loop', ci('loop'), ciPair('end', 'loop')),
    ...kw(
      'keyword_conditional',
      ci('if'), ci('elseif'), ci('else'), ci('endif'), ciPair('end', 'if'),
    ),
    ...kw(
      'keyword_command',
      ci('check'), ci('let'), ci('set'), ci('cmd'), ci('write'),
      ci('proc'), ci('endproc'), ciPair('end', 'proc'),
      ci('begin'), ci('ask'), ci('declare'),
    ),
    ...kw(
      'keyword_operator',
      ci('vs'), ci('with'), ci('and'), ci('or'), ci('not'), ci('until'), ci('for'), ci('dn'),
    ),

    operator: () => token(choice('/=', '<=', '>=', '=', '<', '>', '+', '-', '*', '/', '%', '&', '|', '!')),

    identifier: () => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});

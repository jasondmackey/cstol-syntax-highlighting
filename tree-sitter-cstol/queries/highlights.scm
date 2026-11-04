(comment) @comment
(string) @string

(number) @number
(time) @number

(variable) @variable.special
(special_variable) @constant.builtin

(label) @label

[
  (keyword_wait)
  (keyword_goto)
  (keyword_flow)
  (keyword_start)
  (keyword_loop)
  (keyword_conditional)
  (keyword_command)
] @keyword

(keyword_operator) @operator
(operator) @operator

["(" ")" "[" "]"] @punctuation.bracket
["," ":"] @punctuation.delimiter

; ALL_CAPS identifiers (TIME_OUT, EVENT_ID, INPUT ...) read as constants.
((identifier) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]*$"))

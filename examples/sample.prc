; header comment
BEGINPROC:
  declare INPUT $count = 5
  if $$ERROR = TIME_OUT
     write "unterminated string
  endif
  if $x <= 3 and $y /= 4 OR $z >= 2
  WAIT 00:00:30 or for 00:01:00
  loop $i < 10
  end loop
  start mms_boot_proc $a
  GOTO FINISH
  let $v = 0x1F + 1.5e3
  write "wait goto ; not a comment"  ; real comment
FINISH:

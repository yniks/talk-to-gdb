define ptypes
    set $i = 0
    while $i < $argc
        eval "ptype $arg%d",$i
        set $i = $i+1
    end
end

define adder
  set $i = 0
  set $sum = 0
  while $i < $argc
    eval "set $sum = $sum + $arg%d", $i
    set $i = $i + 1
  end
  print $sum
end
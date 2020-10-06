define ptypes
    set $i = 0
    while $i < $argc
        eval "set $s=$arg%d",$i
        eval "ptype %s",$s
        set $i = $i+1
    end
end
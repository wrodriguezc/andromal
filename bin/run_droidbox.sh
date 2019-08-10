#!/bin/bash
if [ -f /.dockerenv ]; then
    ssh root@droidbox -p 22 "/opt/droidbox/bin/./analyze.sh $1 $2 $3"
    else
    ssh root@localhost -p 2223 "/opt/droidbox/bin/./analyze.sh $1 $2 $3"
fi
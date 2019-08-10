#!/bin/sh
if [ -f /.dockerenv ]; then
    ssh root@androguard -p 22 "/opt/androguard/bin/./decompile.sh $1 $2"
    else
    ssh root@localhost -p 2222 "/opt/androguard/bin/./decompile.sh $1 $2"
fi
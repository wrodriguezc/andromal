#!/bin/sh
ssh root@localhost -p 2222 "/opt/androguard/bin/./decompile.sh $1 $2"
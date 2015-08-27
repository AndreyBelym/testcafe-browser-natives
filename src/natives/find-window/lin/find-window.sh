#!/bin/sh
wmctrl -l|grep -i $1|sed -n 's/^\(0x[0-9a-e]\+\).*/\1/p'

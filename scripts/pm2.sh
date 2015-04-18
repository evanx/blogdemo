#!/bin/bash

name=hitcount

cpm2() {
  APP_PORT=8001 \
  APP_LOCATION=/hs/ \
  ENV_TYPE=test \
  MONITOR_SECONDS=120 \
  REDIS_HOST=127.0.0.1 \
  REDIS_PORT=6379 \
  pm2 $@
}

cpm1() {
  cpm2 $1 $name
}

c0start() {
  cpm2 start index.js --name $name
}

c0tailf() {
  tail -f | ./node_modules/bunyan/bin/bunyan
}

if [ $1 = 'start' ]
then
  c0start
elif [ $# -eq 1 ]
then
  pm1 $1
else
  pm2 l
  pm1 show
fi

#!/bin/bash

# enviroment

export APP_PORT=8001
export API_PORT=8002
export APP_LOCATION=/hs/
export MONITOR_SECONDS=120
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379
export ENV_TYPE=test

c0curl() {
  sleep 4
  echo; echo "8001"
  curl -s localhost:8001/post/1 | wc 
  curl -s localhost:8001/posts | wc 
  echo; echo "8002"
  curl -s localhost:8002/post/1 | python -mjson.tool
  curl -s localhost:8002/posts | python -mjson.tool
}

c0run() {
  nodejs index.js | ./node_modules/bunyan/bin/bunyan
}

c0curl & c0run


#!/bin/bash

# enviroment

export APP_PORT=8001
export API_PORT=8002
export APP_LOCATION=/hs/
export MONITOR_SECONDS=120
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379
export ENV_TYPE=test

nodejs index.js | ./node_modules/bunyan/bin/bunyan


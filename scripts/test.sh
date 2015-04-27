

c0run() {
  babel-node test/test.js  | bunyan
}

c0clear() {
  sh scripts/redis.sh clear
  c0run
  sleep 1
  sh scripts/redis.sh 
}

if [ $# -gt 0 ]
then
  command=$1
  shift
  c$#$command $@
else
  c0run
fi

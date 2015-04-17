

c0print() {
  for key in `redis-cli keys 'hitcount:*'`
  do
    echo redis-cli hgetall "$key"
    redis-cli hgetall "$key"
  done
}

c0clear() {
  for key in `redis-cli keys 'hitcount:*'`
  do
    echo redis-cli hgetall "$key"
    redis-cli del "$key"
  done
}

if [ $# -gt 0 ]
then
  command=$1
  shift
  c$#$command $@
else
  c0print
fi

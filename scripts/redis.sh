
name=post

c0count() {
  redis-cli keys "$name:*" | wc -l
}

c0clear() {
  for key in `redis-cli keys "$name:*"`
  do
    redis-cli del "$key"
  done
}

c0print_table() {
  echo; echo redis-cli keys "$name:table:*"
  redis-cli keys "$name:table:*" | wc -l
  echo; echo redis-cli keys "$name:table:*"
  for key in `redis-cli keys "$name:table:*"`
  do
    echo; echo redis-cli hkeys "$key"
    redis-cli hkeys "$key"
    echo; echo redis-cli hgetall "$key"
    redis-cli hgetall "$key"
  done
}

c0print_seq() {
  echo; echo redis-cli get "$name:seq"
  redis-cli get "$name:seq" 
}

c0print_set() {
  echo; echo redis-cli smembers "$name:set"
  redis-cli smembers "$name:set"
}

c0print_sorted() {
  echo; echo redis-cli keys "$name:sorted:*"
  redis-cli keys "$name:sorted:*" 
  for key in `redis-cli keys "$name:sorted:*"`
  do
    echo; echo redis-cli zrange "$key" 0 -1
    redis-cli zrange "$key" 0 -1
  done
}

c0print() {
  c0print_table
  c0print_set
  c0print_seq
  c0print_sorted
}


if [ $# -gt 0 ]
then
  command=$1
  shift
  c$#$command $@
else
  c0print
fi

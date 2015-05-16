#!/bin/bash

name=post

delete_all() {
  for key in `redis-cli keys "$name:*"`
  do
    redis-cli del "$key"
  done
}

print_table() {
  echo redis-cli keys "$name:table:*"
  redis-cli keys "$name:table:*" | wc -l
  for key in `redis-cli keys "$name:table:*"`
  do
    echo; echo redis-cli hkeys "$key"
    redis-cli hkeys "$key"
    echo; echo redis-cli hgetall "$key"
    redis-cli hgetall "$key"
  done
}

print_sorted() {
  for key in `redis-cli keys "$name:sorted:*"`
  do
    echo; echo redis-cli zrange "$key" 0 -1
    redis-cli zrange "$key" 0 -1
  done
}

count() {
  redis-cli keys "$name:*" | wc -l
}


c0print_seq() {
  echo; echo 'seq'
  for key in `redis-cli keys "$name:seq:*"`
  do
    echo; echo redis-cli get "$key"
    redis-cli get "$key"
  done
}

c0print_set() {
  echo; echo 'set'
  for key in `redis-cli keys "$name:set:*"`
  do
    echo; echo redis-cli smembers "$key"
    redis-cli smembers "$key"
  done
}


c0print() {
  c0print_table
  c0print_set
  c0print_seq
  c0print_sorted
}

c0clear() {
  c0count
  for key in `redis-cli keys "$name:*"`
  do
    redis-cli del "$key"
  done
  c0count
}

if [ $# -gt 0 ]
then
  command=$1
  shift
  c$#$command $@
else
  c0print
fi

#!/bin/bash

name=post

count() {
  redis-cli keys "$name:*" | wc -l
}

print_sorted() {
  for key in `redis-cli keys "$name:sorted:*"`
  do
    echo; echo redis-cli zrange "$key" 0 -1
    redis-cli zrange "$key" 0 -1
  done
}

print_dict() {
  echo redis-cli keys "$name:dict:*"
  redis-cli keys "$name:dict:*" | wc -l
  for key in `redis-cli keys "$name:dict:*"`
  do
    echo; echo redis-cli hkeys "$key"
    redis-cli hkeys "$key"
    echo; echo redis-cli hgetall "$key"
    redis-cli hgetall "$key"
  done
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
  c0print_dict
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

import lodash from 'lodash';
import redisModule from 'redis';
import bunyan from 'bunyan';

export const redisClient = redisModule.createClient();
const log = bunyan.createLogger({name: 'RedisUtil', level: 'debug'});

redisClient.on('error', function (err) {
   log.error('error', err);
});

const ns = 'test';

function joinColon() {
   return lodash.toArray(arguments).join(':');
}

export const redis = {
   incr: function(params, cb) {
      redisClient.incr(joinColon(ns, 'seq', params.type), cb);
   },
   hmset: function(params, cb) {
      redisClient.hmset(joinColon(ns, 'dict', params.type, params.id), params.dict, cb);
   },
   hgetall: function(params, cb) {
      redisClient.hgetall(joinColon(ns, 'dict', params.type, params.id), cb);
   },
   sismember: function(params, cb) {
      redisClient.sismember(joinColon(ns, 'set', params.type), params.id, cb);
   },
   lindex: function(params, cb) {
      redisClient.lindex(joinColon(ns, 'list', params.type), params.index, cb);
   }
};

export class RedisMulti {
   constructor() {
      this.multi = redisClient.multi();
   }

   exec(callback) {
      log.info('multi', this.multi.queue);
      this.multi.exec(callback);
   }

   lpush(params) {
      this.multi.lpush(joinColon(ns, 'list', params.type), params.id);
   }

   sadd(params) {
      this.multi.sadd(joinColon(ns, 'set', params.type), params.id);
   }

   hmset(params) {
      this.multi.hmset(joinColon(ns, 'dict', params.type, params.id), params.dict);
   }

   hgetall(params) {
      this.multi.hgetall(joinColon(ns, 'dict', params.type, params.id));
   }

   zadd(params) {
      this.multi.zadd(joinColon(ns, 'sorted', params.type, params.by), params.score, params.id);
   }
}

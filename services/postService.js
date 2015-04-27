import redisLib from 'redis';

export const redis = redisLib.createClient();

const postService = {
   find: function(id, cb) {
      redis.hgetall('post:dict:' + id, cb);
   },
   latest: function(count, cb) {
      redis.lrange('post:list', 0, count, cb);
   },
   sorted: function(count, cb) {
      redis.zrange('post:sorted:published', 0, count, cb);
   }
};

module.exports = postService;


import redisModule from 'redis';
import bunyan from 'bunyan';

export const redisClient = redisModule.createClient();

const postService = {
   find: function(id, cb) {
      redisClient.hgetall('post:dict:' + id, cb);
   },
   latest: function(count, cb) {
      redisClient.lrange('post:list', 0, count, cb);
   },
   sorted: function(count, cb) {
      redisClient.zrange('post:sorted:published', 0, count, cb);
   }
};

module.exports = postService;


import redisModule from 'redis';
import bunyan from 'bunyan';

export const redisClient = redisModule.createClient();

const postService = {
   find: function(id, callback) {
      redisClient.hgetall('post:dict:' + id, callback);
   }
};

module.exports = postService;

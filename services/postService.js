
import redisLib from 'redis';
import promisify from 'es6-promisify';
const redisClient = redisLib.createClient();

module.exports = {
   end() {
      redisClient.end();
   }
};

var promisified = {
   getPostPromise(postId, cb) {
      redisClient.hgetall('post:table:' + postId, cb);
   },
   getIdsPromise(start, stop, cb) {
      redisClient.lrange('post:list', start, stop, cb);
   },
   getSortedIdsPromise(start, stop, cb) {
      redisClient.zrevrange(
         'post:sorted:published', start, stop, cb);
   }
};

Object.keys(promisified).forEach(name => {
   module.exports[name] =
      promisify(promisified[name].bind(promisified));
});




// redisImpl.js

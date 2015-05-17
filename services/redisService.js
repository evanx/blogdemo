

import promisify from 'es6-promisify';
import redisLib from 'redis';

var redisClient = redisLib.createClient();

['hgetall', 'lrange', 'zrevrange'].forEach(name => {
   module.exports[name] = promisify(
      redisClient[name].bind(redisClient));
});

['end'].forEach(name => {
   module.exports[name] =
      redisClient[name].bind(redisClient);
});

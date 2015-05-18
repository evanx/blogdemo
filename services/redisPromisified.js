
import lodash from 'lodash';

import promisify from 'es6-promisify';
import redisLib from 'redis';
var redisClient = redisLib.createClient();
var names = ['hgetall', 'lrange', 'zrevrange'];

names.forEach(name => {
   module.exports[name] = promisify(
     redisClient[name].bind(redisClient));
});

['end', 'multi'].forEach(name => {
  module.exports[name] =
     redisClient[name].bind(redisClient);
});

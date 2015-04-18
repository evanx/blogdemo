
import { redis } from './redis';

const type = 'post';

module.exports = {
   find: function(id, callback) {
      redis.hgetall({type, id}, function (err, post) {
         if (err) {
            callback(err);
         } else {
            callback(null, post);
         }
      });
   }
}


import { redis } from './redis';

const type = 'post';

const postService = {
   find: function(id, callback) {
      redis.hgetall({type, id}, function (err, post) {
         if (err) {
            callback(err);
         } else {
            callback(null, post);
         }
      });
   }
};

module.exports = postService;

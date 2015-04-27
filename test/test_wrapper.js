
import async from 'async';
import lodash from 'lodash';
import bunyan from 'bunyan';
import redisLib from 'redis';

const log = bunyan.createLogger({name: "hydration", level: 'debug'});
const redisClient = redisLib.createClient();

redisClient.on('error', function (err) {
   log.error('error', err);
});

const ns = 'test';

function joinColon() {
   return lodash.toArray(arguments).join(':');
}

const redis = {
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
}

class RedisMulti {
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

const posts = [
   {
      title: 'my first post',
      description: 'so this is my first post',
      body: '<p>first post first para</p><p>the second para</p>',
      published: new Date().getTime() + 1000
   },
   {
      title: 'my second post',
      description: 'now this is my second post',
      body: '<p>second post first para</p><p>the second para</p>',
      published: new Date().getTime()
   }
];

function createPosts(callback) {
   async.map(posts, createPost, callback);
}

function createPost(post, callback) {
   let params = {type: 'post', by: 'published', score: post.published, dict: post};
   redis.incr(params, function(err, id) {
      if (err) {
         callback(err);
      } else {
         params.id = id;
         let multi = new RedisMulti();
         multi.hmset(params);
         multi.lpush(params);
         multi.sadd(params);
         multi.zadd(params);
         multi.exec(function(err, results) {
            log.info('createPost', {err, id});
            if (!err) {
               callback(null, id);
            } else {
               callback(err);
            }
         });
      }
   });
}

function updatePostId(id, post, callback) {
   let params = {type: 'post', id: id, dict: post};
   redis.sismember(params, function(err, ismember) {
      if (err) {
         callback(err);
      } else if (!ismember) {
         callback({message: 'not found'});
      } else {
         log.info('updatePostId', id);
         redis.hmset(params, callback);
      }
   });
}

function updatePost(callback) {
   let params = {type: 'post', index: 0};
   async.waterfall([
      function(waterfallCallback) {
         redis.lindex(params, waterfallCallback);
      },
      function(id, waterfallCallback) {
         params.id = id;
         redis.hgetall(params, waterfallCallback);
      }
   ], function(err, post) {
      if (err) {
         callback(err);
      } else {
         post.title = 'updated title';
         updatePostId(params.id, post, callback);
      }
   });
}

function loadPost(callback) {
   redis.hgetall({type: 'post', id: 2}, function(err, dict) {
      log.info('loadPost', {err, dict});
      callback(err, dict);
   });
}

function test() {
   async.series([
      createPosts,
      updatePost,
      loadPost
   ], function(err) {
      log.info('test', {err});
      redisClient.end();
   });
}

test();

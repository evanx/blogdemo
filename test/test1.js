
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
   let params = {index: 0};
   async.waterfall([
      function(waterfallCallback) {
         redisClient.lindex('test:list:post', params.index, waterfallCallback);
      },
      function(id, waterfallCallback) {
         params.id = id;
         redisClient.hgetall('test:dict:post:' + id, waterfallCallback);
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
   var id = 2;
   redis.hgetall('test:dict:post:' + id,, function(err, dict) {
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

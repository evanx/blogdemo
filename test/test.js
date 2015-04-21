
import async from 'async';
import lodash from 'lodash';
import bunyan from 'bunyan';
import redisLib from 'redis';

const log = bunyan.createLogger({name: 'blogdemo', level: 'debug'});
const redis = redisLib.createClient();

redis.on('error', function (err) {
   log.error('error', err);
});

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

function createPostsTest(callback) {
   async.map(posts, createPost, callback);
}

function createPost(post, callback) {
   redis.incr('post:seq', function(err, id) {
      if (err) {
         callback(err);
      } else {
         log.info('createPost', id);
         let multi = redis.multi();
         multi.hmset('post:dict:' + id, post);
         multi.lpush('post:list', id);
         multi.sadd('post:set', id);
         multi.zadd('post:sorted:published', id, post.published);
         multi.exec(function(err, results) {
            if (!err) {
               callback(null, id);
            } else {
               callback(err);
            }
         });
      }
   });
}

function updatePost(id, mutator, callback) {
   async.waterfall([
      function(cb) {
         redis.sismember('post:set', id, cb);
      },
      function(ismember, cb) {
         if (!ismember) {
            cb({message: 'not found'});
         } else {
            redis.hgetall('post:dict:' + id, cb);
         }
      },
      function(post, cb) {
         mutator(post);
         redis.hmset('post:dict:' + id, post, cb);
      }
   ], callback);
}

function loadPostTest(callback) {
   redis.lindex('post:list', 0, function(err, id) {
      redis.hgetall('post:dict:' + id, callback);
   });
}


function updatePostTest(callback) {
   redis.lindex('post:list', 0, function(err, id) {
      updatePost(id, function(post) {
         post.title = 'updated title';
      }, callback);
   });
}

function test() {
   async.series([
      createPostsTest,
      updatePostTest,
      loadPostTest
   ], function(err, results) {
      ... // assert
      redis.end();
   });
}

test();

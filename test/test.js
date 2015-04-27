
import async from 'async';
import lodash from 'lodash';
import bunyan from 'bunyan';
import redisLib from 'redis';
const redis = redisLib.createClient();

const log = bunyan.createLogger({name: 'blogdemo', level: 'debug'});

redis.on('error', function (err) {
   log.error('error', err);
});

const posts = [
   {
      title: 'my first post',
      description: 'so this is my first post',
      body: '<p>first post first para</p><p>the second para</p>',
      published: new Date().getTime()
   },
   {
      title: 'my second post',
      description: 'now this is my second post',
      body: '<p>second post first para</p><p>the second para</p>',
      published: new Date().getTime() + 1000
   }
];



function storePostsTest(callback) {
   async.map(posts, storePost, callback);
}

function storePost(post, callback) {
   redis.incr('post:seq', function(err, id) {
      if (err) {
         callback(err);
      } else {
         log.info('storePost', id);
         let multi = redis.multi();
         multi.hmset('post:dict:' + id, post);
         multi.lpush('post:list', id);
         multi.sadd('post:set', id);
         multi.zadd('post:sorted:published', post.published, id);
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
      storePostsTest,
      updatePostTest,
      loadPostTest
   ], function(err, results) {
      // assert
      redis.end();
   });
}

test();

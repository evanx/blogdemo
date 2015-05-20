
import redisModule from 'redis';
import bunyan from 'bunyan';
import assert from 'assert';
import lodash from 'lodash';

var promisify = require('es6-promisify');

import postService from '../services/postService';
import redisPromisified from '../services/redisPromisified';

const log = bunyan.createLogger({name: 'await'});
const redisClient = redisModule.createClient();

export function getPostPromise(postId) {
   return new Promise((resolve, reject) => {
      redisClient.hgetall('post:table:' + postId,
         (err, reply) => {
            if (err) {
               reject(err);
            } else {
               resolve(reply);
            }
      });
   });
}

// PromiseUtils.js
export function getPromise(caller) {
   return new Promise((resolve, reject) => {
      caller((err, reply) => {
         if (err) {
            reject(err);
         } else {
            resolve(reply);
         }
      });
   });
}

export function getPostIdsPromise(start, stop) {
   return PromiseUtils.getPromise(cb => {
      redisClient.lrange('post:list', start, stop, cb);
   });
}

const { hgetall, lrange, zrevrange } = redisPromisified;

export async function retrievePostAsync(id) {
   return await hgetall('post:table:' + id);
}

export async function retrievePostsAsync(start, stop) {
   if (stop < start) {
      throw new Error('Invalid arguments');
   }
   let ids = await lrange('post:list', start, stop);
   return await* (ids.map(async (id) =>
      retrievePostAsync(id)));
}

async function test() {
   try {
      let postId = 1;
      let post = await retrievePostAsync(postId);
      log.info('post: ', postId, post.title);
      assert.equal(post.title, 'my first post');
      let posts = await retrievePostsAsync(0, 1);
      log.info('posts length: ', posts.length);
      assert.equal(posts.length, 2);
      assert.equal(posts[0].title, 'my second post');
   } catch (error) {
      console.error('test failed:', error, error.stack);
   } finally {
      redisClient.end();
      redisPromisified.end();
      postService.end();
   }
}

test().then(() => {
   log.info('completed');
});


import redisModule from 'redis';
import bunyan from 'bunyan';
import assert from 'assert';

//import postService from './postService';

const log = bunyan.createLogger({name: 'await'});
const redisClient = redisModule.createClient();

export function getPostIdsPromise(start, stop) {
   return new Promise((resolve, reject) => {
      redisClient.lrange('post:list', start, stop,
         (err, reply) => {
            if (err) {
               reject(err);
            } else {
               //reject('test reject');
               resolve(reply);
            }
         }
      )
   });
}

export function getPostPromise(postId) {
   return new Promise((resolve, reject) => {
      redisClient.hgetall('post:table:' + postId,
         (err, reply) => {
            if (err) {
               reject(err);
            } else {
               //reject('test reject');
               resolve(reply);
            }
      });
   });
}

export async function retrievePostAsync(id) {
   return await getPostPromise(id);
}

export async function retrievePostsAsync(start, stop) {
   if (stop < start) {
      throw new Error('Invalid arguments');
   }
   let postIds = await getPostIdsPromise(start, stop);
   return await* postIds.map(async(postId) => {
      return await getPostPromise(postId);
   });
}


export async function retrievePostsAsync0(start, stop) {
   let postIds = await getPostIdsPromise(start, stop);
   return Promise.all(postIds.map(async(postId) => {
      return retrievePostAsync(postId);
   }));
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
      console.error('test failed:', error);
   } finally {
      redisClient.end();
   }
}



test();


import redisModule from 'redis';
import bunyan from 'bunyan';

const log = bunyan.createLogger({name: 'await'});
const redisClient = redisModule.createClient();

const redisImpl = {
   retrievePost(id) {
      return new Promise((resolve, reject) => {
         redisClient.hgetall('post:table:' + id, (err, reply) => {
            if (err) {
               reject(err);
            } else {
               resolve(reply);
            }
         })
      });
   }
};

export async function retrievePost(id) {
   try {
      let post = await redisImpl.retrievePost(id);
      console.info('retrievePost result', post);
   } catch (error) {
      console.error('retrievePost error', error);
   }
}

retrievePost(1);

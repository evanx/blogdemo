
## Demo for NodeCPT Redis and React talk 

We demonstrate the use of Redis as a data store for blog posts, and implement a trivial "API server" to serve our JSON content using ExpressJS.

Furthermore, we implement a web server to use ReactJS to render the content as HTML on NodeJS, served by ExpressJS.

### API server

```javascript
function retrievePosts(ids, callback) {
   log.info('posts', ids);
   async.map(ids, function(id, cb) {
      redisClient.hgetall('post:dict:' + id, (err, post) => {
         log.info('posts hgetall', {id, err, post});
         cb(err, post);
      });
   }, (err, posts) => {
      log.info('posts', {ids, err, posts});
      if (err) {
         callback(err);
      } else {
         callback(null, lodash.map(posts, (post, index) => {
            return {
               id: ids[index],
               title: post.title,
               description: post.description
            }
         }));
      }
   });
}
```

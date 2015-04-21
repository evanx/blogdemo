

const posts = [
   {
      title: 'my first post',
      ...
   },
   {
      title: 'my second post',
      ...
   }
];

function storePostsTest(callback) {
   async.map(posts, createPost, callback);
}

function storePost(post, callback) {
   ...
}

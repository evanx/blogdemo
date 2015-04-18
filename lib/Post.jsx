
import React from 'react';
import { redis, redisClient, RedisMulti } from './redis';

export const Post = React.createClass({
   render: function () {
      let post = this.props.post;
      return (
         <div>
            <h1>{post.title}</h1>
            <p dangerouslySetInnerHTML={{__html: post.body}}></p>
         </div>
      );
   }
});

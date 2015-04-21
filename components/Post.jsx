
import React from 'react';

const Post = React.createClass({
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

module.exports = Post;

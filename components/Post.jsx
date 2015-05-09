
import React from 'react';

const Post = React.createClass({
   render: function () {
      let post = this.props.post;
      return (
         <div className="postContainer">
            <h1 style={{marginTop: 4}}>{post.title}</h1>
            <p dangerouslySetInnerHTML={{__html: post.body}}></p>
         </div>
      );
   }
});

module.exports = Post;

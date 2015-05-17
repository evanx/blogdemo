
import React from 'react';

const style = {
   title: {
      fontSize: 20,
      padding: 0,
      margin: 0
   },
   p: {
      padding: 0,
      margin: 0
   }
};

var Post = React.createClass({
   render: function () {
      let post = this.props.post;
      return (
         <div className="postContainer">
            <h1 style={style.title}>{post.title}</h1>
            <div dangerouslySetInnerHTML={
                  {__html: post.body}}>
            </div>
         </div>
      );
   }
});

module.exports = Post;

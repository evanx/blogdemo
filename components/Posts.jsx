import React from 'react';
import lodash from 'lodash';

import PostSummary from './PostSummary';

var Posts = React.createClass({
   render() {
      return (
         <div>
            {this.props.posts.map(post => {
               return (
                  <PostSummary post={post}
                     key={post.id}/>
               );
            })}
         </div>
      );
   }
});

module.exports = Posts;

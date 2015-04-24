
import React from 'react';
import lodash from 'lodash';

import PostSummary from './PostSummary';

var Posts = React.createClass({
   render: function () {
      return (
         <div>
            {lodash.map(this.props.posts, post => {
               return (
                  <PostSummary post={post} key={post.id}/>
               );
            })}
         </div>
      );
   }
});

module.exports = Posts;

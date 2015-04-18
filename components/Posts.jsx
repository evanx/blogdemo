
import React from 'react';
import lodash from 'lodash';

export const Posts = React.createClass({
   render: function () {
      return (
         <div>
            {lodash.map(this.props.posts, post => {
               return (
                  <h1>{post.title}</h1>
                  <div>{post.description}</div>
               );
            })}
         </div>
      );
   }
});

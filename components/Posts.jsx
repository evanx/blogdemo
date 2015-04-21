
import React from 'react';
import lodash from 'lodash';

var Posts = React.createClass({
   render: function () {
      return (
         <div>
            {lodash.map(this.props.posts, post => {
               return (
                  <div>
                     <h1>{post.title}</h1>
                     <div>{post.description}</div>
                  </div>
               );
            })}
         </div>
      );
   }
});

module.exports = Posts;


import React from 'react';
import lodash from 'lodash';

var PostSummary = React.createClass({
   render: function () {
      var post = this.props.post;
      return (
         <div>
            <h1>{post.title}</h1>
            <div>{post.description}</div>
         </div>
      );
   }
});

module.exports = PostSummary;

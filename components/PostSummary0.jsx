
import React from 'react';
import lodash from 'lodash';

const style = {
   h1: {
      fontSize: 20,
      padding: 0,
      marginTop: 8,
      marginBottom: 4
   }
};

var PostSummary = React.createClass({
   render: function () {
      var post = this.props.post;

      return (
         React.createElement("div", null,
            React.createElement("h1", null, post.title),
            React.createElement("div", null, post.description)
         )

      );
   }
});


module.exports = PostSummary;

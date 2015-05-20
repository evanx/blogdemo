
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
   render() {
      let post = this.props.post;
      return (
         <div>
            <h1>{post.title}</h1>
            <div>{post.description}</div>
         </div>
      );
   }
});

module.exports = PostSummary;

//          <h1 style={style.h1}>{post.title}</h1>

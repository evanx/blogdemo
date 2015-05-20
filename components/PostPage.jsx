
import React from 'react';
import lodash from 'lodash';

var style = {
   body: {
      fontFamily: 'sans-serif',
      marginTop: 4
   }
};

var Post = require('./Post');

var PostPage = React.createClass({
   render: function () {
      let post = this.props.post;
      return (
         <html>
            <head>
               <title>{post.title}</title>
               <meta name="twitter:description"
                  content={post.description}/>
               <meta name="og:description"
                  content={post.description}/>
            </head>
            <body>
               <Post post={post}/>
            </body>
         </html>
      );
   }
});

module.exports = PostPage;

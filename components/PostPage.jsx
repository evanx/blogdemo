
import React from 'react';
import lodash from 'lodash';

import Post from './Post';

var style = {
   body: {
      fontFamily: 'sans-serif',
      marginTop: 4
   }
};

var resetStyle = "p {margin: 8}";

//               <meta name="viewport" content="width=device-width, initial-scale=1"/>

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
               <style>{resetStyle}</style>
            </head>
            <body style={style.body}>
               <Post post={post}/>
            </body>
         </html>
      );
   }
});

module.exports = PostPage;

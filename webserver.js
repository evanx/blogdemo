'use strict';

import async from 'async';
import lodash from 'lodash';
import express from 'express';
import bunyan from 'bunyan';

import postService from './services/postService';

import Post from './components/Post';

function getPostId(req, res) {
   postService.find(req.params.id, function (err, post) {
      if (err) {
         res.status(500).send(err);
      } else {
         var html = React.renderToString(React.createElement(Post, {post}));
         res.set('Content-Type', 'text/html');
         res.send(html);
      }
   });
}

import redisModule from 'redis';

const log = bunyan.createLogger({name: 'hydration'});
const app = express();
const redisClient = redisModule.createClient();
const marked = require('marked');

redisClient.on('error', err => {
   log.error('error', err);
});





global.log = log;
global.redisClient = redisClient;


function handleError(res, error) {
   log.error('error', error);
   if (error instanceof Error) {
      log.error('error stack', error.stack);
   }
   res.status(500).send(error);
}

function retrievePost(id, callback) {
   redisClient.hgetall('test:dict:post', callback);
}

function retrievepostService(ids, callback) {
   async.map(ids, function(id, callback) {
      redisClient.hgetall('test:dict:post:' + id, callback);
   }, function (err, postService) {
      log.info('postService', postService);
      if (err) {
         callback(err);
      } else {
         callback(null, lodash.map(postService, function (post, index) {
            return {
               id: ids[index],
               title: post.title
            }
         }));
      }
   });
}

function getPosts(req, res) {
   redisClient.smembers('test:set:post', function (err, ids) {
      if (err) {
         res.status(500).send(err.toString());
      } else {
         retrievepostService(ids, function(err, postService) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
               res.json(postService);
            }
         });
      }
   });
}

function getHelp(req, res) {
   try {
      res.set('Content-Type', "text/html");
      fs.readFile('README.md', function (err, content) {
         if (content) {
            res.send(marked(content.toString()));
         } else {
            res.send('no help');
         }
      });
   } catch (error) {
      handleError(res, error);
   }
}

function appLogger(req, res, next) {
   log.info('app', req.url);
   next();
}

function start(env) {
   app.use(appLogger);
   app.get('/help', getHelp);
   app.get('/posts', getPosts);
   app.get('/post/:id', getPostId);
   app.listen(env.APP_PORT);
   log.info('started', {port: env.APP_PORT});
}

start(process.env);

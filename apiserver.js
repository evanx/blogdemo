'use strict';

import async from 'async';
import lodash from 'lodash';
import express from 'express';
import bunyan from 'bunyan';

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

function retrievePosts(ids, callback) {
   async.map(ids, function(id, callback) {
      redisClient.hgetall('test:dict:post:' + id, callback);
   }, function (err, posts) {
      log.info('posts', posts);
      if (err) {
         callback(err);
      } else {
         callback(null, lodash.map(posts, function (post, index) {
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
         retrievePosts(ids, function(err, posts) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
               res.json(posts);
            }
         });
      }
   });
}

function getPostId(req, res) {
   redisClient.hgetall('test:dict:post:' + req.params.id, function (err, post) {
      if (err) {
         res.status(500).send(err);
      } else {
         res.json(post);
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
   app.listen(env.API_PORT);
   log.info('started', {port: env.API_PORT});
}

start(process.env);

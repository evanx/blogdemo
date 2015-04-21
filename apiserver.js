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
   redisClient.hgetall('post:dict:' + id, callback);
}

function retrievePosts(ids, callback) {
   async.map(ids, function(id, callback) {
      redisClient.hgetall('post:dict:' + id, callback);
   }, function (err, posts) {
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
   redisClient.smembers('post:set', function (err, ids) {
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


function getPostId(req, res) {
   redisClient.hgetall('post:dict:' + req.params.id, (err, post) => {
      if (err) {
         res.status(500).send(err);
      } else {
         res.json(post);
      }
   });
}

function start() {
   app.use(appLogger);
   app.get('/help', getHelp);
   app.get('/post/:id', getPostId);
   app.get('/posts', getPosts);
   app.listen(process.env.API_PORT);
   log.info('started', {port: process.env.API_PORT});
}

start();

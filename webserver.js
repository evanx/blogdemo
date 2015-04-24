'use strict';

import async from 'async';
import lodash from 'lodash';
import express from 'express';
import bunyan from 'bunyan';
import React from 'react';

import postService from './services/postService';

import Post from './components/Post';
import Posts from './components/Posts';

function start() {
   app.use(appLogger);
   app.get('/help', getHelp);
   app.get('/posts', getPosts);
   app.get('/post/:id', getPostId);
   app.listen(process.env.APP_PORT);
   log.info('started', {port: process.env.APP_PORT});
}

function getPostId(req, res) {
   postService.find(req.params.id, function (err, post) {
      if (err) {
         res.status(500).send(err);
      } else {
         var html = React.renderToString(
            React.createElement(Post, {post}));
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

function retrievePosts(ids, callback) {
   async.map(ids, function(id, cb) {
      redisClient.hgetall('post:dict:' + id, cb);
   }, callback);
}

function retrievePostsSummary(ids, callback) {
   retrievePosts(ids, function(err, posts) {
      callback(err, lodash.map(posts, function (post, index) {
         return {
            id: ids[index],
            title: post.title
         }
      }));
   });
}

import Posts from './components/Posts';

function getPosts(req, res) {
   redisClient.lrange('post:list', 0, 10, function (err, ids) {
      if (err) {
         res.status(500).send(err.toString());
      } else {
         retrievePosts(ids, function(err, posts) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
               var html = React.renderToString(
                  React.createElement(Posts, {posts}));
               res.set('Content-Type', 'text/html');
               res.send(html);
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

start(process.env);

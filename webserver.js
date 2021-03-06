'use strict';

import async from 'async';
import lodash from 'lodash';
import express from 'express';
import bunyan from 'bunyan';
import React from 'react';
import redisModule from 'redis';

import redisPromisified from './services/redisPromisified';
import postService from './services/postService';

import Post from './components/Post';
import Posts from './components/Posts';
import PostSummary from './components/PostSummary';

const log = bunyan.createLogger({name: 'blogdemo:webserver'});
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
   log.debug('app', req.url);
   next();
}

function start() {
   app.use(appLogger);
   app.get('/posts', getPosts);
   app.get('/post/:id', getPostId);
   app.listen(process.env.APP_PORT);
}

var PostPage = require('./components/PostPage');

function getPostId(req, res) {
   postService.getPostPromise(req.params.id).
   then(function(post) {
      var html = React.renderToString(
         React.createElement(PostPage, {post: post}));
      res.set('Content-Type', 'text/html');
      res.send(html);
   });
}

const { zrevrange, lrange } = redisPromisified;

async function getPosts(req, res) {
   if (!req.query.limit) {
      req.query.limit = 10;
   }
   var ids;
   if (req.query.q === 'sorted') {
      ids = await zrevrange(
         'post:sorted', 0, req.query.limit);
   } else {
      ids = await lrange(
         'post:list', 0, req.query.limit);
   }
   sendPosts(res, ids);
}

const { hgetall } = redisPromisified;

async function sendPosts(res, ids) {
   log.info('sendPosts', ids);
   let posts = await* ids.map(async (id) =>
      hgetall('post:table:' + id));
   let html = React.renderToString(
      React.createElement(Posts, {posts}));
   res.set('Content-Type', 'text/html');
   res.send(html);
}

function getPostsSorted(req, res) {
   redisClient.zrevrange(
      'post:sorted:published', 0, req.query.limit || 10,
      (err, ids) => {
         if (err) {
            res.status(500).send(err);
         } else {
            async.map(ids, (id, cb) => {
               redisClient.hgetall('post:table:' + id, cb);
            }, (err, posts) => {
               if (err) {
                  res.status(500).send(err);
               } else {
                  let html = React.renderToString(
                     React.createElement(Posts, {posts}));
                  res.set('Content-Type', 'text/html');
                  res.send(html);
               }
            });
         }
      }
   );
}

start(process.env);

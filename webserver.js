'use strict';

import async from 'async';
import lodash from 'lodash';
import express from 'express';
import bunyan from 'bunyan';
import React from 'react';
import redisModule from 'redis';

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

import Post from './components/Post';
import Posts from './components/Posts';
import PostSummary from './components/PostSummary';

import PostPage from './components/PostPage';

function start() {
   app.use(appLogger);
   app.get('/posts', getPosts);
   app.get('/post/:id', getPostId);
   app.listen(process.env.APP_PORT);
   log.info('started', {port: process.env.APP_PORT});
}

function getPostId(req, res) {
   postService.getPostPromise(req.params.id).then(
      post => {
         let html = React.renderToString(
            React.createElement(PostPage, {post}));
         res.set('Content-Type', 'text/html');
         res.send(html);
      });
}

import redisPromisified from './services/redisPromisified';

const { lrange, hgetall, zrevrange } = redisPromisified;

async function getPosts(req, res) {
   if (!req.query.limit) {
      req.query.limit = 10;
   }
   if (req.query.q === 'sorted') {
      sendPosts(res, await zrevrange(
         'post:sorted:published', 0, req.query.limit));
   } else {
      sendPosts(res, await lrange(
         'post:list', 0, req.query.limit));
   }
}

async function sendPosts(res, ids) {
   let posts = await* ids.map(async(id) =>
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

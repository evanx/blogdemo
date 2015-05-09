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

import postService from './services/postService';

import Post from './components/Post';

function start() {
   app.use(appLogger);
   app.get('/help', getHelp);
   app.get('/posts', getPosts);
   app.get('/post/:id', getPostId);
   app.listen(process.env.APP_PORT);
   log.info('started', {port: process.env.APP_PORT});
}

function getPostId(req, res) {
   postService.find(req.params.id, (err, post) => {
      if (err) {
         res.status(500).send(err);
      } else {
         var html = React.renderToString(
            React.createElement(PostPage, {post}));
         res.set('Content-Type', 'text/html');
         res.send(html);
      }
   });
}

function retrievePost(id, callback) {
   redisClient.hgetall('test:dict:post', callback);
}

function retrievePostsFull(ids, callback) {
   async.map(ids, function(id, cb) {
      redisClient.hgetall('post:dict:' + id, cb);
   }, callback);
}

function retrievePosts(ids, callback) {
   log.info('posts', ids);
   async.map(ids, function(id, cb) {
      redisClient.hgetall('post:dict:' + id, (err, post) => {
         log.info('posts hgetall', {id, err, post});
         cb(err, post);
      });
   }, (err, posts) => {
      log.info('posts', {ids, err, posts});
      if (err) {
         callback(err);
      } else {
         callback(null, lodash.map(posts, (post, index) => {
            return {
               id: ids[index],
               title: post.title,
               description: post.description
            }
         }));
      }
   });
}



import Posts from './components/Posts';

function getPosts(req, res) {
   if (!req.query.limit) {
      req.query.limit = 10;
   }
   if (req.query.q === 'sorted') {
      getPostsSorted(req, res);
   } else {
      getPostsFeed(req, res);
   }
}

function getPostsFeed(req, res) {
   redisClient.lrange('post:list',
         0, req.query.limit, (err, ids) => {
      sendPosts(res, err, ids);
   });
}

function getPostsSorted(req, res) {
   redisClient.zrevrange('post:sorted:published',
         0, req.query.limit, (err, ids) => {
      sendPosts(res, err, ids);
   });
}


function sendPosts(res, err, ids) {
   if (err) {
      res.status(500).send(err);
   } else {
      retrievePosts(ids, (err, posts) => {
         if (err) {
            res.status(500).send(err);
         } else {
            var html = React.renderToString(
               React.createElement(Posts, {posts}));
            res.set('Content-Type', 'text/html');
            res.send(html);
         }
      });
   }
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

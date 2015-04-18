
'strict mode';

var async = require('async');
var lodash = require('lodash');
var express = require('express');
var app = express();
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "hydration", level: 'debug'});
var marked = require('marked');

var redis = require('redis');
var redisClient = redis.createClient();

global.log = log;
global.redisClient = redisClient;

global.redisClient.on('error', function (err) {
   log.error('error', err);
});

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
   redisClient.hgetall('test:dict:post:' + req.params.id, function (err, dict) {
      if (err) {
         res.status(500).send(err.toString());
      } else {
         res.json(dict);
      }
   });
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

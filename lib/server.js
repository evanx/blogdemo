
var fs = require('fs');
var async = require('async');
var lodash = require('lodash');
var express = require('express');
var app = express();
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "hydration", level: 'debug'});
var marked = require('marked');
var emptyGif = require('./emptyGif');

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

function handle(req, res) {
   try {
      var name = req.params.name;
      var multi = redisClient.multi();
      multi.hincrby(['hitcount', source].join(':'), name, 1);
      multi.exec(function (err, replies) {
         if (err) {
            handleError(res, err);
         } else {
            let count = replies[0];
            log.info('handleCount', source, name, date, count);
            if (req.query.json) {
               res.json({source, name, date, count});
            } else {
               res.contentType('image/gif');
               res.send(emptyGif);
            }
         }
      });
   } catch (error) {
      handleError(res, error);
   }
}

function handleHelp(req, res) {
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

function monitor() {
   log.debug('monitor');
}

function start(env) {
   app.use(appLogger);
   app.get('/help', handleHelp);
   app.get(env.APP_LOCATION + '', handle);
   app.get(env.APP_LOCATION + '', handle);
   app.listen(env.APP_PORT);
   log.info('start', {port: env.APP_PORT, envType: env.ENV_TYPE, monitorSeconds: env.MONITOR_INTERVAL_SECONDS});
   if (env.MONITOR_INTERVAL_SECONDS) {
      setInterval(monitor, parseInt(env.MONITOR_INTERVAL_SECONDS) * 1000);
   }
}

var env = process.env;
console.log('argv', process.argv.length);
if (process.argv.length === 3) {
   console.log('argv', process.argv[2]);
   if (fs.existsSync(process.argv[2])) {
      env = require(process.argv[2]);
   }
}
start(env);

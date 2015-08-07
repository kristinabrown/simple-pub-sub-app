process.title = 'pubsub-app';

var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var redis = require("redis");

server.listen(3001);

// simple logger
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

var subscribe = redis.createClient();
subscribe.subscribe('notifications.create');

subscribe.on("message", function(channel, message) {
  console.log("from rails to subscriber:", channel, message);
});

io.on('connection', function (socket) {
  console.log('A user has connected!');

  // relay redis messages to connected socket
  subscribe.on("message", function(channel, message) {
    console.log("from rails to subscriber:", channel, message);
    io.sockets.emit('message', message)
  });

  // unsubscribe from redis if session disconnects
  socket.on('disconnect', function () {
    console.log("user disconnected");
    subscribe.quit();
  });

});
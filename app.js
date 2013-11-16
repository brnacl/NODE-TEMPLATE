var express = require('express');
var mongoose = require('mongoose');


// model definitions
require('require-dir')('./models');


// route definitions
var home = require('./routes/home');
var users = require('./routes/users');
var upload = require('./routes/upload');

var app = express();
var RedisStore = require('connect-redis')(express);
mongoose.connect('mongodb://localhost/auth-todo');

// configure express
require('./config').initialize(app, RedisStore);

// Middleware
var m = require('./lib/middleware');

// routes
app.get('/', home.index);
app.get('/login', home.login);
app.get('/register', home.register);
app.post('/users', users.create);
app.put('/login', users.login);
app.delete('/logout', users.logout);

app.get('/upload', m.checkAuth, upload.index);

app.post('/upload', m.checkAuth, upload.create);

// start server & socket.io
var common = require('./sockets/common');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log: true, 'log level': 2});
server.listen(app.get('port'));
io.of('/app').on('connection', common.connection);
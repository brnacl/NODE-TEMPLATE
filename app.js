var express = require('express');
var mongoose = require('mongoose');

// model definitions
require('require-dir')('./models');


// route definitions
var home = require('./routes/home');
var users = require('./routes/users');
var admin = require('./routes/admin');

var app = express();
var RedisStore = require('connect-redis')(express);
mongoose.connect('mongodb://localhost/auth-todo');

// configure express
require('./config').initialize(app, RedisStore);

// Middleware
var m = require('./lib/middleware');

// routes

//HOME
app.get('/', home.index);
app.get('/posts', home.posts);

//AUTH
app.get('/login', home.login);
app.get('/register', home.register);
app.post('/users', users.create);
app.put('/users/email', users.updateAccountEmail);
app.put('/users/password', users.updateAccountPassword);
app.put('/login', users.login);
app.delete('/logout', users.logout);

//ADMIN
app.get('/admin', m.checkAuth, m.checkAdmin, admin.index);

app.get('/admin/users', m.checkAuth, m.checkAdmin, admin.users);
app.delete('/admin/users', m.checkAuth, m.checkAdmin, admin.deleteUser);

app.get('/admin/posts', m.checkAuth, m.checkAdmin, admin.posts);
app.get('/admin/posts/new', m.checkAuth, m.checkAdmin, admin.newPost);
app.get('/admin/posts/:id', m.checkAuth, m.checkAdmin, admin.editPost);
app.put('/admin/posts/:id', m.checkAuth, m.checkAdmin, admin.updatePost);
app.post('/admin/posts', m.checkAuth, m.checkAdmin, admin.createPost);
app.delete('/admin/posts', m.checkAuth, m.checkAdmin, admin.deletePost);

app.get('/admin/files', m.checkAuth, m.checkAdmin, admin.files);
app.post('/admin/files', m.checkAuth, m.checkAdmin, admin.createFiles);
app.delete('/admin/files', m.checkAuth, m.checkAdmin, admin.deleteFile);

// USER
app.get('/profile', m.checkAuth, users.profile);
app.get('/profile/edit', m.checkAuth, users.editProfile);
app.get('/account/edit', m.checkAuth, users.editAccount);


//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req,res){res.render('home/404', {title: '404 - Not Found', heading: 'Not Found'});});

// start server & socket.io
var common = require('./sockets/common');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log: true, 'log level': 2});
server.listen(app.get('port'));
io.of('/app').on('connection', common.connection);
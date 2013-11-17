var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var m = require('../lib/middleware');
var User = mongoose.model('User');

exports.create = function(req, res){
  var status = m.validateRegistration(req.body);
  if(status === 'ok'){
    var user = new User();
    user.email = req.body.email;
    bcrypt.hash(req.body.password, 10, function(err, hash){
      user.password = hash;
      user.save(function(err, user){
        if(err)
          {res.send({status: 'error'});}
        else
          {res.send({status: 'ok'});}
      });
    });
  } else {
    res.send({status: status});
  }
};

exports.login = function(req, res){
  var email = req.body.email;
  User.findOne({email: email}, function(err, user){
    if(user){

      bcrypt.compare(req.body.password, user.password, function(err, isMatch){
        if(isMatch){
          req.session.regenerate(function(err){
            req.session.userId = user.id;
            req.session.save(function(err){
              res.send({status: 'ok'});
            });
          });
        } else {
          req.session.destroy(function(err){
            res.send({status: 'error'});
          });
        }
      });
    } else {
      req.session.destroy(function(err){
        res.send({status: 'error'});
      });
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy();
  res.redirect('/');
};
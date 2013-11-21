var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var m = require('../lib/middleware');
var User = mongoose.model('User');
var userProfile = mongoose.model('userProfile');

exports.profile = function(req, res){
  userProfile.find({userId: res.locals.user.id}).populate('user').exec(function(err,profile){
    res.render('user/profile', {
      title: 'My Profile',
      heading: 'My Profile',
      user: res.locals.user ? res.locals.user : null,
      profile: profile ? profile : null
    });
  });
};

exports.editProfile = function(req, res){
  res.render('user/edit', {
      title: 'Edit Profile',
      heading: 'Edit Profile',
      user: res.locals.user ? res.locals.user : null
    });
};

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

exports.updateAccount = function(req,res){
  var status = m.validateUpdateAccount(req.body);
  if(status === 'ok'){
    User.findById(req.session.userId, function(err, user){
      if(user.email !== req.body.email){
        User.findOne({email: req.body.email}, function(err, isUser){
          if(isUser && isUser.length){
            res.send({status:'emailexists'});
          } else {
            bcrypt.compare(req.body.oldPassword, user.password, function(err, isMatch){
              if(isMatch){
                user.email = req.body.email;
                user.save(function(err,result){
                  res.locals.user.email = user.email;
                  if(req.body.newPassword){
                    bcrypt.hash(req.body.newPassword, 10, function(err, hash){
                      user.password = hash;
                      user.save(function(err,userNewPass){
                        res.send({status: 'ok', message: 'Email Address and Password Updated', newEmail: req.body.email});
                      });
                    });
                  } else {
                    res.send({status: 'ok', message: 'Email Address Updated', newEmail: req.body.email});
                  }
                });
              } else {
                res.send({status: 'badpassword'});
              }
            });
          }
        });
      } else if(req.body.newPassword){
        bcrypt.hash(req.body.newPassword, 10, function(err, hash){
          user.password = hash;
          user.save(function(err,userNewPass){
            res.send({status: 'ok', message: 'Password Updated'});
          });
        });
      } else {
        res.send({status: 'nochanges'});
      }
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
            req.session.isAdmin = user.isAdmin;
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
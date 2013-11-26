var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var async = require('async');
var m = require('../lib/middleware');
var User = mongoose.model('User');
var userProfile = mongoose.model('userProfile');


exports.profile = function(req, res){
  User.findById(res.locals.user.id).populate('profile').exec(function(err,user){
    res.render('user/profile', {
      title: 'My Profile',
      heading: 'My Profile',
      user: res.locals.user ? res.locals.user : null,
      profile: user.profile ? user.profile : null
    });
  });
};

exports.editProfile = function(req, res){
  res.render('user/editProfile', {
      title: 'Edit Profile',
      heading: 'Edit Profile',
      user: res.locals.user ? res.locals.user : null
    });
};

exports.editAccount = function(req, res){
  res.render('user/editAccount', {
      title: 'Edit Account',
      heading: 'Edit Account',
      user: res.locals.user ? res.locals.user : null
    });
};

exports.create = function(req,res){
  var $email = req.body.email.toLowerCase();
  async.waterfall([
    function(fn){m.validateEmail($email,res,fn);},
    function(fn){m.passwordsMatch(req.body.password, req.body.password2,res,fn);},
    function(fn){m.accountExists($email,res,fn);},
    function(fn){
      var user = new User();
      user.email = $email;
      bcrypt.hash(req.body.password, 10, function(err, hash){
        user.password = hash;
        new userProfile().save(function(err,profile){
          user.profile = profile.id;
          user.save(function(err){
          if(err)
            {res.send({status: 'error'});}
          else
            {res.send({status: 'ok'});}
          });
        });
      });
    }
  ]);
};

exports.updateAccountPassword = function(req,res){
  var $oldPassword = req.body.oldPassword ? req.body.oldPassword:null;
  var $newPassword = req.body.newPassword ? req.body.newPassword:null;
  var $newPassword2 = req.body.newPassword2 ? req.body.newPassword2:null;
  User.findById(req.session.userId, function(err, user){
    async.waterfall([
      function(fn){if($oldPassword){fn();}else{res.send({status: 'nooldpassword', message: 'Please Enter Your Current Password!'});};},
      function(fn){bcrypt.compare($oldPassword, user.password, function(err, isMatch){if(isMatch){fn();}else{res.send({status: 'badpassword', message: 'Invalid Password!'});}});},
      function(fn){m.passwordsMatch($newPassword,$newPassword2,res,fn);},
      function(fn){
        bcrypt.hash($newPassword, 10, function(err, hash){
          user.password = hash;
          user.save(function(err){
            res.send({status:'ok', message: 'Your password has been updated successfully!'});
          });
        });
      }
    ]);
  });
};

exports.updateAccountEmail = function(req,res){
  var $email = req.body.email.toLowerCase();
  var $email2 = req.body.email2 ? req.body.email2.toLowerCase():null;
  User.findById(req.session.userId, function(err, user){
    async.waterfall([
      function(fn){m.validateEmail($email,res,fn);},
      function(fn){m.isNewEmail($email,user.email,res,fn);},
      function(fn){if($email2){fn();}else{res.send({status: 'noemail2', message: 'Please Re-Enter your new Email Address!'});};},
      function(fn){m.emailsMatch($email,$email2,res,fn);},
      function(fn){m.accountExists($email,res,fn);},
      function(fn){
        user.email = $email;
        user.save(function(err){
          res.send({status:'ok', newEmail: user.email, message: 'Your email address has been updated successfully!'});
        });
      }
    ]);
  });
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
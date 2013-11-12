var mongoose = require('mongoose');
var User = mongoose.model('User');

// Get User Object
exports.getUser = function(req,res,next) {
  if (req.session.userId) {
    User.findById(req.session.userId,function(err, user){
      res.locals.user = user;
      next();
    });
  } else {
    next();
  }
};

// Restrict Page Views
exports.checkAuth = function(req,res,next){
  if (req.session.userId) {
    next();
  } else {
    var lastPage = req.url.substr(1,req.url.length);
    res.redirect('/login?redirect='+lastPage);
  }
};


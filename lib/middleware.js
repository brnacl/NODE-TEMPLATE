var mongoose = require('mongoose');
var User = mongoose.model('User');
var fs = require('fs');

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

//File Upload

exports.getFileFromForm = function(tmpFilePath,fn){
  fs.readFile(tmpFilePath, function (err, file) {
    fn(err,file);
  });
};

exports.dirExists = function(newPath,fn){
  fs.exists(newPath, function (ex){
    console.log(ex);

    fn(null,ex);

  });
};

exports.createDir = function(newPath,fn){
  fs.mkdir(newPath, 0777, function (){
    fn();
  });
};

exports.createFile = function(path,file,fn){
  fs.writeFile(path, file, function (err) {
    fn(err);
  });
};



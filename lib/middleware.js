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

exports.getFilesFromForm = function(newFiles,fn){
  var files = [];
  var file;
  for (var i = 0; i< newFiles.length; i++){
    file = fs.readFileSync(newFiles[i].tmpPath);
    files.push(file);
  }
  console.log (files.length);
  fn(null,files);
};

exports.dirExists = function(newPath,fn){
  fs.exists(newPath, function (ex){
    fn(null,ex);
  });
};

exports.createDir = function(newPath,fn){
  fs.mkdir(newPath, 0777, function (){
    fn();
  });
};

exports.createFiles = function(newFiles,fileData,fn){
  for (var i = 0; i< newFiles.length; i++){
    fs.writeFileSync(newFiles[i].newPath, fileData[i]);
    fs.unlinkSync(newFiles[i].tmpPath);
  }
  fn();
};

exports.validateRegistration = function(data) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var isValid = re.test(data.email);
  if(!isValid){
    return 'invalid';
  }
  if(!data.password){
    return 'nopassword';
  }
  if(!data.password2){
    return 'nopassword2';
  }
  if(data.password !== data.password2){
    return 'nomatch';
  }
  return 'ok';
}
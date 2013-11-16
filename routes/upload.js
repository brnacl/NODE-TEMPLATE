//var __ = require('lodash');
var async = require('async');
var m = require('../lib/middleware');

/*
 * GET /upload
 */

exports.index = function(req, res){
  res.render('upload/index',
    {
      title: 'Upload',
      heading: 'Upload',
      userName: res.locals.user ? res.locals.user.email : null
    }
  );
};

exports.create = function(req, res){
  var tmpFilePath = req.files.imageUpload.path;
  var newDirname = 'projects/';
  var newDir = __dirname + '/../public/uploads/' + newDirname;
  var newFilename = 'dajkfhldkjfhalkdjfhlajsdhflakjsdhflajsh.jpg';
  var newFilePath = newDir + newFilename;
  var $FILE;

  async.waterfall([
    function(fn){m.getFileFromForm(tmpFilePath,fn);},
    function(file,fn){$FILE = file; m.dirExists(newDir,fn);},
    function(exists,fn){if(!exists){m.createDir(newDir,fn);}else{fn();}},
    function(fn){m.createFile(newFilePath,$FILE,fn);},
    function(fn){fn(null,res.send('ok'));}
  ]);
};



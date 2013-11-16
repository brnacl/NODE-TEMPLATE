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
  var newDirname = 'projects/';
  var newDir = 'public/uploads/' + newDirname;
  var newFiles = [];
  var newFile;
  var $FILEDATA;
  for(var i in req.files) {
    newFile = {};
    newFile.name = req.files[i].name;
    newFile.tmpPath = req.files[i].path;
    newFile.newPath = newDir + req.files[i].name;
    newFiles.push(newFile);
  }
  async.waterfall([
    function(fn){m.getFilesFromForm(newFiles,fn);},
    function(files,fn){$FILEDATA = files; m.dirExists(newDir,fn);},
    function(exists,fn){if(!exists){m.createDir(newDir,fn);}else{fn();}},
    function(fn){m.createFiles(newFiles,$FILEDATA,fn);},
    function(fn){fn(null,res.send('ok'));}
  ]);
};
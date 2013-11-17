//var __ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var m = require('../lib/middleware');
var File = mongoose.model('File');

/*
 * GET /upload
 */

exports.index = function(req, res){
  File.find({postId: 1001},function(err,images){
    if(err){
      res.send(err);
    } else {
      res.render('upload/index',
        {
          title: 'Upload',
          heading: 'Upload',
          userName: res.locals.user ? res.locals.user.email : null,
          images: images ? images : null
        }
      );
    }
  });
};

exports.create = function(req, res){
  var newDirname = req.body.postId + '/';
  var newDir = 'public/uploads/' + newDirname;
  var newFiles = [];
  var newFile;
  var $FILEDATA;

  for(var i in req.files) {
    newFile = {};

    newFile.name = req.files[i].name;
    newFile.tmpPath = req.files[i].path;
    newFile.newPath = newDir + req.files[i].name;
    newFile.type = req.files[i].type;
    newFiles.push(newFile);
  }
  async.waterfall([
    function(fn){m.getFilesFromForm(newFiles,fn);},
    function(files,fn){$FILEDATA = files; m.dirExists(newDir,fn);},
    function(exists,fn){if(!exists){m.createDir(newDir,fn);}else{fn();}},
    function(fn){m.createFiles(newFiles,$FILEDATA,fn);},
    function(fn){
      for(var f = 0;f < newFiles.length;f++){
        var dbFile = new File();
        dbFile.name = newFiles[f].name;
        dbFile.type = newFiles[f].type;
        dbFile.postId = req.body.postId;
        dbFile.save();
      }
      res.send('ok');
    }
  ]);
};
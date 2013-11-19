//var __ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var m = require('../lib/middleware');
var File = mongoose.model('File');
var Post = mongoose.model('Post');
var fs = require('fs');

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

/*
 * POST /upload
 */

exports.create = function(req, res){
  var newDirname = req.body.postId + '/';
  var newDir = 'public/uploads/' + newDirname;
  var newFiles = [];
  var newFile, $FILEDATA;
  var newIds = [];

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
        dbFile.createdBy = res.locals.user.email;
        dbFile.save(function(err,result){
          newIds.push(result.id);
        });
      }
      fn();
    },
    function(fn){
      Post.findById(req.body.postId,function(err,post){
        for(var x = 0; x < newIds.length; x++){
          post.files.push(newIds[x]);
        }
        post.save();
        res.send('ok');
      });
    }
  ]);
};


/*
 * DELETE /upload
 */

exports.delete = function(req,res){
  var fileId = req.body.fileId;
  if(fileId){
    File.findById(fileId,function(err,file){
      if(err){
        res.send({status: err});
      } else {
        var filePath = 'public/uploads/' + file.postId + '/' + file.name;
        File.findByIdAndRemove(fileId,function(err){
          fs.exists(filePath, function (ex){
            if(ex){
              fs.unlinkSync(filePath);
              res.send({status: 'ok'});
            } else {
              res.send({status: 'file not found'});
            }
          });
        });
      }
    });
  }
};
//var __ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var m = require('../lib/middleware');
var fs = require('fs');
var File = mongoose.model('File');
var Post = mongoose.model('Post');
var User = mongoose.model('User');



/*
 * GET /admin
 */

exports.index = function(req, res){
  User.find(function(err,users){
    Post.find(function(err,posts){
      File.find(function(err,files){
        res.render('admin/index',
          {
            title: 'Admin',
            heading: 'Admin',
            userCount: users ? users.length : null,
            postCount: posts ? posts.length : null,
            fileCount: files ? files.length : null,
            user: res.locals.user ? res.locals.user : null
          }
        );
      });
    });
  });
};

/*
 * GET /admin/users
 */

exports.users = function(req, res){
  User.find(function(err,users){
    res.render('admin/users',
      {
        title: 'Admin - Users',
        heading: 'Admin - Users',
        userData: users ? users : null,
        user: res.locals.user ? res.locals.user : null
      }
    );
  });
};


/*
 * GET /admin/posts
 */

exports.posts = function(req, res){
  Post.find(function(err,posts){
    res.render('admin/posts',
      {
        title: 'Admin - Posts',
        heading: 'Admin - Posts',
        posts: posts ? posts : null,
        user: res.locals.user ? res.locals.user : null
      }
    );
  });
};

/*
 * GET /admin/posts/new
 */

exports.newPost = function(req, res){

  res.render('admin/newPost',
    {
      title: 'Admin - New Post',
      heading: 'Admin - New Post',
      user: res.locals.user ? res.locals.user : null
    }
  );
};

/*
 * GET /admin/files
 */

exports.files = function(req, res){
  File.find().populate('post').exec(function(err,files){
    res.render('admin/files',
      {
        title: 'Admin - Files',
        heading: 'Admin - Files',
        files: files ? files : null,
        user: res.locals.user ? res.locals.user : null
      }
    );
  });
};

/*
 * POST /admin/posts
 */

exports.createPost = function(req, res){
  var title = req.body.postTitle;
  var content = req.body.postContent;
  var author = res.locals.user.email;
  var newPost = new Post();
  newPost.title = title;
  newPost.content = content;
  newPost.createdBy = author;
  newPost.save(function(err, post){
    if(err){res.send({status: 'error'});} else {res.send({status: 'ok', newPostId: post.id});}
  });
};

/*
 * POST /admin/files
 */

exports.createFiles = function(req, res){
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
        dbFile.post = req.body.postId;
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
 * DELETE /admin/files
 */

exports.deleteFile = function(req,res){
  var fileId = req.body.fileId;
  if(fileId){
    File.findById(fileId,function(err,file){
      if(err){
        res.send({status: err});
      } else {
        var filePath = 'public/uploads/' + file.post + '/' + file.name;
        File.findByIdAndRemove(fileId,function(err){
          fs.exists(filePath, function (ex){
            if(ex){
              fs.unlinkSync(filePath);
              Post.findById(file.post,function(err,post){
                var index = post.files.indexOf(fileId);
                if (index > -1) {
                  post.files.splice(index, 1);
                }
                post.save(function(err,post){
                  res.send({status: 'ok'});
                });
              });
            } else {
              res.send({status: 'file not found'});
            }
          });
        });
      }
    });
  }
};

/*
 * DELETE /admin/posts
 */

exports.deletePost = function(req,res){
  var postId = req.body.postId;
  if(postId){
    Post.findByIdAndRemove(postId, function(err,post){
      if(post.files.length > 0){
        var fileIds = post.files;
        for(var i = 0; i < fileIds.length; i++){
          File.findByIdAndRemove(fileIds[i],function(err,file){
            var filePath = 'public/uploads/' + postId + '/' + file.name;
            fs.unlinkSync(filePath);
            var remainingFiles = fs.readdirSync('public/uploads/'+postId+'/');
            if(remainingFiles.length === 0){
              fs.rmdirSync('public/uploads/'+postId+'/');
            }
          });
        }
      }
      if(err){
        res.send({status: 'error'});
      } else {
        res.send({status: 'ok'});
      }
    });
  }
};

/*
 * DELETE /admin/users
 */

exports.deleteUser = function(req,res){
  var userId = req.body.userId;
  if(userId){
    User.findByIdAndRemove(userId, function(err,user){
      if(err){
        res.send({status: 'error'});
      } else {
        res.send({status: 'ok'});
      }
    });
  }
};
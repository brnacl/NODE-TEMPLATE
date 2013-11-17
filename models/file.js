var mongoose = require('mongoose');

var File = mongoose.Schema({
  name       : {type: String, required: true},
  type       : {type: String, required: true},
  postId     : {type: Number, required: true},
  createdAt  : {type: Date, default: Date.now}
});

mongoose.model('File', File);
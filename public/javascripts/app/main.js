$(document).ready(initialize);

var socket;
var name;
var player;
var color;

function initialize(){
  $(document).foundation();
  initializeSocketIO();
  $('#register').on('click', clickRegister);
  $('#login').on('click', clickLogin);
  $('#logout-button').on('click', clickLogout);
  $('#savefiles').on('click', clickSaveFiles);
  $('#add-image').on('click', clickAddImage);
  $('#update-account').on('click', clickUpdateAccount);
  $('#update-profile').on('click', clickUpdateProfile);
  $('#update-profilePic').on('click', clickUpdateProfilePic);
  $('a.update-post').on('click', clickUpdatePost);
  $('a.create-post').on('click', clickCreatePost);
  $('body').find('a.delete-image').on('click', clickDeleteFile);
  $('body').find('a.delete-post').on('click', clickDeletePost);
  $('body').find('a.delete-user').on('click', clickDeleteUser);
}

function clickRegister(e){
  var url = '/users';
  var data = $('form#registration').serialize();
  sendAjaxRequest(url, data, 'post', null, e, function(data){
    htmlRegisterComplete(data);
  });
}

function clickLogin(e){
  var url = '/login';
  var data = $('form#authentication').serialize();
  sendAjaxRequest(url, data, 'post', 'put', e, function(data){
    htmlLoginComplete(data);
  });
}

function clickLogout(e){
  var url = '/logout';
  sendAjaxRequest(url, {}, 'post', 'delete', e, function(data){
    window.location = '/login';
  });
}

function clickSaveFiles(e){
  // if($('input[name="file1"]').val() !== ''){

    var url = '/upload';
    var data = new FormData();
    var file, fileName, fileType, isImage;
    $('#file-upload input[type="file"]').each(function(i){
      if(this.files[0]){
        fileType = this.files[0].type;
        isImage = validateImageFileType(fileType);
        if(isImage){
          file = this.files[0];
          fileName = $(this).attr('name');
          data.append(fileName,file);
        }
      }
    });
    if(!isImage){
      return $('#upload-error').text('All files must be images (.jpg, .png, .gif)');
    } else {
      data.append('postId', $('#postId').val());
      sendAjaxFiles(url, data, 'post', null, e, function(result){
        window.location = '/upload';
      });
    }

  // }

}

function clickAddImage(e){
  var totalInputs = $('#new-post input[type="file"]').length;
  var fileNum = totalInputs +1;
  $newInput = $('<div class="row"><div class="small-12 columns"><input id="file'+fileNum+'" type="file" name="file'+fileNum+'" /></div></div>');
  $newInput.insertBefore($('#new-post div.row.add-image'));
}

function clickCreatePost(e){
  var url = '/admin/posts';
  var data = {};
  var file, fileName, fileType, isImage;
  var fileData = new FormData();

  data.postTitle = $('#new-post input[name="title"]').val();
  data.postContent = $('#new-post textarea[name="content"]').val();
  sendAjaxRequest(url, data, 'post', null, e, function(result){
    switch(result.status){
      case 'ok':
      if($('#new-post input#file1').val()){
        url = '/admin/files';
        $('#new-post input[type="file"]').each(function(i){
          if(this.files[0]){
            fileType = this.files[0].type;
            isImage = validateImageFileType(fileType);
            if(isImage){
              file = this.files[0];
              fileName = $(this).attr('name');
              fileData.append(fileName,file);
            }
          }
        });
        if(!isImage){
          return $('#post-error').text('All files must be images (.jpg, .png, .gif)');
        } else {
          fileData.append('postId', result.newPostId);
          sendAjaxFiles(url, fileData, 'post', null, e, function(r){
            window.location = '/admin/posts';
          });
        }
      } else {
        window.location = '/admin/posts';
      }
      break;
      case 'error':
        $('#post-error').text('You must at least enter a title for your post!');
      break;
    }
    console.log(result);
  });
}

function clickUpdatePost(e){
  var postId = $(this).data('post-id');
  var url = '/admin/posts/'+postId;
  var data = {};
  var file, fileName, fileType, isImage;
  var fileData = new FormData();

  data.postTitle = $('#new-post input[name="title"]').val();
  data.postContent = $('#new-post textarea[name="content"]').val();
  sendAjaxRequest(url, data, 'post', 'put', e, function(result){
    switch(result.status){
      case 'ok':
      if($('#new-post input#file1').val()){
        url = '/admin/files';
        $('#new-post input[type="file"]').each(function(i){
          if(this.files[0]){
            fileType = this.files[0].type;
            isImage = validateImageFileType(fileType);
            if(isImage){
              file = this.files[0];
              fileName = $(this).attr('name');
              fileData.append(fileName,file);
            }
          }
        });
        if(!isImage){
          return $('#post-error').text('All files must be images (.jpg, .png, .gif)');
        } else {
          fileData.append('postId', result.postId);
          sendAjaxFiles(url, fileData, 'post', null, e, function(r){
            window.location = '/admin/posts';
          });
        }
      } else {
        window.location = '/admin/posts';
      }
      break;
      case 'error':
        $('#post-error').text('You must at least enter a title for your post!');
      break;
    }
    console.log(result);
  });
}

function clickDeleteFile(e){
  var url = '/admin/files';
  var data = {};
  var $deleteButton = $(this);
  data.fileId = $(this).data('file-id');
  sendAjaxRequest(url, data, 'post', 'delete', e, function(data){
    switch(data.status){
      case 'ok':
        $deleteButton.closest('.image-container').remove();
      break;
      default:
        $('p#delete-error').text(data.status);
      break;
    }
  });
}

function clickDeletePost(e){
  var url = '/admin/posts';
  var data = {};
  var $deleteButton = $(this);
  data.postId = $(this).data('post-id');
  sendAjaxRequest(url, data, 'post', 'delete', e, function(data){
    switch(data.status){
      case 'ok':
        $deleteButton.parent().parent().remove();
      break;
      case 'error':
        $('p#delete-error').text('There was an error deleting the post');
      break;
    }
  });
}

function clickDeleteUser(e){
  var url = '/admin/users';
  var data = {};
  var $deleteButton = $(this);
  data.userId = $(this).data('user-id');
  sendAjaxRequest(url, data, 'post', 'delete', e, function(data){
    switch(data.status){
      case 'ok':
        $deleteButton.parent().parent().remove();
      break;
      case 'error':
        $('p#delete-error').text('There was an error deleting the user');
      break;
    }
  });
}

// Profile Edit

function clickUpdateAccount(e) {
  var url = '/users';
  var data = $('form#account').serialize();
  sendAjaxRequest(url, data, 'post', 'put', e, function(data){
    htmlUpdateAccountComplete(data);
  });


}

function clickUpdateProfile(e) {
  alert();


}

function clickUpdateProfilePic(e) {
  alert();


}

function initializeSocketIO(){
  var port = location.port ? location.port : '80';
  var url = location.protocol + '//' + location.hostname + ':' + port + '/app';

  socket = io.connect(url);
  socket.on('connected', socketConnected);
}

function socketConnected(data){
  console.log(data);
}

function htmlRegisterComplete(data) {
  switch(data.status){
    case 'ok':
      window.location = '/login?signup=true';
    break;
    case 'invalid':
      $('p#register-error').text('Please use a valid email address');
    break;
    case 'nopassword':
      $('p#register-error').text('Please enter a password');
    break;
    case 'nopassword2':
      $('p#register-error').text('Please re-type your password');
    break;
    case 'nomatch':
      $('p#register-error').text('Passwords must match exactly');
      $('input[name="password2"]').val('');
    break;
    case 'error':
      $('p#register-error').text('Account already exists');
    break;
  }
}

function htmlLoginComplete(data) {
  switch(data.status){
    case 'ok':
      var url = '/';
      var redirect = getUrlVars()['redirect'];
      if(redirect) url = url + redirect;
      window.location = url;
    break;
    default:
      $('p#login-error').empty().append('Invalid Email or Password');
    break;
  }
}

function htmlUpdateAccountComplete(data) {
  switch(data.status){
    case 'ok':
       $('p#account-status').text(data.message);
       $('section.top-bar-section span.username').text(data.newEmail);
    break;
    case 'invalid':
      $('p#account-status').text('Please use a valid email address');
    break;
    case 'nopassword':
      $('p#account-status').text('Please enter your current password');
      $('form#account input[name="oldPassword"]').focus();
    break;
    case 'badpassword':
      $('p#account-status').text('Please re-enter your current password');
      $('form#account input[name="oldPassword"]').val('').focus();
    break;
    case 'emailexists':
      $('p#account-status').text('An account with that email address already exists');
      $('form#account input[name="email"]').focus();
    break;
    case 'nonewpassword2':
      $('p#account-status').text('Please re-enter your new password');
      $('form#account input[name="newPassword2"]').focus();
    break;
    case 'nomatch':
      $('p#account-status').text('New password must be entered twice');
      $('form#account input[name="newPassword2"]').val('').focus();
    break;
    case 'nochanges':
      $('p#account-status').text('Account saved');
    break;
  }
}
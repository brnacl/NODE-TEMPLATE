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
  $('.uploaded-images').find('.delete-image').on('click', clickDeleteImage);
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

function clickAddFileInput(){

}

function clickDeleteImage(){
  var url = '/upload';
  var data = {};
  data.imageId = $(this).data('image-id');
  // sendAjaxRequest(url, data, 'post', 'delete', e, function(data){
    $(this).parent().parent().remove();
  // });

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
      window.location = '/login?newreg=true';
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
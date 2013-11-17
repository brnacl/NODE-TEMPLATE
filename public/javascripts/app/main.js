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
        window.location = '/';
      });
    }

  // }

}

function clickAddFile(){

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
      window.location = '/login';
    break;

    default:
      $('p#register-error').empty().append('Account already exists');
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
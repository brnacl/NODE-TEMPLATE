exports.connection = function(socket){
  socket.emit('connected', {status: 'connected'});
  socket.on('disconnect', socketDisconnect);
  socket.on('startgame', socketStartGame);
};

function socketDisconnect(){
}

function socketStartGame(data){
  console.log('Recieved a startgame message from the browser');
  console.log(data);
}

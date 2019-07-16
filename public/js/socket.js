const socket = io();

socket.on('connect', () => {
  console.log('Connected!!');
});

socket.on('friend status changed', friend => {
  console.log(friend.name + ' is ' + friend.status + '!');
  document.getElementById(friend.id).className = friend.status;
});

socket.on('join game', friend => {
  console.log(friend.name + ' requests to join a game!');
  if (confirm(friend.name + ' requests you to join his game!')) {
    socket.emit('accept request', friend.id);
    location.href = 'game';
  }
});

socket.on('request accepted', friend => {
  console.log('request accepted!');
  location.href = 'game';
});

function sendrequest(friend) {
  if (friend.className.search('online') !== -1)
    socket.emit('join game', friend.id);
}

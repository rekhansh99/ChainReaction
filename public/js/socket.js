const socket = io();

socket.on('connect', () => {
  console.log('Connected!!');
});

socket.on('friend status changed', friend => {
  console.log(friend.name + ' is ' + friend.status + '!');
  document.getElementById(friend.id).className = friend.status;
});

socket.on('message', data => {
  console.log(data);
});

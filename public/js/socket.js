const socket = io();

socket.on('connect', () => {
  console.log('Connected!!');
});

socket.on('message', data => {
  console.log(data);
});

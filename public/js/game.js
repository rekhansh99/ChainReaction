const canvas = document.getElementById('game-grid');
const context = canvas.getContext('2d');
const width = canvas.width = canvas.scrollWidth;
const height = canvas.height = canvas.scrollHeight;

const grid = [];

function drawGrid(color) {
  context.strokeStyle = color;
  context.lineWidth = 1;
  for (let i = 1; i < 10; i++) {
    context.beginPath();
    context.moveTo(Math.floor(width * i / 10), 0);
    context.lineTo(Math.floor(width * i / 10), height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, Math.floor(height * i / 10));
    context.lineTo(width, Math.floor(height * i / 10));
    context.stroke();
  }
}

const socket = io();

socket.on('connect', () => {
  console.log('Connected!!');
});

socket.on('friend status changed', friend => {
  console.log(friend.name + ' is ' + friend.status + '!');
  document.getElementById(friend.id).className = friend.status;
});

socket.on('request accepted', friend => {
  console.log('request accepted!');
  const friendnode = document.getElementById('friend');
  friendnode.children[0].src = friend.picture;
  friendnode.children[1].innerHTML = friend.name;
  friendnode.style.visibility = 'visible';
  document.getElementById('overlay').style.display = 'none';
});

function sendrequest(friend) {
  if (friend.className.search('online') !== -1)
    socket.emit('join game', friend.id);
}

drawGrid('#ff0000');

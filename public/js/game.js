const canvas = document.getElementById('game-grid');
const context = canvas.getContext('2d');
let width = canvas.width = canvas.scrollWidth;
let height = canvas.height = canvas.scrollHeight;

const grid = [];
let color;
const me = document.getElementById('me').className.split(' ')[1];
const critical = [];

function drawGrid() {
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

socket.on('start', turn => start(turn));

socket.on('move', (x, y, turn) => makemove(x, y, turn));

socket.on('gameover', winner => {
  alert(winner + ' wins!!!');
  location.href = '/dashboard';
});

function sendrequest(friend) {
  if (friend.className.search('online') !== -1)
    socket.emit('join game', friend.id);
}

function start(turn) {
  console.log('Let\'s begin!');
  color = turn;

  for (let i = 0; i < 10; i++) {
    grid[i] = [];
    for (let j = 0; j < 10; j++)
      grid[i][j] = { owner: 'none', count: 0 };
  }

  resetGrid();
  drawGrid();

  window.addEventListener('resize', resize());
  canvas.addEventListener('click', onclick);
}

function resetGrid() {
  context.fillStyle = '#000000';
  context.clearRect(0, 0, width, height);
}

function resize() {
  width = canvas.width = canvas.scrollWidth;
  height = canvas.height = canvas.scrollHeight;
  updateGrid();
}

function onclick(e) {
  console.log(e);
  const x = Math.floor(e.offsetX * 10 / width), y = Math.floor(e.offsetY * 10 / height);

  socket.emit('move', x, y);
}

function makemove(x, y, turn) {
  color = turn;
  console.log('Time to make a move!');
  addAtom(x, y);

  while (critical.length > 0) {
    const cell = critical.shift();

    if (cell[0] !== 0) {
      addAtom(cell[0] - 1, cell[1]);
      grid[cell[0]][cell[1]].count--;
    }

    if (cell[0] !== 9) {
      addAtom(cell[0] + 1, cell[1]);
      grid[cell[0]][cell[1]].count--;
    }

    if (cell[1] !== 0) {
      addAtom(cell[0], cell[1] - 1);
      grid[cell[0]][cell[1]].count--;
    }

    if (cell[1] !== 9) {
      addAtom(cell[0], cell[1] + 1);
      grid[cell[0]][cell[1]].count--;
    }
  }

  color = turn === 'red' ? 'blue' : 'red';
  updateGrid();
}

function addAtom(x, y) {
  grid[x][y].owner = color;
  grid[x][y].count++;

  if (isCritical(x, y))
    critical.push([x, y]);
}

function isCritical(x, y) {
  if ((x === 0 || x === 9) && (y === 0 || y === 9)) {
    if (grid[x][y].count >= 2)
      return true;
  }
  else if ((x === 0 || x === 9) || (y === 0 || y === 9)) {
    if (grid[x][y].count >= 3)
      return true;
  }
  else {
    if (grid[x][y].count >= 4)
      return true;
  }

  return false;
}

function updateGrid() {
  resetGrid();
  drawGrid();

  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 10; j++)
      switch (grid[i][j].count) {
        case 1:
          drawOne(i, j, grid[i][j].owner);
          break;
        case 2:
          drawTwo(i, j, grid[i][j].owner);
          break;
        case 3:
          drawThree(i, j, grid[i][j].owner);
          break;
      }
}

function drawOne(i, j, color) {
  const rad = Math.floor(Math.min(width, height) / 40);

  let x = Math.floor(width / 10) * i + Math.floor(width / 20);
  let y = Math.floor(height / 10) * j + Math.floor(height / 20);

  context.beginPath();
  context.fillStyle = color;
  context.arc(x, y, rad, 0, 2 * Math.PI);
  context.fill();
}

function drawTwo(i, j, color) {
  const rad = Math.floor(Math.min(width, height) / 40);

  let x = Math.floor(width / 10) * i + Math.floor(width / 40);
  let y = Math.floor(height / 10) * j + Math.floor(height / 40);

  context.beginPath();
  context.fillStyle = color;
  context.arc(x, y, rad, 0, 2 * Math.PI);
  context.fill();

  x = Math.floor(width / 10) * i + Math.floor(3 * width / 40);
  y = Math.floor(height / 10) * j + Math.floor(3 * height / 40);

  context.beginPath();
  context.fillStyle = color;
  context.arc(x, y, rad, 0, 2 * Math.PI);
  context.fill();
}

function drawThree(i, j, color) {
  const rad = Math.floor(Math.min(width, height) / 40);

  let x = Math.floor(width / 10) * i + Math.floor(width / 40);
  let y = Math.floor(height / 10) * j + Math.floor(height / 40);

  context.beginPath();
  context.fillStyle = color;
  context.arc(x, y, rad, 0, 2 * Math.PI);
  context.fill();

  x = Math.floor(width / 10) * i + Math.floor(width / 40);
  y = Math.floor(height / 10) * j + Math.floor(3 * height / 40);

  context.beginPath();
  context.fillStyle = color;
  context.arc(x, y, rad, 0, 2 * Math.PI);
  context.fill();

  x = Math.floor(width / 10) * i + Math.floor(3 * width / 40);
  y = Math.floor(height / 10) * j + Math.floor(height / 40);

  context.beginPath();
  context.fillStyle = color;
  context.arc(x, y, rad, 0, 2 * Math.PI);
  context.fill();
}
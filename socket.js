const store = require('./controllers/sessionController').store();
const User = require('./models/user');
const Room = require('./models/gameroom');

let io;
const critical = [];

module.exports.init = server => {
  io = require('socket.io')(server);

  io.engine.generateId = generateId;

  io.use(verifySocket);

  io.on('connection', socket => {
    const q = new URL(socket.request.headers.referer);
    if (q.pathname === '/game') {
      setStatus(socket, 'ingame');
      socket.gameroom = q.searchParams.get('room');
      socket.join(socket.gameroom, err => {
        if (socket.adapter.rooms[socket.gameroom].length === 2)
          io.to(socket.gameroom).emit('start', 'red');
      });
    }
    else
      setStatus(socket, 'online');

    socket.on('disconnect', () => {
      socket.leave(socket.gameroom);
      setStatus(socket, 'offline');
    });

    socket.on('join game', friend =>
      socket.to(friend).emit('join game', {
        name: socket.user.name,
        id: socket.id
      }, socket.gameroom));

    socket.on('accept request', friendId =>
      socket.to(friendId).emit('request accepted', {
        name: socket.user.name,
        picture: socket.user.picture,
        color: 'blue'
      }));

    socket.on('move', (x, y) => {
      const room = Room.rooms[socket.gameroom];
      console.log(room.turn);
      console.log(room.grid[x][y].owner);

      if (room[room.turn] === socket.id && (room.grid[x][y].owner === room.turn || room.grid[x][y].owner === 'none')) {
        io.in(socket.gameroom).emit('move', x, y, room.turn);
        room.moves++;
        makemove(room.grid, x, y, room.turn);
        let winner = checkGameOver(room);
        if (winner !== false)
          io.in(socket.gameroom).emit('gameover', winner);
        room.turn = (room.turn === 'red' ? 'blue' : 'red');
      }
    });
  });
};

function makemove(grid, x, y, turn) {
  addAtom(grid, x, y, turn);

  while (critical.length > 0) {
    const cell = critical.shift();

    if (cell[0] !== 0) {
      addAtom(grid, cell[0] - 1, cell[1], turn);
      grid[cell[0]][cell[1]].count--;
    }

    if (cell[0] !== 9) {
      addAtom(grid, cell[0] + 1, cell[1], turn);
      grid[cell[0]][cell[1]].count--;
    }

    if (cell[1] !== 0) {
      addAtom(grid, cell[0], cell[1] - 1, turn);
      grid[cell[0]][cell[1]].count--;
    }

    if (cell[1] !== 9) {
      addAtom(grid, cell[0], cell[1] + 1, turn);
      grid[cell[0]][cell[1]].count--;
    }

    if (grid[cell[0]][cell[1]].count === 0)
      grid[cell[0]][cell[1]].owner = 'none';
  }
}

function addAtom(grid, x, y, turn) {
  grid[x][y].owner = turn;
  grid[x][y].count++;

  if (isCritical(grid, x, y))
    critical.push([x, y]);
}

function isCritical(grid, x, y) {
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

function checkGameOver(room) {
  if (room.moves < 2)
    return false;

  let red = 0, blue = 0;

  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 10; j++)
      if (room.grid[i][j].owner === 'red')
        red++;
      else if (room.grid[i][j].owner === 'blue')
        blue++;

  if (red === 0)
    return 'blue';
  if (blue === 0)
    return 'red';

  return false;
}

function verifySocket(socket, next) {
  if (socket.id !== -1)
    User.findById(socket.id, (err, user) => {
      socket.user = user;
      next();
    });
  else
    next(new Error('No valid Session found.'));
}

function generateId(req) {
  return new Promise((resolve, reject) => {
    if (req.headers.cookie) {
      const cookies = require('cookie').parse(req.headers.cookie);
      store.get(cookies['connect.sid'].split('.')[0].slice(2), (err, sess) => {
        if (err) throw err;
        if (!sess) return resolve(-1);

        User.findById(sess.passport.user, (err, user) => {
          if (err) throw err;

          resolve(user._id);
        });
      });
    }
    else
      resolve(-1);
  });
}

function setStatus(socket, status) {
  socket.user.status = status;
  socket.user.save();

  socket.user.friends.forEach(friend =>
    socket.to(friend).emit('friend status changed', {
      name: socket.user.name,
      id: socket.id,
      status: socket.user.status
    }));
}
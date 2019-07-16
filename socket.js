const store = require('./controllers/sessionController').store();
const User = require('./models/user');
const Room = require('./models/gameroom');

let io;

module.exports.init = server => {
  io = require('socket.io')(server);

  io.engine.generateId = generateId;

  io.use(verifySocket);

  io.on('connection', socket => {
    const q = new URL(socket.request.headers.referer);
    if (q.pathname === '/game') {
      setStatus(socket, 'ingame');
      socket.gameroom = q.searchParams.get('room');
      socket.join(socket.gameroom);
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

  });
};

module.exports.getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

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
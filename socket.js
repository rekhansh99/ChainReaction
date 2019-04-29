const store = require('./controllers/sessionController').store();
const User = require('./models/user');

let io;

module.exports.init = server => {
  io = require('socket.io')(server);

  io.engine.generateId = generateId;

  io.use(verifySocket);

  io.on('connection', socket => {
    socket.on('disconnect', () => {
      socket.user.status = 'offline';
      socket.user.save();

      socket.user.friends.forEach(friend =>
        socket.to(friend).emit('friend status changed', {
          name: socket.user.name,
          id: socket.id,
          status: socket.user.status
        }));
    });
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
      socket.user.status = 'online';
      socket.user.save();

      socket.user.friends.forEach(friend =>
        socket.to(friend).emit('friend status changed', {
          name: socket.user.name,
          id: socket.id,
          status: socket.user.status
        }));

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

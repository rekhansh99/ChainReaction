const authController = require('./controllers/authController');

let io;

module.exports.init = server => {
  io = require('socket.io')(server);

  io.use(authController.verifySocket);

  io.on('connection', socket => {
    socket.on('disconnect', () => {
      socket.user.online = false;
      socket.user.save();
    });
  });
};

module.exports.getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

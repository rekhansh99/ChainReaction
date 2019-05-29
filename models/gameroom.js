const mongoose = require('mongoose');

const GameRoom = new mongoose.Schema({
  player: [String]
});

module.exports = mongoose.model('room', GameRoom);
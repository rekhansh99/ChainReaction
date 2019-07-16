const mongoose = require('mongoose');

const GameRoom = new mongoose.Schema({
  _id: String,
  grid: {
    type: [[{
      _id: false,
      owner: String,
      atoms: Number
    }]],
    default: getDefaultGrid
  },
  red: String,
  blue: String,
  turn: String
});

function getDefaultGrid() {
  const grid = [];
  for (let i = 0; i < 10; i++) {
    grid[i] = [];
    for (let j = 0; j < 10; j++)
      grid[i][j] = { owner: 'none', count: 0 };
  }

  return grid;
}

module.exports = mongoose.model('room', GameRoom);
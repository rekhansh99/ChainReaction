const rooms = [];

module.exports = class GameRoom {
  constructor(id) {
    this.grid = getDefaultGrid();
    this.moves = 0;
    this.red = '';
    this.blue = '';
    this.turn = '';
    rooms[id] = this;
  }

  static get rooms() {
    return rooms;
  }
};

function getDefaultGrid() {
  const grid = [];
  for (let i = 0; i < 10; i++) {
    grid[i] = [];
    for (let j = 0; j < 10; j++)
      grid[i][j] = { owner: 'none', count: 0 };
  }

  return grid;
}

const mongoose = require('mongoose');

const User = new mongoose.Schema({
  _id: String,
  name: String,
  picture: String,
  friends: [String],
  status: {
    type: String,
    default: 'offline'
  },
  roomid: {
    type: Schema.Types.ObjectId,
    default: undefined
  }
});

module.exports = mongoose.model('User', User);
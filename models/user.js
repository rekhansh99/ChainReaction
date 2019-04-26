const mongoose = require('mongoose');

const User = new mongoose.Schema({
  _id: String,
  name: String,
  picture: String,
  friends: [{ name: String, id: String }],
  online: Boolean
});

module.exports = mongoose.model('User', User);
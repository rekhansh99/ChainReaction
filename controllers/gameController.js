const User = require('../models/user');
const Room = require('../models/gameroom');
const uniqid = require('uniqid');

module.exports = (req, res, next) => {
  if (req.query.room === undefined) {
    return res.redirect('/game?room=' + uniqid());
  } else {
    const user = {
      name: req.user.name,
      picture: req.user.picture,
      friends: [],
      friend: null
    };

    let room = Room.rooms[req.query.room];

    if (!room) {
      room = new Room(req.query.room);
      room.red = req.user._id;
      room.turn = 'red';

      user.color = 'red';
    } else {
      room.blue = req.user._id;
      user.color = 'blue';
    }

    const promises = [];

    req.user.friends.forEach(id => {
      promises.push(User.findById(id, (err, friend) => {
        user.friends.push({
          id: friend.id,
          name: friend.name,
          picture: friend.picture,
          status: friend.status
        });
        if (friend._id === room.red)
          user.friend = user.friends[user.friends.length - 1];
      }));
    });

    Promise.all(promises).then(() => res.render('game', user));
  }
};
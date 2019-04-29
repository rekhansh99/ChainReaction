const User = require('../models/user');

module.exports = (req, res, next) => {
  const user = {
    name: req.user.name,
    picture: req.user.picture,
    friends: []
  };
  const promises = [];

  req.user.friends.forEach(id => {
    promises.push(User.findById(id, (err, friend) => {
      user.friends.push({
        id: friend.id,
        name: friend.name,
        picture: friend.picture,
        status: friend.status
      });
    }));
  });

  Promise.all(promises).then(() =>
    res.render('dashboard', user)
  );
};
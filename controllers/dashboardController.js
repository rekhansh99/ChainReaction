const User = require('../models/user');

module.exports = (req, res, next) => {
  res.render('dashboard', {
    name: req.user.name,
    picture: req.user.picture
  });
};
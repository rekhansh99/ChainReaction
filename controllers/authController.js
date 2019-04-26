const imagetobase64 = require('image-to-base64');

const store = require('./sessionController').store();
const User = require('../models/user');

module.exports.verifyUser = (accessToken, refreshToken, profile, done) => {
  User.findById(profile.id, (err, user) => {
    if (err) return done(err);

    if (!user)
      user = new User({ _id: profile.id });

    user.name = profile.name.givenName + ' ' + profile.name.familyName;
    user.friends = profile._json.friends.data;
    user.online = false;

    const promises = [];

    user.friends.forEach(friend => promises.push(User.updateOne({ _id: friend.id },
      { $addToSet: { friends: { name: user.name, id: user.id } } })));

    promises.push(imagetobase64(profile.photos[0].value));

    Promise.all(promises).then(img => {
      user.picture = 'data:image/jpeg;base64,' + img;

      user.save((err, user) => {
        if (err) return done(err);
        done(null, user);
      });
    });
  });
};

module.exports.verifySocket = (socket, next) => {
  if (socket.request.headers.cookie) {
    const cookies = require('cookie').parse(socket.request.headers.cookie);
    store.get(cookies['connect.sid'].split('.')[0].slice(2), (err, sess) => {
      if (err) next(err);
      if (!sess)
        return;

      User.findById(sess.passport.user, (err, user) => {
        if (err) next(err);

        user.online = true;
        socket.user = user;
        user.save();
        next();
      });
    });
  }
};
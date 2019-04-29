const imagetobase64 = require('image-to-base64');

const User = require('../models/user');

module.exports.verifyUser = (accessToken, refreshToken, profile, done) => {
  User.findById(profile.id, (err, user) => {
    if (err) return done(err);

    if (!user)
      user = new User({ _id: profile.id });

    user.name = profile.name.givenName + ' ' + profile.name.familyName;
    user.friends = [];
    profile._json.friends.data.forEach(friend => user.friends.push(friend.id));

    const promises = [];

    user.friends.forEach(friend => promises.push(User.updateOne({ _id: friend },
      { $addToSet: { friends: user.id } })));

    promises.push(imagetobase64(profile.photos[0].value));

    Promise.all(promises).then(img => {
      user.picture = 'data:image/jpeg;base64,' + (img instanceof Array ? img[img.length - 1] : img);

      user.save((err, user) => {
        if (err) return done(err);
        done(null, user);
      });
    });
  });
};

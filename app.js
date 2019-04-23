const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const FBStrategy = require('passport-facebook');
const imagetobase64 = require('image-to-base64');

const authRouter = require('./routes/authRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');

const User = require('./models/user');
const config = require('./config.js');

passport.use(new FBStrategy({
  clientID: config.key,
  clientSecret: config.secret,
  callbackURL: config.redirect,
  profileFields: ['id', 'name', 'picture.type(large)', 'friends'],
  enableProof: true
}, (accessToken, refreshToken, profile, done) => {
  // console.log(JSON.stringify(profile, null, 4));

  User.findById(profile.id, (err, user) => {
    if (err) return done(err);

    if (!user)
      user = new User({ _id: profile.id });

    user.name = profile.name.givenName + ' ' + profile.name.familyName;
    user.friends = profile._json.friends.data;

    const promises = [];

    user.friends.forEach(friend => promises.push(User.updateOne({ _id: friend.id },
      { $addToSet: { friends: { name: user.name, id: user.id } } })));

    promises.push(imagetobase64(profile.photos[0].value));

    Promise.all(promises).then(img => {
      user.picture = 'data:image/jpeg;base64,' + img;

      user.save((err, user) => {
        if (err) return done(err);
        console.log(JSON.stringify(user, null, 4));
        done(null, user);
      });
    });
  });
}));

passport.serializeUser((user, done) => {
  console.log('Inside serializeUser callback.');
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  console.log('Inside deserializeUser callback.');
  User.findById(id, (err, user) => done(err, user));
});

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  store: new MongoDBStore({
    uri: 'mongodb://localhost:27017/ChainReaction',
    collection: 'sessions'
  }),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  rolling: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(dashboardRouter);
app.use('/auth', authRouter);

mongoose.connect('mongodb://localhost:27017/ChainReaction', { useNewUrlParser: true })
  .then(result => app.listen(3000, () => console.log('Listening on localhost:3000')))
  .catch(err => console.log(err));

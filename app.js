const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const FBStrategy = require('passport-facebook');

const store = require('./controllers/sessionController').createSessionStore(session);
const io = require('./socket');

const authRouter = require('./routes/authRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const gameRouter = require('./routes/gameRoutes');

const User = require('./models/user');
const authController = require('./controllers/authController');
const config = require('./config');

const isAuth = require('./middleware/is-auth');

passport.use(new FBStrategy({
  clientID: config.key,
  clientSecret: config.secret,
  callbackURL: config.redirect,
  profileFields: ['id', 'name', 'picture.type(large)', 'friends'],
  enableProof: true
}, authController.verifyUser));

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  store: store,
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
app.use('/game', isAuth, gameRouter);

mongoose.connect('mongodb://localhost:27017/ChainReaction', { useNewUrlParser: true })
  .then(result => {
    const server = app.listen(3000, () => console.log('Listening on localhost:3000'));
    io.init(server);
  })
  .catch(err => console.log(err));

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');

const authRouter = require('./routes/authRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');

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

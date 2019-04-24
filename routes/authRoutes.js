const express = require('express');
const passport = require('passport');
const FBStrategy = require('passport-facebook');

const User = require('../models/user');
const authController = require('../controllers/authController');
const config = require('../config');

passport.use(new FBStrategy({
  clientID: config.key,
  clientSecret: config.secret,
  callbackURL: config.redirect,
  profileFields: ['id', 'name', 'picture.type(large)', 'friends'],
  enableProof: true
}, authController.verifyUser));

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));

const router = express.Router();

router.get('/login', (req, res, next) => res.render('login'));
router.get('/facebook', passport.authenticate('facebook', { scope: 'user_friends' }));
router.get('/facebook/redirect', passport.authenticate('facebook', { failureRedirect: '/login', successRedirect: '/dashboard' }));

module.exports = router;
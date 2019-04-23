const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/facebook', passport.authenticate('facebook', { scope: 'user_friends' }));
router.get('/facebook/redirect', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res, next) => {
  res.redirect('/dashboard');
});

module.exports = router;
const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  if (req.user)
    return res.redirect('/dashboard');
  res.render('login');
});

router.get('/dashboard', (req, res, next) => {
  res.render('dashboard', { user: req.user });
});

module.exports = router;

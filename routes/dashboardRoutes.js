const express = require('express');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', isAuth);

router.get('/dashboard', isAuth, (req, res, next) => {
  res.render('dashboard', { user: req.user });
});

module.exports = router;

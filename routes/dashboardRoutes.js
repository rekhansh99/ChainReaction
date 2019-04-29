const express = require('express');

const isAuth = require('../middleware/is-auth');
const getDashboard = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', isAuth, getDashboard);

router.get('/dashboard', isAuth, getDashboard);

module.exports = router;

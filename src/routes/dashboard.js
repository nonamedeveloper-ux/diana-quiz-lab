const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const dashboard = require('../controllers/dashboardController');

router.get('/', requireAuth, dashboard.index);

module.exports = router;

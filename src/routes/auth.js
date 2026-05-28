const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');

router.get('/login', requireGuest, auth.showLogin);
router.post('/login', requireGuest, auth.login);
router.get('/logout', auth.logout);

module.exports = router;

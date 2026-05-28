const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const subjects = require('../controllers/subjectController');

router.get('/', requireAuth, subjects.index);
router.post('/', requireAuth, subjects.create);
router.put('/:id', requireAuth, subjects.update);
router.delete('/:id', requireAuth, subjects.destroy);

module.exports = router;

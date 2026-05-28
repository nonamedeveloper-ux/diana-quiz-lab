const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const gen = require('../controllers/generatorController');

router.get('/history', requireAuth, gen.history);
router.get('/', requireAuth, gen.showForm);
router.post('/', requireAuth, gen.generate);
router.get('/:id', requireAuth, gen.showResult);
router.delete('/:id', requireAuth, gen.deleteTest);
router.get('/:id/download/tests', requireAuth, gen.downloadTests);
router.get('/:id/download/key', requireAuth, gen.downloadKey);
router.get('/:id/download/excel', requireAuth, gen.downloadExcel);

module.exports = router;

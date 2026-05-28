const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const questions = require('../controllers/questionController');

const upload = multer({
  dest: path.join(__dirname, '..', '..', 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Faqat Excel fayllari (.xlsx, .xls) qabul qilinadi'));
  },
});

router.get('/template', requireAuth, questions.downloadTemplate);
router.get('/sample', requireAuth, questions.downloadSample);
router.get('/import', requireAuth, questions.showImport);
router.post('/import', requireAuth, upload.single('excelFile'), questions.importExcel);
router.get('/', requireAuth, questions.index);
router.post('/', requireAuth, questions.create);
router.put('/:id', requireAuth, questions.update);
router.delete('/:id', requireAuth, questions.destroy);

module.exports = router;

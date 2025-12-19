const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer'); // The middleware we made earlier
const recordController = require('../controllers/record.controller');

// POST /api/records/
// 'file' is the name of the form-data key your frontend must send
router.post('/', upload.single('file'), recordController.createRecord);

// GET /api/records/
router.get('/', recordController.getAllRecords);

module.exports = router;
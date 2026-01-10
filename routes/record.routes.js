const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const recordController = require('../controllers/record.controller');

// POST /api/records/
router.post('/', upload.single('file'), recordController.createRecord);

// GET /api/records/
router.get('/', recordController.getAllRecords);

// DELETE /api/records/:id
router.delete('/:id', recordController.deleteRecord);

// GET /api/records/search-ai (Semantic Search)
router.get('/search-ai', recordController.searchAI);

// PUT /api/records/:id (For updates)
router.put('/:id', recordController.updateRecord);

module.exports = router;
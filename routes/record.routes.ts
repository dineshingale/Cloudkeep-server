import express from 'express';
import upload from '../middleware/multer';
import * as recordController from '../controllers/record.controller';

const router = express.Router();

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

export default router;

import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { analyzeResume } from '../controllers/resumeController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', protect, upload.single('resume'), analyzeResume);

export default router;

import express from 'express';
import { searchAlumni, sendRequest, uploadResume, updateProfile } from '../controllers/studentController.js';
import { protect, studentOnly } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Multer Config for Resume Uploads (Memory)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB Limit

router.get('/alumni', protect, searchAlumni);
router.post('/request-mentorship', protect, studentOnly, sendRequest);
router.post('/upload-resume', protect, studentOnly, upload.single('resume'), uploadResume);
router.put('/profile', protect, studentOnly, updateProfile);

export default router;

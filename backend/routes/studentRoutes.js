import express from 'express';
import { searchAlumni, sendRequest, uploadResume } from '../controllers/studentController.js';
import { protect, studentOnly } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer Config for Resume Uploads
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/resumes/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const upload = multer({ storage });

router.get('/alumni', protect, searchAlumni);
router.post('/request-mentorship', protect, studentOnly, sendRequest);
router.post('/upload-resume', protect, studentOnly, upload.single('resume'), uploadResume);

export default router;

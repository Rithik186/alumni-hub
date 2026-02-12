
import express from 'express';
import { searchAlumni, sendRequest, updateStudentProfile } from '../controllers/studentController.js';
import { protect, studentOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/alumni', protect, searchAlumni); // filters query: role, company, skills
router.post('/request-mentorship', protect, studentOnly, sendRequest);
router.put('/profile', protect, studentOnly, updateStudentProfile);

export default router;

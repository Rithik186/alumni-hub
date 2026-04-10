import express from 'express';
import { updateProfile, toggleMentorship, getRequests, getAlumniByCompany } from '../controllers/alumniController.js';
import { protect, alumniOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', protect, alumniOnly, updateProfile);
router.patch('/mentorship-status', protect, alumniOnly, toggleMentorship);
router.get('/requests', protect, alumniOnly, getRequests);
router.get('/company/:companyName', protect, getAlumniByCompany);

export default router;

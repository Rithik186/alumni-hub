
import express from 'express';
import { updateProfile, toggleMentorship, getRequests } from '../controllers/alumniController.js';
import { protect, alumniOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', protect, alumniOnly, updateProfile);
router.patch('/mentorship-status', protect, alumniOnly, toggleMentorship);
router.get('/requests', protect, alumniOnly, getRequests);

export default router;

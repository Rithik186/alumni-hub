
import express from 'express';
import { updateRequestStatus, getMentorshipDetails, getHistory } from '../controllers/mentorshipController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.patch('/:id/status', protect, updateRequestStatus); // Accept/Reject
router.get('/:id', protect, getMentorshipDetails);
router.get('/history', protect, getHistory); // User's mentorship history

export default router;

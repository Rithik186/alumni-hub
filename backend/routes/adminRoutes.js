
import express from 'express';
import { approveAlumni, createAnnouncement, getAnalytics } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.patch('/approve-alumni/:id', protect, adminOnly, approveAlumni);
router.post('/announcements', protect, adminOnly, createAnnouncement);
router.get('/analytics', protect, adminOnly, getAnalytics);

export default router;

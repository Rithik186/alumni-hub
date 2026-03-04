import express from 'express';
import {
    followUser,
    unfollowUser,
    updateFollowStatus,
    getConnectionStats,
    getFollowRequests,
    getSuggestions,
    getMyFollowingsStatuses
} from '../controllers/connectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Social Logic
router.post('/follow/:followingId', protect, followUser);
router.delete('/follow/:followingId', protect, unfollowUser);
router.put('/follow/status', protect, updateFollowStatus);
router.get('/requests', protect, getFollowRequests);
router.get('/stats', protect, getConnectionStats);
router.get('/suggestions', protect, getSuggestions);
router.get('/my-statuses', protect, getMyFollowingsStatuses);

export default router;

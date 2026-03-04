import express from 'express';
import {
    sendConnectionRequest,
    updateConnectionStatus,
    getPendingRequests,
    getMyConnections,
    followUser,
    unfollowUser,
    getConnectionStats,
    getSuggestions
} from '../controllers/connectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', protect, sendConnectionRequest);
router.put('/status', protect, updateConnectionStatus);
router.get('/pending', protect, getPendingRequests);
router.get('/my', protect, getMyConnections);

// New LinkedIn-style routes
router.post('/follow/:followingId', protect, followUser);
router.delete('/follow/:followingId', protect, unfollowUser);
router.get('/stats', protect, getConnectionStats);
router.get('/suggestions', protect, getSuggestions);

export default router;

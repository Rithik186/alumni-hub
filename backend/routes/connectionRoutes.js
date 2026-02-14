import express from 'express';
import {
    sendConnectionRequest,
    updateConnectionStatus,
    getPendingRequests,
    getMyConnections
} from '../controllers/connectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', protect, sendConnectionRequest);
router.put('/status', protect, updateConnectionStatus);
router.get('/pending', protect, getPendingRequests);
router.get('/my', protect, getMyConnections);

export default router;

import express from 'express';
import { 
    getPendingAlumni, 
    updateApprovalStatus, 
    getPlatformStats, 
    getAllUsers, 
    toggleUserStatus,
    deleteUser,
    updateUserByAdmin,
    createUserByAdmin
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/pending-alumni', protect, adminOnly, getPendingAlumni);
router.post('/update-approval', protect, adminOnly, updateApprovalStatus);
router.get('/stats', protect, adminOnly, getPlatformStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.post('/users', protect, adminOnly, createUserByAdmin);
router.patch('/users/:userId/toggle-status', protect, adminOnly, toggleUserStatus);
router.put('/users/:userId', protect, adminOnly, updateUserByAdmin);
router.delete('/users/:userId', protect, adminOnly, deleteUser);

export default router;

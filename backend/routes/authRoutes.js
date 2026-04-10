import express from 'express';
import { 
    registerUser, loginUser, verifyOtp, getMe, 
    forgotPassword, resetPassword, updateUser,
    getUserProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.get('/profile/:id', protect, getUserProfile);
router.put('/profile', protect, updateUser);

export default router;


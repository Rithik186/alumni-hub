import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfilePicture, uploadMedia } from '../controllers/uploadController.js';

const router = express.Router();

// --- Storage Configs --- //
const memoryStorage = multer.memoryStorage();

const uploadProfile = multer({ storage: memoryStorage });
const uploadPost = multer({ storage: memoryStorage });

// --- Routes --- //
router.post('/profile-picture', protect, (req, res, next) => {
    console.log('--- Profile Upload Request ---');
    next();
}, uploadProfile.single('profile_picture'), updateProfilePicture);

router.post('/media', protect, uploadPost.single('file'), uploadMedia);



export default router;

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfilePicture, uploadMedia } from '../controllers/uploadController.js';

const router = express.Router();

// Helper to ensure directory exists
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// --- Storage Configs --- //
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join('backend', 'uploads', 'profile-pictures');
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join('backend', 'uploads', 'posts');
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `post-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadProfile = multer({ storage: profileStorage });
const uploadPost = multer({ storage: mediaStorage });

// --- Routes --- //
router.post('/profile-picture', protect, uploadProfile.single('profile_picture'), updateProfilePicture);
router.post('/media', protect, uploadPost.single('file'), uploadMedia);

export default router;

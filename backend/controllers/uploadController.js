import { streamUpload, deleteMediaFromCloudinary } from '../utils/cloudinaryHelper.js';
import db from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

export const updateProfilePicture = async (req, res) => {
    try {
        console.log('--- Profile Picture Update Start ---');
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // 1. Get current profile picture to delete it later
        const userRes = await db.query('SELECT profile_picture FROM users WHERE id = $1', [req.user.id]);
        const oldPicUrl = userRes.rows[0]?.profile_picture;

        // 2. Upload new one to Cloudinary
        const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(fileBase64, {
            folder: 'alumni_platform/profiles',
            resource_type: 'image'
        });
        
        const profile_picture_url = result.secure_url;

        // 3. Update DB
        await db.query(
            'UPDATE users SET profile_picture = $1 WHERE id = $2',
            [profile_picture_url, req.user.id]
        );

        // 4. Cleanup OLD picture from Cloudinary (Async)
        if (oldPicUrl && oldPicUrl.includes('cloudinary')) {
            deleteMediaFromCloudinary(oldPicUrl).catch(err => console.error('Delayed Cleanup Error:', err));
        }

        res.json({
            message: 'Profile picture updated successfully',
            profile_picture: profile_picture_url
        });

    } catch (err) {
        console.error('CRITICAL: Profile Picture Upload Error:', err);
        res.status(500).json({ 
            message: 'Server error during upload', 
            error: err.message
        });
    }
};

export const uploadMedia = async (req, res) => {
    try {
        console.log('--- CHAT MEDIA UPLOAD ATTEMPT ---');
        
        if (!req.file) {
            console.error('ERROR: No file found in req.file. Check multipart/form-data config.');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`File received: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);

        // Convert buffer to Base64
        const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        console.log('Calling Cloudinary API...');
        const result = await cloudinary.uploader.upload(fileBase64, {
            folder: 'alumni_platform/chat', // Use a dedicated chat folder
            resource_type: 'auto'
        });
        
        console.log('SUCCESS: Cloudinary URL generated:', result.secure_url);
        
        res.json({
            url: result.secure_url,
            type: result.resource_type
        });
    } catch (err) {
        console.error('CHAT MEDIA UPLOAD ERROR:', err);
        res.status(500).json({ 
            message: 'Upload failed', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
        });
    }
};





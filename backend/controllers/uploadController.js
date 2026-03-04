import db from '../config/db.js';

export const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const profile_picture_url = `/uploads/profile-pictures/${req.file.filename}`;

        await db.query(
            'UPDATE users SET profile_picture = $1 WHERE id = $2',
            [profile_picture_url, req.user.id]
        );

        res.json({
            message: 'Profile picture updated successfully',
            profile_picture: profile_picture_url
        });
    } catch (err) {
        console.error('Profile Picture Upload Error:', err);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

export const uploadMedia = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine if image or video based on mimetype or extension
    const isVideo = req.file.mimetype.startsWith('video/');

    const mediaUrl = `/uploads/posts/${req.file.filename}`;

    res.json({
        url: mediaUrl,
        type: isVideo ? 'video' : 'image'
    });
};

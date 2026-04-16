import db from '../backend/config/db.js';

const cleanDatabase = async () => {
    console.log('Starting Database Cleanup...');

    try {
        // 1. Clear profile pictures that are base64
        const userRes = await db.query(
            "UPDATE users SET profile_picture = NULL WHERE profile_picture LIKE 'data:%'"
        );
        console.log(`Cleaned ${userRes.rowCount} profile pictures from users table.`);

        // 2. Clear post media that are base64
        const postImgRes = await db.query(
            "UPDATE posts SET image_url = NULL WHERE image_url LIKE 'data:%'"
        );
        const postVidRes = await db.query(
            "UPDATE posts SET video_url = NULL WHERE video_url LIKE 'data:%'"
        );
        console.log(`Cleaned ${postImgRes.rowCount} images and ${postVidRes.rowCount} videos from posts table.`);

        // 3. Clear resumes that are base64
        const resumeRes = await db.query(
            "UPDATE student_profiles SET resume_url = NULL WHERE resume_url LIKE 'data:%'"
        );
        console.log(`Cleaned ${resumeRes.rowCount} resumes from student_profiles table.`);

        // 4. Clear message media that are base64
        const msgImgRes = await db.query(
            "UPDATE messages SET image_url = NULL WHERE image_url LIKE 'data:%'"
        );
        const msgVidRes = await db.query(
            "UPDATE messages SET video_url = NULL WHERE video_url LIKE 'data:%'"
        );
        console.log(`Cleaned ${msgImgRes.rowCount} images and ${msgVidRes.rowCount} videos from messages table.`);

        console.log('Database Cleanup Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('CRITICAL: Cleanup failed:', err);
        process.exit(1);
    }
};

cleanDatabase();

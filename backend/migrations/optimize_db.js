import db from '../config/db.js';

const runOptimization = async () => {
    try {
        console.log('--- Starting Database Optimization ---');

        // 1. Core Tables Indexes
        console.log('Adding indexes to users table...');
        await db.query(`CREATE INDEX IF NOT EXISTS idx_users_college ON users(college);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_users_approved_active ON users(is_approved, is_active);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified);`);


        console.log('Adding indexes to posts table...');
        await db.query(`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);`);

        console.log('Adding indexes to post_likes table...');
        await db.query(`CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);`);

        console.log('Adding indexes to post_comments table...');
        await db.query(`CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);`);

        console.log('Adding indexes to follows table...');
        await db.query(`CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_follows_status ON follows(status);`);

        console.log('Adding indexes to notifications table...');
        await db.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);`);

        console.log('Adding indexes to messages table...');
        await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);`);

        console.log('Adding indexes to mentorship_requests table...');
        await db.query(`CREATE INDEX IF NOT EXISTS idx_mentorship_status ON mentorship_requests(status);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_mentorship_student_id ON mentorship_requests(student_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_mentorship_alumni_id ON mentorship_requests(alumni_id);`);


        console.log('--- Database Optimization Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('--- Database Optimization Failed ---');
        console.error(err);
        process.exit(1);
    }
};

runOptimization();

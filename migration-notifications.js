import db from './backend/config/db.js';

async function migrate() {
    try {
        console.log('--- ENHANCED ALUMNI ECOSYSTEM MIGRATION ---');

        // 1. Add video_url to posts
        console.log('Adding video_url to posts...');
        await db.query(`
            ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url VARCHAR(255);
        `);

        // 2. Notifications table
        console.log('Creating notifications table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'follow_request'
                sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                content TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('--- MIGRATION COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
}

migrate();

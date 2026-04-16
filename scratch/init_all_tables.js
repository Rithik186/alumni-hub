import db from '../backend/config/db.js';
import fs from 'fs';
import path from 'path';

const initDb = async () => {
    try {
        console.log("Starting full database initialization...");

        // 1. Run schema.sql
        const schemaPath = path.resolve('backend/models/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log("Executing schema.sql...");
        await db.query(schemaSql);

        // 2. Add posts tables
        console.log("Creating social tables (posts, likes, comments, follows, notifications, etc.)...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                content TEXT,
                image_url TEXT,
                video_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS post_likes (
                id SERIAL PRIMARY KEY,
                post_id INT REFERENCES posts(id) ON DELETE CASCADE,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                is_dislike BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS post_comments (
                id SERIAL PRIMARY KEY,
                post_id INT REFERENCES posts(id) ON DELETE CASCADE,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                content TEXT,
                parent_id INT,
                is_pinned BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS comment_likes (
                id SERIAL PRIMARY KEY,
                comment_id INT REFERENCES post_comments(id) ON DELETE CASCADE,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS follows (
                id SERIAL PRIMARY KEY,
                follower_id INT REFERENCES users(id) ON DELETE CASCADE,
                following_id INT REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(20) DEFAULT 'accepted',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50),
                sender_id INT REFERENCES users(id) ON DELETE CASCADE,
                post_id INT REFERENCES posts(id) ON DELETE CASCADE,
                content TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INT REFERENCES users(id) ON DELETE CASCADE,
                receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
                content TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_settings (
                user_id INT REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
                notifications_email BOOLEAN DEFAULT TRUE,
                notifications_push BOOLEAN DEFAULT TRUE,
                notifications_posts BOOLEAN DEFAULT TRUE,
                notifications_connections BOOLEAN DEFAULT TRUE,
                notifications_messages BOOLEAN DEFAULT TRUE,
                notifications_digest BOOLEAN DEFAULT TRUE,
                privacy_visibility VARCHAR(20) DEFAULT 'public',
                privacy_messages VARCHAR(20) DEFAULT 'everyone',
                privacy_activity BOOLEAN DEFAULT TRUE,
                privacy_search_index BOOLEAN DEFAULT TRUE,
                appearance_theme VARCHAR(20) DEFAULT 'light',
                appearance_font_size VARCHAR(20) DEFAULT 'medium',
                appearance_compact BOOLEAN DEFAULT FALSE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Social tables created.");

        console.log("Database initialized successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error initializing database:", err);
        process.exit(1);
    }
};

initDb();

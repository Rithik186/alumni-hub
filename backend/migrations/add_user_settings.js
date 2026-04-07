import db from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const runMigration = async () => {
    try {
        console.log('Creating user_settings table...');
        await db.query(`
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
        console.log('user_settings table created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();

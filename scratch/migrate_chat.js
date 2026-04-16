import db from '../backend/config/db.js';

const migrate = async () => {
    try {
        console.log('Adding audio_url column...');
        await db.query('ALTER TABLE messages ADD COLUMN IF NOT EXISTS audio_url TEXT');
        
        console.log('Adding status column...');
        await db.query("ALTER TABLE messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'sent'");
        
        console.log('Chat migration complete!');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
};

migrate();

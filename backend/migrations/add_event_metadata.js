import db from '../config/db.js';

const migrate = async () => {
    try {
        console.log('Adding metadata column to events table...');
        await db.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
        `);
        console.log('Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();

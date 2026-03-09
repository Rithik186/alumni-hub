import db from './backend/config/db.js';

async function migrate() {
    try {
        console.log('--- REFINING FOLLOW LOGIC ---');

        // 1. Add status to follows table
        console.log('Updating follows table...');
        // Drop unique constraint/Primary Key to allow status updates if needed, 
        // or just use the existing composite but add a status column.
        await db.query(`
            ALTER TABLE follows ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
        `);

        console.log('--- MIGRATION COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
}

migrate();

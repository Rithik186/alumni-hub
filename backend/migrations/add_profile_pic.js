import db from '../config/db.js';

const runMigration = async () => {
    try {
        console.log('Running migration...');
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;`);
        console.log('Successfully added profile_picture column to users table.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();

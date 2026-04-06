import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('Running migration to add message attachment columns...');
    await pool.query(`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS video_url TEXT;
    `);
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();

import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function createIndexes() {
    try {
        console.log('--- Creating Indexes for "Lightning Speed" ---');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_college ON users (college)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes (post_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments (post_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_follows_follower_accepted ON follows (follower_id) WHERE status = \'accepted\'');
        console.log('--- Success: All Performance Indices Created ---');
        await pool.end();
    } catch (err) {
        console.error('Migration Error:', err);
        await pool.end();
    }
}
createIndexes();

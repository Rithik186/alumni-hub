import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        console.log('--- Checking Indexes ---');
        const indexes = await pool.query(`
            SELECT tablename, indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename IN ('users', 'posts', 'post_likes', 'post_comments', 'follows')
        `);
        console.table(indexes.rows);

        console.log('--- Analyzing Feed Query Performance ---');
        const userId = 17; // Use an existing user ID 
        const userCollege = 'Engineering'; // Default mockup data
        const limit = 10;
        const offset = 0;

        const query = `
            EXPLAIN ANALYZE
            WITH base_posts AS (
                SELECT p.id, p.user_id, p.content, p.image_url, p.video_url, p.created_at,
                       u.name as author_name, u.role as author_role, u.college as author_college, u.profile_picture as author_profile_picture
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.user_id = $1 
                OR u.college = $4
                OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1 AND status = 'accepted')
                ORDER BY p.created_at DESC
                LIMIT $2 OFFSET $3
            )
            SELECT 
                bp.*,
                COALESCE(l.likes_count, 0) as likes_count,
                COALESCE(d.dislikes_count, 0) as dislikes_count,
                COALESCE(c.comments_count, 0) as comments_count,
                EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = bp.id AND pl.user_id = $1 AND pl.is_dislike = FALSE) as has_liked,
                (SELECT COALESCE(json_agg(json_build_object('name', lu.name)), '[]'::json) 
                 FROM post_likes pl 
                 JOIN users lu ON pl.user_id = lu.id 
                 WHERE pl.post_id = bp.id AND pl.is_dislike = FALSE) as liked_by_users
            FROM base_posts bp
            LEFT JOIN (SELECT post_id, COUNT(*) as likes_count FROM post_likes WHERE is_dislike = FALSE GROUP BY post_id) l ON bp.id = l.post_id
            LEFT JOIN (SELECT post_id, COUNT(*) as dislikes_count FROM post_likes WHERE is_dislike = TRUE GROUP BY post_id) d ON bp.id = d.post_id
            LEFT JOIN (SELECT post_id, COUNT(*) as comments_count FROM post_comments GROUP BY post_id) c ON bp.id = c.post_id
            ORDER BY bp.created_at DESC
        `;

        const explain = await pool.query(query, [userId, limit, offset, userCollege]);
        console.log(explain.rows.map(r => r['QUERY PLAN']).join('\n'));

        await pool.end();
    } catch (err) {
        console.error('Performance Analysis Error:', err);
        await pool.end();
    }
}
run();

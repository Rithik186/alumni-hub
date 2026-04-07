import dotenv from 'dotenv';
dotenv.config();

import db from '../config/db.js';

async function testTimer() {
    console.log('Testing server-side execution time...');
    const start = Date.now();
    try {
        const userId = 17;
        const limit = 10;
        const offset = 0;
        const userCollege = 'Engineering';

        const res = await db.query(`
            SELECT 
                p.id, p.user_id, p.content, p.image_url, p.video_url, p.created_at,
                u.name as author_name, u.role as author_role, u.college as author_college, u.profile_picture as author_profile_picture,
                COALESCE(lc.likes_count, 0) as likes_count,
                COALESCE(dc.dislikes_count, 0) as dislikes_count,
                COALESCE(cc.comments_count, 0) as comments_count,
                EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1 AND pl.is_dislike = FALSE) as has_liked,
                (SELECT COALESCE(json_agg(json_build_object('name', lu.name)), '[]'::json) 
                 FROM post_likes pl 
                 JOIN users lu ON pl.user_id = lu.id 
                 WHERE pl.post_id = p.id AND pl.is_dislike = FALSE) as liked_by_users
            FROM posts p
            JOIN users u ON p.user_id = u.id
            CROSS JOIN LATERAL (SELECT count(*) as likes_count FROM post_likes WHERE post_id = p.id AND is_dislike = FALSE) lc
            CROSS JOIN LATERAL (SELECT count(*) as dislikes_count FROM post_likes WHERE post_id = p.id AND is_dislike = TRUE) dc
            CROSS JOIN LATERAL (SELECT count(*) as comments_count FROM post_comments WHERE post_id = p.id) cc
            WHERE p.user_id = $1 
               OR u.college = $4
               OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1 AND status = 'accepted')
            ORDER BY p.created_at DESC
            LIMIT 10 OFFSET 0
        `, [userId, userCollege]);

        const end = Date.now();
        console.log(`Execution time: ${end - start}ms`);
        console.log(`Rows returned: ${res.rows.length}`);
        
        const json = JSON.stringify(res.rows);
        console.log(`JSON Size: ${(json.length / 1024 / 1024).toFixed(2)} MB`);
        
        process.exit(0);
    } catch (err) {
        console.error('Speed Test Error:', err);
        process.exit(1);
    }
}
testTimer();

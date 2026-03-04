import db from '../config/db.js';

export const createPost = async (req, res) => {
    const { content, image_url } = req.body;
    const userId = req.user.id;
    try {
        const post = await db.query(
            'INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3) RETURNING *',
            [userId, content, image_url]
        );
        res.status(201).json(post.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getFeed = async (req, res) => {
    const userId = req.user.id;
    try {
        // LinkedIn style feed: show posts from connections/followed users OR same college
        const feed = await db.query(`
            SELECT p.*, u.name as author_name, u.role as author_role, u.college as author_college,
            (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.is_dislike = FALSE) as likes_count,
            (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.is_dislike = TRUE) as dislikes_count,
            (SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.id) as comments_count,
            EXISTS(SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = $1 AND l.is_dislike = FALSE) as has_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = $1 
            OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
            OR p.user_id IN (SELECT receiver_id FROM connections WHERE requester_id = $1 AND status = 'accepted')
            OR p.user_id IN (SELECT requester_id FROM connections WHERE receiver_id = $1 AND status = 'accepted')
            OR u.college = (SELECT college FROM users WHERE id = $1)
            ORDER BY p.created_at DESC
        `, [userId]);
        res.json(feed.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const toggleLike = async (req, res) => {
    const { postId } = req.params;
    const { isDislike } = req.body;
    const userId = req.user.id;
    try {
        const existing = await db.query('SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        if (existing.rows.length > 0) {
            if (existing.rows[0].is_dislike === isDislike) {
                await db.query('DELETE FROM post_likes WHERE id = $1', [existing.rows[0].id]);
            } else {
                await db.query('UPDATE post_likes SET is_dislike = $1 WHERE id = $2', [isDislike, existing.rows[0].id]);
            }
        } else {
            await db.query('INSERT INTO post_likes (post_id, user_id, is_dislike) VALUES ($1, $2, $3)', [postId, userId, isDislike]);
        }
        res.json({ message: 'Success' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const addComment = async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    try {
        const comment = await db.query(
            'INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [postId, userId, content]
        );
        res.status(201).json(comment.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getComments = async (req, res) => {
    const { postId } = req.params;
    try {
        const comments = await db.query(`
            SELECT c.*, u.name as user_name 
            FROM post_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `, [postId]);
        res.json(comments.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

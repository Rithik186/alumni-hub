import db from '../config/db.js';

export const editPost = async (req, res) => {
    const { id } = req.params;
    const { content, image_url, video_url } = req.body;
    const userId = req.user.id;
    try {
        const post = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
        if (post.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
        if (post.rows[0].user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        const updated = await db.query(
            'UPDATE posts SET content = $1, image_url = $2, video_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [content, image_url, video_url, id]
        );
        res.json(updated.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createPost = async (req, res) => {
    const { content, image_url, video_url } = req.body;
    const userId = req.user.id;
    try {
        const post = await db.query(
            'INSERT INTO posts (user_id, content, image_url, video_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, content, image_url, video_url]
        );
        res.status(201).json(post.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getFeed = async (req, res) => {
    const userId = req.user.id;
    try {
        const feed = await db.query(`
            SELECT p.*, u.name as author_name, u.role as author_role, u.college as author_college, u.profile_picture as author_profile_picture,
            (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.is_dislike = FALSE) as likes_count,
            (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.is_dislike = TRUE) as dislikes_count,
            (SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.id) as comments_count,
            EXISTS(SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = $1 AND l.is_dislike = FALSE) as has_liked,
            (SELECT COALESCE(json_agg(json_build_object('name', lu.name)), '[]'::json) FROM post_likes pl JOIN users lu ON pl.user_id = lu.id WHERE pl.post_id = p.id AND pl.is_dislike = FALSE) as liked_by_users
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = $1 
            OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1 AND status = 'accepted')
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

        let action = '';
        if (existing.rows.length > 0) {
            if (existing.rows[0].is_dislike === isDislike) {
                await db.query('DELETE FROM post_likes WHERE id = $1', [existing.rows[0].id]);
                action = 'removed';
            } else {
                await db.query('UPDATE post_likes SET is_dislike = $1 WHERE id = $2', [isDislike, existing.rows[0].id]);
                action = 'updated';
            }
        } else {
            await db.query('INSERT INTO post_likes (post_id, user_id, is_dislike) VALUES ($1, $2, $3)', [postId, userId, isDislike]);
            action = 'added';
        }

        // Trigger Notification on Like (not dislike)
        if (action === 'added' && !isDislike) {
            const postOwner = await db.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
            if (postOwner.rows[0].user_id !== userId) {
                await db.query(
                    'INSERT INTO notifications (user_id, type, sender_id, post_id, content) VALUES ($1, $2, $3, $4, $5)',
                    [postOwner.rows[0].user_id, 'like', userId, postId, 'liked your post']
                );
            }
        }

        res.json({ message: 'Success', action });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const addComment = async (req, res) => {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;
    try {
        const comment = await db.query(
            'INSERT INTO post_comments (post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [postId, userId, content, parentId || null]
        );

        // Trigger Notification
        const postOwner = await db.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
        if (postOwner.rows[0].user_id !== userId) {
            await db.query(
                'INSERT INTO notifications (user_id, type, sender_id, post_id, content) VALUES ($1, $2, $3, $4, $5)',
                [postOwner.rows[0].user_id, 'comment', userId, postId, `commented: "${content.substring(0, 30)}..."`]
            );
        }

        res.status(201).json(comment.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getComments = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    try {
        const comments = await db.query(`
            SELECT c.*, u.name as user_name, u.profile_picture as user_profile_picture, u.role as user_role,
                   (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count,
                   EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = $2) as has_liked
            FROM post_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.is_pinned DESC, c.created_at ASC
        `, [postId, userId]);
        res.json(comments.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const toggleCommentLike = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    try {
        const existing = await db.query('SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2', [commentId, userId]);
        if (existing.rows.length > 0) {
            await db.query('DELETE FROM comment_likes WHERE id = $1', [existing.rows[0].id]);
        } else {
            await db.query('INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)', [commentId, userId]);
        }
        res.json({ message: 'Success' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const pinComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    try {
        const commentRes = await db.query('SELECT post_id, is_pinned FROM post_comments WHERE id = $1', [commentId]);
        if (commentRes.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });

        const postId = commentRes.rows[0].post_id;
        const postRes = await db.query('SELECT user_id FROM posts WHERE id = $1', [postId]);

        if (postRes.rows[0].user_id !== userId) return res.status(403).json({ message: 'Only post owner can pin' });

        const isPinned = commentRes.rows[0].is_pinned;
        // Unpin all other comments for this post if we are pinning
        if (!isPinned) {
            await db.query('UPDATE post_comments SET is_pinned = false WHERE post_id = $1', [postId]);
        }
        await db.query('UPDATE post_comments SET is_pinned = $1 WHERE id = $2', [!isPinned, commentId]);

        res.json({ message: 'Success' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deletePost = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const post = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
        if (post.rows.length === 0) {
            return res.json({ message: 'Post not found' });
        }
        // Check ownership
        if (post.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await db.query('DELETE FROM posts WHERE id = $1', [id]);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

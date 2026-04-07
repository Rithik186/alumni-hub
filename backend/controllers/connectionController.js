import db from '../config/db.js';

// Social Functions (Follow Request/Accept)
export const followUser = async (req, res) => {
    const followerId = req.user.id;
    const { followingId } = req.params;
    try {
        // Check if already following/requested
        const existing = await db.query(
            'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Request already exists' });
        }

        await db.query(
            'INSERT INTO follows (follower_id, following_id, status) VALUES ($1, $2, $3)',
            [followerId, followingId, 'pending']
        );

        // Trigger Notification
        await db.query(
            'INSERT INTO notifications (user_id, type, sender_id, content) VALUES ($1, $2, $3, $4)',
            [followingId, 'follow_request', followerId, 'sent you a follow request']
        );

        res.json({ message: 'Follow request sent' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateFollowStatus = async (req, res) => {
    const followingId = req.user.id; // The one being followed (alumni)
    const { followerId, status } = req.body;
    try {
        if (status === 'accepted') {
            await db.query(
                'UPDATE follows SET status = $1 WHERE follower_id = $2 AND following_id = $3',
                [status, followerId, followingId]
            );
        } else if (status === 'rejected') {
            await db.query(
                'DELETE FROM follows WHERE follower_id = $2 AND following_id = $3',
                [followerId, followingId]
            );
        }
        res.json({ message: `Follow request ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const unfollowUser = async (req, res) => {
    const followerId = req.user.id;
    const { followingId } = req.params;
    try {
        await db.query(
            'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );
        res.json({ message: 'Unfollowed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getConnectionStats = async (req, res) => {
    const userId = req.user.id;
    try {
        // Only count accepted follows
        const followers = await db.query('SELECT COUNT(*) FROM follows WHERE following_id = $1 AND status = \'accepted\'', [userId]);
        const following = await db.query('SELECT COUNT(*) FROM follows WHERE follower_id = $1 AND status = \'accepted\'', [userId]);

        res.json({
            followers: parseInt(followers.rows[0].count),
            following: parseInt(following.rows[0].count)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getFollowers = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
            SELECT u.id, u.name, u.college, u.role, u.profile_picture as avatar, 
                   COALESCE(ap.job_role, sp.department, 'Member') as status_role
            FROM follows f
            JOIN users u ON f.follower_id = u.id
            LEFT JOIN alumni_profiles ap ON u.id = ap.user_id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE f.following_id = $1 AND f.status = 'accepted'
        `;
        const result = await db.query(query, [userId]);
        const followers = result.rows.map(r => ({
            id: r.id, name: r.name, role: r.status_role + ' @ ' + r.college, avatar: r.avatar
        }));
        res.json(followers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getFollowing = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
            SELECT u.id, u.name, u.college, u.role, u.profile_picture as avatar, 
                   COALESCE(ap.job_role, sp.department, 'Member') as status_role
            FROM follows f
            JOIN users u ON f.following_id = u.id
            LEFT JOIN alumni_profiles ap ON u.id = ap.user_id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE f.follower_id = $1 AND f.status = 'accepted'
        `;
        const result = await db.query(query, [userId]);
        const following = result.rows.map(r => ({
            id: r.id, name: r.name, role: r.status_role + ' @ ' + r.college, avatar: r.avatar
        }));
        res.json(following);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getFollowRequests = async (req, res) => {
    const userId = req.user.id;
    try {
        const requests = await db.query(`
            SELECT f.*, u.name as follower_name, u.college as follower_college, u.role as follower_role
            FROM follows f
            JOIN users u ON f.follower_id = u.id
            WHERE f.following_id = $1 AND f.status = 'pending'
        `, [userId]);
        res.json(requests.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getSuggestions = async (req, res) => {
    const userId = req.user.id;
    try {
        const userRes = await db.query('SELECT college, role FROM users WHERE id = $1', [userId]);
        const { college, role } = userRes.rows[0];

        let query;
        if (role === 'student') {
            query = `
                SELECT u.id, u.name, u.college, ap.company, ap.job_role, ap.batch, u.profile_picture as avatar,
                       f.status as follow_status
                FROM users u
                INNER JOIN alumni_profiles ap ON u.id = ap.user_id
                LEFT JOIN follows f ON f.follower_id = $2 AND f.following_id = u.id
                WHERE u.college = $1 AND u.id != $2
                AND f.status IS NULL
                LIMIT 6
            `;
        } else {
            query = `
                SELECT u.id, u.name, u.college, sp.department, sp.batch, u.profile_picture as avatar,
                       f.status as follow_status
                FROM users u
                INNER JOIN student_profiles sp ON u.id = sp.user_id
                LEFT JOIN follows f ON f.follower_id = $2 AND f.following_id = u.id
                WHERE u.college = $1 AND u.id != $2
                AND f.status IS NULL
                LIMIT 6
            `;
        }
        
        const suggestions = await db.query(query, [college, userId]);
        res.json(suggestions.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Internal mapping for search results to show requested status
export const getMyFollowingsStatuses = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query('SELECT following_id, status FROM follows WHERE follower_id = $1', [userId]);
        const mapping = {};
        result.rows.forEach(r => mapping[r.following_id] = r.status);
        res.json(mapping);
    } catch (err) {
        console.error('CRITICAL: My Followings Status Error:', err);
        res.status(500).json({ 
            message: 'Error fetching following statuses',
            error: err.message
        });
    }
};

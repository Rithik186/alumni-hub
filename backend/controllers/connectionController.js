import db from '../config/db.js';

// Social Functions (Follow/Unfollow)
export const followUser = async (req, res) => {
    const followerId = req.user.id;
    const { followingId } = req.params;
    try {
        await db.query(
            'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [followerId, followingId]
        );
        res.json({ message: 'Followed successfully' });
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
        const followers = await db.query('SELECT COUNT(*) FROM follows WHERE following_id = $1', [userId]);
        const following = await db.query('SELECT COUNT(*) FROM follows WHERE follower_id = $1', [userId]);
        const connections = await db.query(`
            SELECT COUNT(*) FROM connections 
            WHERE (requester_id = $1 OR receiver_id = $1) AND status = 'accepted'
        `, [userId]);

        res.json({
            followers: parseInt(followers.rows[0].count),
            following: parseInt(following.rows[0].count),
            connections: parseInt(connections.rows[0].count)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getSuggestions = async (req, res) => {
    const userId = req.user.id;
    try {
        const userRes = await db.query('SELECT college, role FROM users WHERE id = $1', [userId]);
        const { college, role } = userRes.rows[0];

        let suggestions;
        if (role === 'student') {
            suggestions = await db.query(`
                SELECT u.id, u.name, u.college, ap.company, ap.job_role, ap.batch
                FROM users u
                JOIN alumni_profiles ap ON u.id = ap.user_id
                WHERE u.college = $1 AND u.id != $2
                AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = $2)
                AND u.id NOT IN (SELECT receiver_id FROM connections WHERE requester_id = $2)
                AND u.id NOT IN (SELECT requester_id FROM connections WHERE receiver_id = $2)
                LIMIT 10
            `, [college, userId]);
        } else {
            suggestions = await db.query(`
                SELECT u.id, u.name, u.college, sp.department, sp.batch
                FROM users u
                JOIN student_profiles sp ON u.id = sp.user_id
                WHERE u.college = $1 AND u.id != $2
                AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = $2)
                LIMIT 10
            `, [college, userId]);
        }
        res.json(suggestions.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Original Connection Functions
export const sendConnectionRequest = async (req, res) => {
    const requesterId = req.user.id;
    const { receiverId } = req.body;
    try {
        const request = await db.query(
            'INSERT INTO connections (requester_id, receiver_id, status) VALUES ($1, $2, $3) RETURNING *',
            [requesterId, receiverId, 'pending']
        );
        res.status(201).json(request.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateConnectionStatus = async (req, res) => {
    const { connectionId, status } = req.body;
    try {
        const result = await db.query(
            'UPDATE connections SET status = $1 WHERE id = $2 RETURNING *',
            [status, connectionId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getPendingRequests = async (req, res) => {
    const userId = req.user.id;
    try {
        const requests = await db.query(`
            SELECT c.*, u.name as requester_name, u.college as requester_college
            FROM connections c
            JOIN users u ON c.requester_id = u.id
            WHERE c.receiver_id = $1 AND c.status = 'pending'
        `, [userId]);
        res.json(requests.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMyConnections = async (req, res) => {
    const userId = req.user.id;
    try {
        const connections = await db.query(`
            SELECT u.id, u.name, u.role, u.college
            FROM connections c
            JOIN users u ON (u.id = CASE WHEN c.requester_id = $1 THEN c.receiver_id ELSE c.requester_id END)
            WHERE (c.requester_id = $1 OR c.receiver_id = $1) AND c.status = 'accepted'
        `, [userId]);
        res.json(connections.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

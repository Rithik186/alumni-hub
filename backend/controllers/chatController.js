import db from '../config/db.js';

export const getContacts = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
            SELECT distinct u.id, u.name, u.role, u.profile_picture as avatar, 
                   COALESCE(ap.job_role, sp.department, 'Member') as status_role
            FROM users u
            LEFT JOIN follows f ON (f.follower_id = u.id AND f.following_id = $1) 
                                OR (f.following_id = u.id AND f.follower_id = $1)
            LEFT JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = $1) 
                                 OR (m.receiver_id = u.id AND m.sender_id = $1)
            LEFT JOIN alumni_profiles ap ON u.id = ap.user_id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.id != $1 AND (f.status = 'accepted' OR m.id IS NOT NULL)
        `;
        const result = await db.query(query, [userId]);
        // Map data to match expected shape
        const contacts = result.rows.map(r => ({
            id: r.id,
            name: r.name,
            role: r.status_role,
            status: 'online', // Mock online status for now
            avatar: r.avatar
        }));
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMessages = async (req, res) => {
    const userId = req.user.id;
    const { contactId } = req.params;
    try {
        const query = `
            SELECT id, sender_id as "senderId", receiver_id as "receiverId", content as text, created_at as timestamp, image_url, video_url
            FROM messages
            WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
        `;
        const result = await db.query(query, [userId, contactId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const sendMessage = async (req, res) => {
    const senderId = req.user.id;
    const { receiverId, text, image_url, video_url } = req.body;
    try {
        const query = `
            INSERT INTO messages (sender_id, receiver_id, content, image_url, video_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, sender_id as "senderId", receiver_id as "receiverId", content as text, created_at as timestamp, image_url, video_url
        `;
        const result = await db.query(query, [senderId, receiverId, text, image_url || null, video_url || null]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const editMessage = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { text } = req.body;
    try {
        const checkQuery = `SELECT sender_id FROM messages WHERE id = $1`;
        const checkRes = await db.query(checkQuery, [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Message not found' });
        if (checkRes.rows[0].sender_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        const updateQuery = `
            UPDATE messages 
            SET content = $1
            WHERE id = $2 
            RETURNING id, sender_id as "senderId", receiver_id as "receiverId", content as text, created_at as timestamp, image_url, video_url
        `;
        const result = await db.query(updateQuery, [text, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteMessage = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const checkQuery = `SELECT sender_id FROM messages WHERE id = $1`;
        const checkRes = await db.query(checkQuery, [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Message not found' });
        if (checkRes.rows[0].sender_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        await db.query(`DELETE FROM messages WHERE id = $1`, [id]);
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

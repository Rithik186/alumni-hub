import db from '../config/db.js';

export const getNotifications = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const result = await db.query(`
            SELECT n.*, u.name as sender_name, u.role as sender_role, u.profile_picture as sender_profile_picture
            FROM notifications n
            JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = $1
            ORDER BY n.created_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);
        res.json(result.rows);
    } catch (err) {
        console.error('Notifications fetch error:', err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

export const getUnreadCount = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE', [userId]);
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
        res.json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const markAllAsRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

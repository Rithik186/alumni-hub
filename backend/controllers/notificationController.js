import db from '../config/db.js';

export const getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(`
            SELECT n.*, u.name as sender_name, u.role as sender_role
            FROM notifications n
            JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = $1
            ORDER BY n.created_at DESC
            LIMIT 50
        `, [userId]);
        res.json(result.rows);
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

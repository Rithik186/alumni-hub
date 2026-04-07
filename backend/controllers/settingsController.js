
import db from '../config/db.js';

// GET /api/settings - Get user settings
export const getSettings = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM user_settings WHERE user_id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            // Create default settings row for this user
            const newRow = await db.query(
                'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
                [req.user.id]
            );
            return res.json(newRow.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Settings Error:', error);
        res.status(500).json({ 
            message: 'Failed to load settings', 
            error: error.message,
            userId: req.user?.id
        });
    }
};

// PUT /api/settings - Update user settings
export const updateSettings = async (req, res) => {
    const {
        notifications_email, notifications_push, notifications_posts,
        notifications_connections, notifications_messages, notifications_digest,
        privacy_visibility, privacy_messages, privacy_activity, privacy_search_index,
        appearance_theme, appearance_font_size, appearance_compact
    } = req.body;

    try {
        // UPSERT: insert if not exists, update if exists
        const result = await db.query(`
            INSERT INTO user_settings (
                user_id,
                notifications_email, notifications_push, notifications_posts,
                notifications_connections, notifications_messages, notifications_digest,
                privacy_visibility, privacy_messages, privacy_activity, privacy_search_index,
                appearance_theme, appearance_font_size, appearance_compact,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE SET
                notifications_email = $2, notifications_push = $3, notifications_posts = $4,
                notifications_connections = $5, notifications_messages = $6, notifications_digest = $7,
                privacy_visibility = $8, privacy_messages = $9, privacy_activity = $10, privacy_search_index = $11,
                appearance_theme = $12, appearance_font_size = $13, appearance_compact = $14,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [
            req.user.id,
            notifications_email, notifications_push, notifications_posts,
            notifications_connections, notifications_messages, notifications_digest,
            privacy_visibility, privacy_messages, privacy_activity, privacy_search_index,
            appearance_theme, appearance_font_size, appearance_compact
        ]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ message: 'Failed to save settings', error: error.message });
    }
};

// DELETE /api/settings/account - Delete user account
export const deleteAccount = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ message: 'Failed to delete account', error: error.message });
    }
};

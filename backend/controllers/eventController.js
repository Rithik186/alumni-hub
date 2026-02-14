import db from '../config/db.js';

// Get all upcoming events
export const getEvents = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM events WHERE date >= CURRENT_TIMESTAMP ORDER BY date ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get Events Error:', error);
        res.status(500).json({ message: 'Server error fetching events' });
    }
};

// Create a new event (Admin only)
export const createEvent = async (req, res) => {
    const { title, description, date, type } = req.body;
    const created_by = req.user.id;

    try {
        const result = await db.query(
            'INSERT INTO events (title, description, date, type, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, date, type, created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Server error creating event' });
    }
};

// Delete an event (Admin only)
export const deleteEvent = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM events WHERE id = $1', [id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete Event Error:', error);
        res.status(500).json({ message: 'Server error deleting event' });
    }
};

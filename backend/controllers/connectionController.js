import db from '../config/db.js';

// Send a connection/follow request
export const sendConnectionRequest = async (req, res) => {
    const { receiver_id } = req.body;
    const requester_id = req.user.id;

    if (requester_id === receiver_id) {
        return res.status(400).json({ message: "You cannot connect with yourself." });
    }

    try {
        // Check if a request already exists
        const existing = await db.query(
            'SELECT * FROM connections WHERE (requester_id = $1 AND receiver_id = $2) OR (requester_id = $2 AND receiver_id = $1)',
            [requester_id, receiver_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Relationship already exists or is pending." });
        }

        await db.query(
            'INSERT INTO connections (requester_id, receiver_id, status) VALUES ($1, $2, \'pending\')',
            [requester_id, receiver_id]
        );

        res.status(201).json({ message: 'Connection request sent successfully.' });
    } catch (error) {
        console.error('Connection Request Error:', error);
        res.status(500).json({ message: 'Server error sending connection request' });
    }
};

// Accept/Reject connection request
export const updateConnectionStatus = async (req, res) => {
    const { connection_id, status } = req.body; // status: 'accepted' or 'rejected'
    const user_id = req.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status." });
    }

    try {
        // Only the receiver can update the status
        const updateResult = await db.query(
            'UPDATE connections SET status = $1 WHERE id = $2 AND receiver_id = $3 RETURNING *',
            [status, connection_id, user_id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ message: "Connection request not found or unauthorized." });
        }

        res.json({ message: `Connection ${status} successfully.` });
    } catch (error) {
        console.error('Update Connection Error:', error);
        res.status(500).json({ message: 'Server error updating connection' });
    }
};

// Get pending requests for current user (Alumni usually)
export const getPendingRequests = async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT c.id as connection_id, u.id as requester_id, u.name, u.email, sp.department, sp.batch, sp.resume_url 
             FROM connections c 
             JOIN users u ON c.requester_id = u.id 
             LEFT JOIN student_profiles sp ON u.id = sp.user_id
             WHERE c.receiver_id = $1 AND c.status = 'pending'`,
            [user_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get Pending Requests Error:', error);
        res.status(500).json({ message: 'Server error fetching pending requests' });
    }
};

// Get connections (friends/verified)
export const getMyConnections = async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT u.id, u.name, u.role, u.college, u.email, c.status
             FROM connections c
             JOIN users u ON (c.requester_id = u.id OR c.receiver_id = u.id)
             WHERE (c.requester_id = $1 OR c.receiver_id = $1) 
             AND u.id != $1 AND c.status = 'accepted'`,
            [user_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get Connections Error:', error);
        res.status(500).json({ message: 'Server error fetching connections' });
    }
};

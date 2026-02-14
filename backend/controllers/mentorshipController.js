import db from '../config/db.js';

// Accept or Reject a mentorship request
export const updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const alumni_id = req.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Ensure the request belongs to this alumni
        const checkRequest = await db.query(
            'SELECT * FROM mentorship_requests WHERE id = $1 AND alumni_id = $2',
            [id, alumni_id]
        );

        if (checkRequest.rows.length === 0) {
            return res.status(404).json({ message: 'Mentorship request not found or unauthorized' });
        }

        await db.query(
            'UPDATE mentorship_requests SET status = $1 WHERE id = $2',
            [status, id]
        );

        res.json({ message: `Mentorship request ${status} successfully` });
    } catch (error) {
        console.error('Update Mentorship Status Error:', error);
        res.status(500).json({ message: 'Server error updating mentorship request' });
    }
};

// Get details of a specific mentorship request
export const getMentorshipDetails = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT mr.*, 
                    s.name as student_name, s.email as student_email,
                    a.name as alumni_name, a.email as alumni_email
             FROM mentorship_requests mr
             JOIN users s ON mr.student_id = s.id
             JOIN users a ON mr.alumni_id = a.id
             WHERE mr.id = $1 AND (mr.student_id = $2 OR mr.alumni_id = $2)`,
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Mentorship request not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get Mentorship Details Error:', error);
        res.status(500).json({ message: 'Server error fetching mentorship details' });
    }
};

// Get mentorship history for the user
export const getHistory = async (req, res) => {
    const user_id = req.user.id;
    const { role } = req.user;

    try {
        let query = '';
        if (role === 'student') {
            query = `
                SELECT mr.*, u.name as alumni_name, ap.company, ap.job_role
                FROM mentorship_requests mr
                JOIN users u ON mr.alumni_id = u.id
                JOIN alumni_profiles ap ON u.id = ap.user_id
                WHERE mr.student_id = $1
                ORDER BY mr.created_at DESC
            `;
        } else {
            query = `
                SELECT mr.*, u.name as student_name, sp.department, sp.batch
                FROM mentorship_requests mr
                JOIN users u ON mr.student_id = u.id
                JOIN student_profiles sp ON u.id = sp.user_id
                WHERE mr.alumni_id = $1
                ORDER BY mr.created_at DESC
            `;
        }

        const result = await db.query(query, [user_id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get Mentorship History Error:', error);
        res.status(500).json({ message: 'Server error fetching mentorship history' });
    }
};

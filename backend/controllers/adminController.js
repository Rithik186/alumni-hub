import db from '../config/db.js';

// Get all pending alumni registrations
export const getPendingAlumni = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.name, u.email, u.phone_number, u.college, ap.company, ap.job_role, ap.department, ap.batch, u.created_at 
             FROM users u 
             JOIN alumni_profiles ap ON u.id = ap.user_id 
             WHERE u.role = 'alumni' AND u.is_approved = false AND u.is_verified = true`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get Pending Alumni Error:', error);
        res.status(500).json({ message: 'Server error fetching pending alumni' });
    }
};

// Approve or Reject an alumni account
export const updateApprovalStatus = async (req, res) => {
    const { userId, status } = req.body; // status: 'approved' or 'rejected'

    try {
        if (status === 'approved') {
            await db.query('UPDATE users SET is_approved = true WHERE id = $1', [userId]);
            res.json({ message: 'Account approved successfully' });
        } else {
            await db.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
            res.json({ message: 'Account rejected/deactivated' });
        }
    } catch (error) {
        console.error('Update Approval Status Error:', error);
        res.status(500).json({ message: 'Server error updating approval status' });
    }
};

// Get platform stats
export const getPlatformStats = async (req, res) => {
    try {
        const userStats = await db.query('SELECT role, count(*) FROM users GROUP BY role');
        const mentorshipStats = await db.query('SELECT status, count(*) FROM mentorship_requests GROUP BY status');

        res.json({
            users: userStats.rows,
            mentorships: mentorshipStats.rows
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

// Get all users with profiles
export const getAllUsers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.name, u.email, u.role, u.college, u.is_active, u.is_approved, u.created_at
             FROM users u
             WHERE u.role != 'admin'
             ORDER BY u.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query(
            'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
            [userId]
        );
        res.json({ message: 'User status updated', is_active: result.rows[0].is_active });
    } catch (error) {
        console.error('Toggle User Status Error:', error);
        res.status(500).json({ message: 'Server error toggling user status' });
    }
};

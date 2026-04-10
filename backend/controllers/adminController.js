import db from '../config/db.js';
import bcrypt from 'bcryptjs';

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
        const [userStats, mentorshipStats, postStats] = await Promise.all([
            db.query('SELECT role, count(*) FROM users GROUP BY role'),
            db.query('SELECT status, count(*) FROM mentorship_requests GROUP BY status'),
            db.query('SELECT COUNT(*) as total_posts FROM posts')
        ]);

        res.json({
            users: userStats.rows,
            mentorships: mentorshipStats.rows,
            posts: postStats.rows[0].total_posts
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
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User status updated', is_active: result.rows[0].is_active });
    } catch (error) {
        console.error('Toggle User Status Error:', error);
        res.status(500).json({ message: 'Server error toggling user status' });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        // Due to cascade delete, profiles will be deleted automatically
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

// Update user by admin
export const updateUserByAdmin = async (req, res) => {
    const { userId } = req.params;
    const { name, email, role, is_active, is_approved, college } = req.body;

    try {
        await db.query(
            'UPDATE users SET name = $1, email = $2, role = $3, is_active = $4, is_approved = $5, college = $6 WHERE id = $7',
            [name, email, role, is_active, is_approved, college, userId]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update User Admin Error:', error);
        res.status(500).json({ message: 'Server error updating user' });
    }
};

// Create user by admin
export const createUserByAdmin = async (req, res) => {
    const { name, email, password, role, college } = req.body;

    try {
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role, college, is_verified, is_approved, is_active) VALUES ($1, $2, $3, $4, $5, true, true, true) RETURNING id',
            [name, email, password_hash, role, college]
        );

        if (newUser.rows.length === 0) return res.status(500).json({ message: 'Failed to create user' });
        const userId = newUser.rows[0].id;

        // Initialize empty profiles
        if (role === 'student') {
            await db.query('INSERT INTO student_profiles (user_id) VALUES ($1)', [userId]);
        } else if (role === 'alumni') {
            await db.query('INSERT INTO alumni_profiles (user_id) VALUES ($1)', [userId]);
        }

        res.status(201).json({ message: 'User created successfully', id: userId });
    } catch (error) {
        console.error('Create User Admin Error:', error);
        res.status(500).json({ message: 'Server error creating user' });
    }
};

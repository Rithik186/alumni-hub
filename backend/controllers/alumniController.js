import db from '../config/db.js';

// Update alumni profile
export const updateProfile = async (req, res) => {
    const { company, job_role, skills, bio, mentorship_available, experience_level } = req.body;
    const user_id = req.user.id;

    try {
        await db.query(
            `UPDATE alumni_profiles 
             SET company = $1, job_role = $2, skills = $3, bio = $4, mentorship_available = $5, experience_level = $6
             WHERE user_id = $7`,
            [company, job_role, skills, bio, mentorship_available, experience_level, user_id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// Toggle mentorship availability
export const toggleMentorship = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await db.query(
            'UPDATE alumni_profiles SET mentorship_available = NOT mentorship_available WHERE user_id = $1 RETURNING mentorship_available',
            [user_id]
        );
        res.json({
            message: 'Mentorship status toggled',
            mentorship_available: result.rows[0].mentorship_available
        });
    } catch (error) {
        console.error('Toggle Mentorship Error:', error);
        res.status(500).json({ message: 'Server error toggling mentorship status' });
    }
};

// Get mentorship requests for this alumni
export const getRequests = async (req, res) => {
    const alumni_id = req.user.id;
    try {
        const result = await db.query(
            `SELECT mr.*, u.name as student_name, u.email as student_email, sp.department, sp.batch, sp.resume_url
             FROM mentorship_requests mr
             JOIN users u ON mr.student_id = u.id
             LEFT JOIN student_profiles sp ON u.id = sp.user_id
             WHERE mr.alumni_id = $1
             ORDER BY mr.created_at DESC`,
            [alumni_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get Mentorship Requests Error:', error);
        res.status(500).json({ message: 'Server error fetching mentorship requests' });
    }
};

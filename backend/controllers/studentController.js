import db from '../config/db.js';

// Enhanced Alumni Search with "LinkedIn-style" granularity
export const searchAlumni = async (req, res) => {
    const {
        name, company, college, department, batch, skills,
        job_role, experience_level, mentorship_available,
        bio, placement_status, created_after
    } = req.query;

    try {
        let query = `
            SELECT u.id, u.name, u.email, u.college, ap.company, ap.job_role, ap.department, ap.batch, ap.skills, ap.experience_level, ap.mentorship_available, ap.bio
            FROM users u
            JOIN alumni_profiles ap ON u.id = ap.user_id
            WHERE u.role = 'alumni' 
        `;

        const params = [];
        let paramCount = 1;

        if (name) {
            query += ` AND u.name ILIKE $${paramCount}`;
            params.push(`%${name}%`);
            paramCount++;
        }
        if (company) {
            query += ` AND ap.company ILIKE $${paramCount}`;
            params.push(`%${company}%`);
            paramCount++;
        }
        if (college) {
            query += ` AND u.college ILIKE $${paramCount}`;
            params.push(`%${college}%`);
            paramCount++;
        }
        if (department) {
            query += ` AND ap.department ILIKE $${paramCount}`;
            params.push(`%${department}%`);
            paramCount++;
        }
        if (batch) {
            query += ` AND ap.batch = $${paramCount}`;
            params.push(batch);
            paramCount++;
        }
        if (job_role) {
            query += ` AND ap.job_role ILIKE $${paramCount}`;
            params.push(`%${job_role}%`);
            paramCount++;
        }
        if (mentorship_available === 'true') {
            query += ` AND ap.mentorship_available = true`;
        }
        if (experience_level) {
            query += ` AND ap.experience_level = $${paramCount}`;
            params.push(experience_level);
            paramCount++;
        }
        if (bio) {
            query += ` AND ap.bio ILIKE $${paramCount}`;
            params.push(`%${bio}%`);
            paramCount++;
        }
        if (created_after) {
            query += ` AND u.created_at > $${paramCount}`;
            params.push(created_after);
            paramCount++;
        }

        // Skills filter (array overlap)
        if (skills) {
            const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
            query += ` AND ap.skills && $${paramCount}::text[]`;
            params.push(skillsArray);
            paramCount++;
        }

        query += ` ORDER BY u.created_at DESC`;

        const result = await db.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Search Alumni Error:', error);
        res.status(500).json({ message: 'Server error during alumni search' });
    }
};

export const sendRequest = async (req, res) => {
    const { alumni_id, purpose, message } = req.body;
    const student_id = req.user.id;

    try {
        await db.query(
            'INSERT INTO mentorship_requests (student_id, alumni_id, purpose, message) VALUES ($1, $2, $3, $4)',
            [student_id, alumni_id, purpose, message]
        );
        res.status(201).json({ message: 'Mentorship request sent successfully' });
    } catch (error) {
        console.error('Mentorship Request Error:', error);
        res.status(500).json({ message: 'Server error sending request' });
    }
};

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const base64String = req.file.buffer.toString('base64');
        const resume_url = `data:${req.file.mimetype};base64,${base64String}`;

        await db.query(
            'UPDATE student_profiles SET resume_url = $1 WHERE user_id = $2',
            [resume_url, req.user.id]
        );

        res.json({
            message: 'Resume uploaded successfully',
            resume_url
        });

    } catch (error) {
        console.error('Resume Upload Error:', error);
        res.status(500).json({ 
            message: 'Server error during resume upload',
            error: error.message 
        });
    }
};

// Update student profile
export const updateProfile = async (req, res) => {
    const { department, batch, bio, skills } = req.body;
    try {
        // Ensure skills is an array
        const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s) : skills;

        await db.query(
            'UPDATE student_profiles SET department = $1, batch = $2, bio = $3, skills = $4 WHERE user_id = $5',
            [department, batch, bio, skillsArray, req.user.id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

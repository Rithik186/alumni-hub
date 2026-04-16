import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import generateToken from '../utils/generateToken.js';
import { sendEmailOtp } from '../utils/emailService.js';

// @desc    Register a new user (Student or Alumni)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const {
        name, email, phone_number, password, role, college,
        // Student specific
        department, register_number, batch,
        // Alumni specific
        company, job_role
    } = req.body;

    try {
        // 1. Check if user exists
        const userExists = await db.query('SELECT id FROM users WHERE email = $1 OR phone_number = $2', [email, phone_number]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email or phone number' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Generate OTP
        const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_expiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Production flow: Accounts start unverified
        const isApproved = role === 'student'; // Auto-approve students, alumni need admin
        const isActive = true;
        const isVerified = false; // Must verify email OTP

        const newUser = await db.query(
            'INSERT INTO users (name, email, phone_number, password_hash, role, college, otp_code, otp_expiry, is_approved, is_active, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
            [name, email, phone_number, password_hash, role, college, otp_code, otp_expiry, isApproved, isActive, isVerified]
        );

        const userId = newUser.rows[0].id;

        // 5. Create Profile based on role
        if (role === 'student') {
            await db.query(
                'INSERT INTO student_profiles (user_id, department, register_number, batch) VALUES ($1, $2, $3, $4)',
                [userId, department, register_number, batch]
            );
        } else if (role === 'alumni') {
            await db.query(
                'INSERT INTO alumni_profiles (user_id, company, job_role, batch, department) VALUES ($1, $2, $3, $4, $5)',
                [userId, company, job_role, batch, department]
            );
        }

        // 4. Send Real Email OTP
        await sendEmailOtp(email, otp_code, name);

        res.status(201).json({
            message: 'Registration successful. please check your email for the verification code.',
            email,
            otp_sent: true
        });

    } catch (error) {
        console.error('Registration Error:', error);
        if (error.code === '23505') { // Unique constraint violation
            const detail = error.detail || '';
            let message = 'User already exists with these details';
            if (detail.includes('email')) message = 'Email already in use';
            if (detail.includes('phone_number')) message = 'Phone number already in use';
            if (detail.includes('register_number')) message = 'Register number already in use';
            return res.status(400).json({ message });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Verify OTP and Login
export const verifyOtp = async (req, res) => {
    const { email, phone_number, otp_code } = req.body;

    try {
        const userResult = await db.query('SELECT id, name, email, role, profile_picture, otp_code, otp_expiry, is_verified FROM users WHERE email = $1 OR phone_number = $2', [email, phone_number]);
        const user = userResult.rows[0];

        if (!user || user.otp_code !== otp_code) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({ message: 'OTP Expired' });
        }

        // Verify user
        await db.query('UPDATE users SET is_verified = true, otp_code = NULL WHERE id = $1', [user.id]);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_picture: user.profile_picture,
            token: generateToken(user.id, user.role)
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await db.query('SELECT id, name, email, role, profile_picture, password_hash, is_verified, is_approved, is_active FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            if (!user.is_verified) {
                // Generate and Send OTP if not verified
                const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
                const otp_expiry = new Date(Date.now() + 10 * 60000); // 10 minutes

                await db.query(
                    'UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE id = $3',
                    [otp_code, otp_expiry, user.id]
                );

                await sendEmailOtp(user.email, otp_code, user.name);

                return res.status(200).json({ 
                    otp_sent: true, 
                    email: user.email,
                    message: 'Account not verified. Verification code sent to your email.' 
                });
            }

            if (user.role === 'alumni' && !user.is_approved) {
                return res.status(403).json({ message: 'Your account is pending admin approval' });
            }

            if (!user.is_active) {
                return res.status(403).json({ message: 'Your account has been deactivated' });
            }

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_picture: user.profile_picture,
                token: generateToken(user.id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        console.log('--- getMe requested for User ID:', req.user?.id);
        const userRes = await db.query('SELECT id, name, email, phone_number, role, college, profile_picture, is_approved, is_verified, created_at FROM users WHERE id = $1', [req.user.id]);
        
        if (userRes.rows.length === 0) {
            console.warn('--- getMe: User not found in DB');
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = userRes.rows[0];
        let profile = null;
        if (user.role === 'student') {
            const spRes = await db.query('SELECT user_id, department, register_number, batch, skills FROM student_profiles WHERE user_id = $1', [req.user.id]);
            profile = spRes.rows[0];
        } else if (user.role === 'alumni') {
            const apRes = await db.query('SELECT user_id, company, job_role, department, batch, bio, skills, experience_level, mentorship_available FROM alumni_profiles WHERE user_id = $1', [req.user.id]);
            profile = apRes.rows[0];
        }

        console.log('--- getMe: Success for', user.name);
        res.json({ ...user, profile });
    } catch (error) {
        console.error('--- getMe CRITICAL Error:', error);
        res.status(500).json({ message: 'Server error fetching user details', error: error.message });
    }
};


// @desc    Get any user profile by ID

// @route   GET /api/auth/profile/:id
// @access  Private
export const getUserProfile = async (req, res) => {
    const { id } = req.params;
    const requesterId = req.user.id;

    try {
        const userRes = await db.query('SELECT id, name, email, phone_number, role, college, profile_picture, is_approved, created_at FROM users WHERE id = $1', [id]);
        if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = userRes.rows[0];
        let profile = null;
        if (user.role === 'student') {
            const spRes = await db.query('SELECT user_id, department, register_number, batch, bio, skills FROM student_profiles WHERE user_id = $1', [id]);
            profile = spRes.rows[0];
        } else if (user.role === 'alumni') {
            const apRes = await db.query('SELECT user_id, company, job_role, department, batch, bio, skills, experience_level, mentorship_available FROM alumni_profiles WHERE user_id = $1', [id]);
            profile = apRes.rows[0];
        }

        // Check connection status
        const followStatusRes = await db.query('SELECT status FROM follows WHERE follower_id = $1 AND following_id = $2', [requesterId, id]);
        const followStatus = followStatusRes.rows[0]?.status || 'none';
        
        const backFollowRes = await db.query('SELECT status FROM follows WHERE follower_id = $1 AND following_id = $2', [id, requesterId]);
        const isMutual = followStatus === 'accepted' && backFollowRes.rows[0]?.status === 'accepted';

        // Privacy Logic: Show limited if not connected
        const isOwner = requesterId === parseInt(id);
        const canViewFull = isOwner || isMutual || followStatus === 'accepted'; // Grant some visibility if accepted follow exists

        if (!canViewFull) {
            // Limited data
            return res.json({
                id: user.id,
                name: user.name,
                role: user.role,
                college: user.college,
                profile_picture: user.profile_picture,
                is_approved: user.is_approved,
                created_at: user.created_at,
                profile: {
                    job_role: profile?.job_role,
                    company: profile?.company,
                    department: profile?.department,
                    bio: 'Locked! Connect to view full profile.',
                    skills: [] // Empty skills
                },
                connectionStatus: { status: followStatus, isMutual },
                isLimited: true
            });
        }

        res.json({ 
            ...user, 
            profile, 
            connectionStatus: { status: followStatus, isMutual },
            isLimited: false
        });

    } catch (error) {
        console.error('Get User Profile Error:', error);
        res.status(500).json({ message: 'Server error fetching user profile' });
    }
};

// @desc    Request OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const userResult = await db.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate OTP
        const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_expiry = new Date(Date.now() + 10 * 60000); // 10 minutes

        await db.query(
            'UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE id = $3',
            [otp_code, otp_expiry, user.id]
        );

        await sendEmailOtp(user.email, otp_code, user.name);

        res.json({ message: 'Verification code sent to your email', email });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error during forgot password' });
    }
};

// @desc    Reset password using old password or OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    const { email, oldPassword, otp, newPassword } = req.body;

    try {
        const userResult = await db.query('SELECT id, email, password_hash, otp_code, otp_expiry FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let isAuthorized = false;

        if (oldPassword) {
            // Case 1: Reset using old password
            if (await bcrypt.compare(oldPassword, user.password_hash)) {
                isAuthorized = true;
            } else {
                return res.status(401).json({ message: 'Incorrect old password' });
            }
        } else if (otp) {
            // Case 2: Reset using OTP
            if (user.otp_code === otp && new Date() < new Date(user.otp_expiry)) {
                isAuthorized = true;
            } else {
                return res.status(401).json({ message: 'Invalid or expired OTP' });
            }
        } else {
            return res.status(400).json({ message: 'Provide either old password or OTP' });
        }

        if (isAuthorized) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(newPassword, salt);

            await db.query(
                'UPDATE users SET password_hash = $1, otp_code = NULL, otp_expiry = NULL WHERE id = $2',
                [password_hash, user.id]
            );

            res.json({ message: 'Password reset successfully. You can now login.' });
        }

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};

// @desc    Update user basic info
// @route   PUT /api/auth/profile
// @access  Private
export const updateUser = async (req, res) => {
    const { name, email, phone_number, college } = req.body;
    try {
        await db.query(
            'UPDATE users SET name = $1, email = $2, phone_number = $3, college = $4 WHERE id = $5',
            [name, email, phone_number, college, req.user.id]
        );
        res.json({ message: 'User info updated successfully' });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: 'Server error updating user info' });
    }
};

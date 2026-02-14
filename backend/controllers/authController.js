import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import generateToken from '../utils/generateToken.js';

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
        const userExists = await db.query('SELECT * FROM users WHERE email = $1 OR phone_number = $2', [email, phone_number]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email or phone number' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Generate Mock OTP
        const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_expiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Auto-approve and activate for demo purposes
        const isApproved = true;
        const isActive = true;
        const isVerified = true; // Auto-verify for ultra-smooth demo flow

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

        console.log(`[MOCK OTP] Sent to ${phone_number}: ${otp_code}`);

        res.status(201).json({
            message: role === 'alumni'
                ? 'User registered. Please verify your phone number. Note: Alumni accounts require admin approval after verification.'
                : 'User registered. Please verify your phone number with the OTP.',
            phone_number,
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
    const { phone_number, otp_code } = req.body;

    try {
        const userResult = await db.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
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
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            if (!user.is_verified) {
                return res.status(401).json({ message: 'Please verify your phone number first' });
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
        const userResult = await db.query(
            'SELECT id, name, email, phone_number, role, college, is_verified, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        let profile = null;

        if (user.role === 'student') {
            const studentResult = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [user.id]);
            profile = studentResult.rows[0];
        } else if (user.role === 'alumni') {
            const alumniResult = await db.query('SELECT * FROM alumni_profiles WHERE user_id = $1', [user.id]);
            profile = alumniResult.rows[0];
        }

        res.json({ ...user, profile });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};
// @desc    Request OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
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

        console.log(`[MOCK RESET OTP] Sent to ${user.email}: ${otp_code}`);

        res.json({ message: 'OTP sent to your email (Mocked in console)', email });

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
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
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

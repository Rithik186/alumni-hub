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

        // 4. Create main user record
        const newUser = await db.query(
            'INSERT INTO users (name, email, phone_number, password_hash, role, college, otp_code, otp_expiry) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, role',
            [name, email, phone_number, password_hash, role, college, otp_code, otp_expiry]
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

        // Mock sending OTP
        console.log(`[MOCK OTP] Sent to ${phone_number}: ${otp_code}`);

        res.status(201).json({
            message: 'User registered. Please verify your phone number with the OTP.',
            phone_number,
            otp_sent: true // In a real app, you'd trigger SMS here
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
    const { phone_number, otp_code } = req.body;

    try {
        const userResult = await db.query(
            'SELECT * FROM users WHERE phone_number = $1 AND otp_code = $2 AND otp_expiry > NOW()',
            [phone_number, otp_code]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = userResult.rows[0];

        // Mark as verified
        await db.query('UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expiry = NULL WHERE id = $1', [user.id]);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

// @desc    Auth user & get token (Standard login)
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

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

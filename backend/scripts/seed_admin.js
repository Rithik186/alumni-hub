
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const seedAdmin = async () => {
    const name = 'Admin Rithik';
    const email = 'admin';
    const password = 'admin';
    const role = 'admin';
    const phone_number = '0000000000';

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Standardized behavior: UPSERT (Update existing if exists, else insert)
        const checkResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        
        if (checkResult.rows.length > 0) {
            // Update
            await db.query(
                'UPDATE users SET password_hash = $1, is_approved = true, is_active = true, is_verified = true, role = $2 WHERE email = $3',
                [password_hash, role, email]
            );
            console.log('Admin user updated successfully!');
        } else {
            // Link existing admin if it exists with the old email?
            // User requested change, so we just create/ensure this one.
            await db.query(
                'INSERT INTO users (name, email, phone_number, password_hash, role, is_approved, is_active, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [name, email, phone_number, password_hash, role, true, true, true]
            );
            console.log('Admin user created successfully!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();

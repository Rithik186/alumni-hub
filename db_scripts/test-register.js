import db from './backend/config/db.js';
import bcrypt from 'bcryptjs';

async function testRegister() {
    const userData = {
        name: 'Test Student',
        email: 'student@example.com',
        phone_number: '1234567890',
        password: 'password',
        role: 'student',
        college: 'Test College',
        department: 'CSE',
        register_number: 'STU001',
        batch: '2024'
    };

    try {
        console.log('--- Testing Registration Logic ---');

        // Clean up
        await db.query('DELETE FROM users WHERE email = $1', [userData.email]);
        console.log('✅ Previous test user cleaned up');

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(userData.password, salt);
        const otp_code = '123456';
        const otp_expiry = new Date(Date.now() + 600000);

        const newUser = await db.query(
            'INSERT INTO users (name, email, phone_number, password_hash, role, college, otp_code, otp_expiry) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [userData.name, userData.email, userData.phone_number, password_hash, userData.role, userData.college, otp_code, otp_expiry]
        );
        const userId = newUser.rows[0].id;
        console.log('✅ Main user created with ID:', userId);

        await db.query(
            'INSERT INTO student_profiles (user_id, department, register_number, batch) VALUES ($1, $2, $3, $4)',
            [userId, userData.department, userData.register_number, userData.batch]
        );
        console.log('✅ Student profile created');

        console.log('--- TEST PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ TEST FAILED:', err);
        process.exit(1);
    }
}

testRegister();

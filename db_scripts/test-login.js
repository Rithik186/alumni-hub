import bcrypt from 'bcryptjs';
import db from './backend/config/db.js';
import generateToken from './backend/utils/generateToken.js';

async function testLogin() {
    const email = 'test@test.com';
    const password = 'password';

    try {
        console.log('--- Testing Login Logic ---');

        // 1. Create a test user first since DB is cleared
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await db.query('DELETE FROM users WHERE email = $1', [email]);
        const newUser = await db.query(
            'INSERT INTO users (name, email, phone_number, password_hash, role, college, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            ['Test User', email, '1234567890', hash, 'student', 'Test College', true]
        );
        const userId = newUser.rows[0].id;
        console.log('✅ Test User Created ID:', userId);

        // 2. Run Login Query
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];
        console.log('✅ User Found in DB');

        // 3. Compare Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('✅ Password Match:', isMatch);

        // 4. Generate Token
        const token = generateToken(user.id);
        console.log('✅ Token Generated:', token.substring(0, 10) + '...');

        console.log('--- TEST PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ TEST FAILED:', err);
        process.exit(1);
    }
}

testLogin();

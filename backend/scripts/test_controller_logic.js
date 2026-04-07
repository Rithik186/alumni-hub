import db from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    const req = { user: { id: 17 } }; // Use user 17 as seen in DB
    try {
        console.log('Fetching settings for user 17...');
        const result = await db.query(
            'SELECT * FROM user_settings WHERE user_id = $1',
            [req.user.id]
        );
        console.log('Result found:', result.rows[0] ? 'Yes' : 'No');
        process.exit(0);
    } catch (err) {
        console.error('SERVER-SIDE TEST ERROR:', err);
        process.exit(1);
    }
};
test();

import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
    try {
        const userId = 17; // Assuming Rithik is 17
        const res = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
        console.log('User 17 Settings:', res.rows[0] ? 'Found' : 'Not Found');
        
        if (!res.rows[0]) {
            console.log('Inserting default settings...');
            const insert = await pool.query('INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *', [userId]);
            console.log('Inserted:', insert.rows[0]);
        }
        
        await pool.end();
    } catch (err) {
        console.error('VERIFY ERROR:', err);
        await pool.end();
    }
}
verify();

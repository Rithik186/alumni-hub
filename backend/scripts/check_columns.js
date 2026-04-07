import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
    try {
        const res = await pool.query('SELECT * FROM user_settings LIMIT 1');
        console.log('Columns found in live DB:');
        if (res.rows[0]) {
            console.log(Object.keys(res.rows[0]));
        } else {
            console.log('Table is empty, checking schema...');
            const schema = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_settings'");
            console.log(schema.rows.map(r => r.column_name));
        }
        await pool.end();
    } catch (err) {
        console.error('ERROR:', err);
        await pool.end();
    }
}
verify();

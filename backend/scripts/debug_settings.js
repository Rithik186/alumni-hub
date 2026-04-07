import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_settings'");
        console.log('Columns:');
        console.table(res.rows);
        
        const count = await pool.query("SELECT count(*) FROM user_settings");
        console.log('Total Settings Rows:', count.rows[0].count);
        
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
        await pool.end();
    }
}
check();

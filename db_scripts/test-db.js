import db from './backend/config/db.js';

async function checkConnection() {
    try {
        console.log('Testing connection...');
        const res = await db.query('SELECT NOW()');
        console.log('✅ Success! Database connected.');
        console.log('Current Time from DB:', res.rows[0].now);
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error(err.message);
        process.exit(1);
    }
}

checkConnection();

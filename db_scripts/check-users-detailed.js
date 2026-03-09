import db from './backend/config/db.js';

async function checkUsers() {
    try {
        const columns = await db.query(`
            SELECT column_name, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.table(columns.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();

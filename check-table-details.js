import db from './backend/config/db.js';

async function checkTableDetails() {
    try {
        const columns = await db.query(`
            SELECT column_name, column_default, is_nullable, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'mentorship_requests'
        `);
        console.log('mentorship_requests columns:', columns.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTableDetails();

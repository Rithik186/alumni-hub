import db from './backend/config/db.js';

async function checkCols() {
    try {
        const usersCols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log('Users columns:', usersCols.rows.map(r => r.column_name));

        const alumniCols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'alumni_profiles'");
        console.log('Alumni columns:', alumniCols.rows.map(r => r.column_name));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCols();

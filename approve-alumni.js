import db from './backend/config/db.js';

async function fixAlumni() {
    try {
        const result = await db.query("UPDATE users SET is_approved = true WHERE role = 'alumni'");
        console.log(`Approved ${result.rowCount} alumni accounts.`);

        const alumni = await db.query("SELECT id, name, is_approved FROM users WHERE role = 'alumni'");
        console.log('Current Alumni:', alumni.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixAlumni();

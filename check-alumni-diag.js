import db from './backend/config/db.js';

async function checkAll() {
    try {
        const users = await db.query("SELECT id, name, role, is_approved, is_active FROM users WHERE role = 'alumni'");
        console.log('Alumni Users:', users.rows);

        const profiles = await db.query("SELECT user_id, company FROM alumni_profiles");
        console.log('Alumni Profiles:', profiles.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAll();

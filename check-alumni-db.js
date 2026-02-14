import db from './backend/config/db.js';

async function checkAlumniStatus() {
    try {
        const result = await db.query(`
            SELECT u.id, u.name, u.role, u.is_approved, u.is_active, ap.mentorship_available
            FROM users u
            JOIN alumni_profiles ap ON u.id = ap.user_id
            WHERE u.role = 'alumni'
        `);
        console.log('Alumni Profiles:', result.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAlumniStatus();

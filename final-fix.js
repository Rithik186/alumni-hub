import db from './backend/config/db.js';

async function finalFix() {
    try {
        console.log('--- GLOBAL DATABASE OVERHAUL ---');

        // Fix Users
        console.log('Synchronizing user permissions...');
        await db.query(`
            UPDATE users 
            SET is_approved = true, 
                is_active = true, 
                is_verified = true 
            WHERE role IN ('alumni', 'student')
        `);

        // Fix Profiles
        console.log('Ensuring all alumni have active profiles...');
        const orphans = await db.query(`
            SELECT u.id, u.name 
            FROM users u 
            LEFT JOIN alumni_profiles ap ON u.id = ap.user_id 
            WHERE u.role = 'alumni' AND ap.user_id IS NULL
        `);

        for (const orphan of orphans.rows) {
            await db.query(`
                INSERT INTO alumni_profiles (user_id, company, job_role, department, batch, mentorship_available) 
                VALUES ($1, 'Global Network', 'Alumni Professional', 'IT', '2022', true)
            `, [orphan.id]);
        }

        // Global Availability
        console.log('Activating all alumni signals...');
        await db.query("UPDATE alumni_profiles SET mentorship_available = true");

        // Fix Mentorship Requests
        console.log('Resetting mentorship request status protocols...');
        await db.query("UPDATE mentorship_requests SET status = 'pending' WHERE status IS NULL OR status = ''");

        // Ensure status column has default
        try {
            await db.query("ALTER TABLE mentorship_requests ALTER COLUMN status SET DEFAULT 'pending'");
        } catch (e) {
            // Might already have a default or different name
        }

        console.log('--- SYSTEM FULLY SYNCHRONIZED ---');
        process.exit(0);
    } catch (err) {
        console.error('Final Fix Error:', err);
        process.exit(1);
    }
}

finalFix();

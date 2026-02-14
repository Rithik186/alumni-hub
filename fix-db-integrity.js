import db from './backend/config/db.js';

async function fixDatabase() {
    try {
        console.log('--- Checking Mentorship Requests Status Column ---');
        const columns = await db.query(`
            SELECT column_name, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'mentorship_requests' AND column_name = 'status'
        `);

        if (columns.rows.length > 0 && (!columns.rows[0].column_default || columns.rows[0].column_default.includes('NULL'))) {
            console.log('Setting default value for status column to "pending"...');
            await db.query("ALTER TABLE mentorship_requests ALTER COLUMN status SET DEFAULT 'pending'");
        }

        console.log('Ensuring all mentorship requests have a status...');
        await db.query("UPDATE mentorship_requests SET status = 'pending' WHERE status IS NULL OR status = ''");

        console.log('--- Checking Alumni Profiles ---');
        // Join on user_id and check for NULL on any mandatory alumni_profile column since ap.id doesn't exist
        const orphans = await db.query(`
            SELECT u.id, u.name 
            FROM users u 
            LEFT JOIN alumni_profiles ap ON u.id = ap.user_id 
            WHERE u.role = 'alumni' AND ap.user_id IS NULL
        `);

        if (orphans.rows.length > 0) {
            console.log(`Found ${orphans.rows.length} alumni without profiles. Creating skeleton profiles...`);
            for (const orphan of orphans.rows) {
                await db.query(`
                    INSERT INTO alumni_profiles (user_id, company, job_role, department, batch, mentorship_available) 
                    VALUES ($1, 'Professional Network', 'Alumni', 'N/A', 'N/A', true)
                `, [orphan.id]);
                console.log(`- Profile created for ${orphan.name}`);
            }
        } else {
            console.log('No orphan alumni found.');
        }

        console.log('--- Ensuring All Alumni are Approved and Active ---');
        await db.query("UPDATE users SET is_approved = true, is_active = true WHERE role = 'alumni'");

        console.log('--- Final Connectivity Check ---');
        const allAlumni = await db.query(`
            SELECT u.name, u.is_approved, u.is_active, ap.mentorship_available
            FROM users u
            JOIN alumni_profiles ap ON u.id = ap.user_id
            WHERE u.role = 'alumni'
        `);
        console.table(allAlumni.rows);

        process.exit(0);
    } catch (err) {
        console.error('Database Fix Error:', err);
        process.exit(1);
    }
}

fixDatabase();

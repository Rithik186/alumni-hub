import db from './backend/config/db.js';

const inspectTables = async () => {
    const tables = ['users', 'posts', 'post_likes', 'post_comments', 'follows', 'notifications', 'user_settings', 'student_profiles', 'alumni_profiles'];
    for (const table of tables) {
        try {
            console.log(`--- Table: ${table} ---`);
            const res = await db.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            res.rows.forEach(row => {
                console.log(`${row.column_name}: ${row.data_type}`);
            });
        } catch (err) {
            console.error(`Error inspecting table ${table}:`, err.message);
        }
    }
    process.exit(0);
};

inspectTables();

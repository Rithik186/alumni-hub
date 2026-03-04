import db from './backend/config/db.js';

async function checkSpecificTables() {
    const targetTables = ['users', 'alumni_profiles', 'student_profiles', 'connections'];
    try {
        for (const table of targetTables) {
            const columns = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(`\n--- ${table} ---`);
            columns.rows.forEach(col => console.log(`${col.column_name}: ${col.data_type}`));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSpecificTables();

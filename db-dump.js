import db from './backend/config/db.js';
import fs from 'fs';

async function logSchema() {
    const targetTables = ['users', 'alumni_profiles', 'student_profiles', 'connections', 'mentorship_requests'];
    let output = '';
    try {
        for (const table of targetTables) {
            const columns = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            output += `\n--- ${table} ---\n`;
            columns.rows.forEach(col => {
                output += `${col.column_name}: ${col.data_type}\n`;
            });
        }
        fs.writeFileSync('schema_dump.txt', output);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

logSchema();

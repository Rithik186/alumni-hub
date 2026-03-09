import db from './backend/config/db.js';

async function checkSchema() {
    try {
        const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name));

        for (const table of tables.rows.map(r => r.table_name)) {
            const columns = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(`\n--- ${table} ---`);
            console.table(columns.rows);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();

import db from '../backend/config/db.js';

async function check() {
    try {
        const cols = await db.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'events'");
        console.log('Columns:', JSON.stringify(cols.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();

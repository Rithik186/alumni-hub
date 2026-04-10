import db from '../backend/config/db.js';

async function check() {
    try {
        const res = await db.query("SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'events_type_check'");
        console.log('Constraint:', res.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();

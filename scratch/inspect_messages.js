import db from '../backend/config/db.js';
const run = async () => {
    try {
        const res = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages'");
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
};
run();

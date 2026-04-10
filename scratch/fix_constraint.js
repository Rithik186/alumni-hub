import db from '../backend/config/db.js';

async function update() {
    try {
        await db.query("ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check");
        await db.query("ALTER TABLE events ADD CONSTRAINT events_type_check CHECK (type IN ('alumni_meet', 'training', 'general', 'placement', 'job', 'internship'))");
        console.log('Constraint Updated successfully to include job and internship.');
    } catch (e) {
        console.error('Update Failed:', e);
    } finally {
        process.exit();
    }
}

update();

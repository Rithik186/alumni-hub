import db from '../backend/config/db.js';

async function test() {
    const title = 'ZOHO';
    const description = 'ZOHO DRIVE';
    const date = '2027-02-02 10:10:00';
    const type = 'job';
    const metadata = { company: 'ZOHO', role: 'SDE', salary: '20', location: 'CBE', eligibility: '7.5+ CGPA' };
    const created_by = 1;

    try {
        const result = await db.query(
            'INSERT INTO events ("title", "description", "date", "type", "metadata", "created_by") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, date, type, JSON.stringify(metadata), created_by]
        );
        console.log('Success:', result.rows[0]);
    } catch (e) {
        console.error('FAILED:', e);
    } finally {
        process.exit();
    }
}

test();

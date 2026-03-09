import db from './backend/config/db.js';

async function viewAllData() {
    try {
        console.log('--- 👤 USERS TABLE ---');
        const users = await db.query('SELECT * FROM users');
        console.table(users.rows);

        console.log('\n--- 🎓 STUDENT PROFILES ---');
        const students = await db.query('SELECT * FROM student_profiles');
        console.table(students.rows);

        console.log('\n--- 🤝 ALUMNI PROFILES ---');
        const alumni = await db.query('SELECT * FROM alumni_profiles');
        console.table(alumni.rows);

        console.log('\n--- 🤝 CONNECTIONS ---');
        const connections = await db.query('SELECT * FROM connections');
        console.table(connections.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error fetching data:', err.message);
        process.exit(1);
    }
}

viewAllData();

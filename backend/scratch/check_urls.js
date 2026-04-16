import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_5EjuZYNSv1lF@ep-snowy-term-amqax0ru-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function check() {
    try {
        await client.connect();
        const res = await client.query('SELECT id, name, profile_picture FROM users');
        console.log('--- ALL Profile Pictures in DB ---');
        res.rows.forEach(row => {
            console.log(`ID: ${row.id}, Name: ${row.name}, URL: ${row.profile_picture}`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

check();

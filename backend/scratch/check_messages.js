import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_5EjuZYNSv1lF@ep-snowy-term-amqax0ru-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function check() {
    try {
        await client.connect();
        const res = await client.query('SELECT attachment_url FROM messages WHERE attachment_url IS NOT NULL');
        console.log('--- Attachment URLs in DB ---');
        res.rows.forEach(row => {
            console.log(row.attachment_url);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

check();

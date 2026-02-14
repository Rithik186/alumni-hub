import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const email = 'admin@alumnihub.com';
        const password = 'adminpassword';
        const hashedPassword = await bcrypt.hash(password, 10);

        const exists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (exists.rows.length === 0) {
            await client.query(
                `INSERT INTO users (name, email, phone_number, password_hash, role, college, is_verified, is_approved) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                ['System Admin', email, '0000000000', hashedPassword, 'admin', 'Main Campus', true, true]
            );
            console.log('✅ Admin user created: admin@alumnihub.com / adminpassword');
        } else {
            console.log('ℹ️ Admin user already exists');
        }
    } catch (err) {
        console.error('Error seeding admin:', err);
    } finally {
        await client.end();
    }
};

seedAdmin();

import db from './backend/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function updateDatabase() {
    try {
        console.log('Reading schema.sql...');
        const schema = fs.readFileSync(path.join(__dirname, 'backend', 'models', 'schema.sql'), 'utf8');

        console.log('Executing schema update...');
        await db.query(schema);

        console.log('✅ Database Schema Updated Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Schema Update Failed!');
        console.error(err.message);
        process.exit(1);
    }
}

updateDatabase();

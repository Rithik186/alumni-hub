import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : '',
  // Add some defaults for better reliability
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database Successfully');
});

pool.on('error', (err) => {
  console.error('CRITICAL: Unexpected error on idle database client', err);
});

export default {
  query: async (text, params) => {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
          console.warn('Slow Query detected:', text.substring(0, 100), `${duration}ms`);
      }
      return res;
    } catch (err) {
      console.error('Database Query Error:', {
          text: text.substring(0, 200),
          error: err.message,
          code: err.code
      });
      throw err;
    }
  },
  pool // Exporting pool for advanced usage if needed
};

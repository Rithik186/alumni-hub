import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/events', eventRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;

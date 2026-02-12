import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;

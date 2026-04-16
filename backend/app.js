import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(compression()); // gzip all responses — reduces bandwidth by 70-90%
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Static Files removed - Media handled directly via Data URIs from PostgreSQL

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/resume', resumeRoutes);

// Health check endpoint for "keep-alive" bots
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'active', message: 'Alumned In server is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('--- GLOBAL SERVER ERROR ---');
    console.error('Path:', req.path);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    
    res.status(500).json({ 
        message: 'Internal Server Error', 
        error: err.message,
        path: req.path,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});


export default app;

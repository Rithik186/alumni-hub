import express from 'express';
import { getEvents, createEvent, deleteEvent } from '../controllers/eventController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getEvents);
router.post('/', protect, adminOnly, createEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

export default router;

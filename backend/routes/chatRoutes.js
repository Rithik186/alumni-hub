import express from 'express';
import { getContacts, getMessages, sendMessage, editMessage, deleteMessage, markDelivered, markRead } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/contacts', protect, getContacts);
router.get('/messages/:contactId', protect, getMessages);
router.post('/messages', protect, sendMessage);

// These must come BEFORE the generic /:id routes to avoid route conflicts
router.put('/messages/deliver/:senderId', protect, markDelivered);
router.put('/messages/read/:senderId', protect, markRead);

router.put('/messages/:id', protect, editMessage);
router.delete('/messages/:id', protect, deleteMessage);

export default router;

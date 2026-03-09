import express from 'express';
import { getContacts, getMessages, sendMessage, editMessage, deleteMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/contacts', protect, getContacts);
router.get('/messages/:contactId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.put('/messages/:id', protect, editMessage);
router.delete('/messages/:id', protect, deleteMessage);

export default router;

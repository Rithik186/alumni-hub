import express from 'express';
import {
    createPost,
    getFeed,
    toggleLike,
    addComment,
    getComments,
    deletePost
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createPost);
router.get('/feed', protect, getFeed);
router.post('/:postId/like', protect, toggleLike);
router.post('/:postId/comment', protect, addComment);
router.get('/:postId/comments', protect, getComments);
router.delete('/:id', protect, deletePost);

export default router;

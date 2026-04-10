import express from 'express';
import {
    createPost,
    editPost,
    getFeed,
    toggleLike,
    addComment,
    getComments,
    deletePost,
    toggleCommentLike,
    pinComment,
    getPostLikes
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createPost);
router.put('/:id', protect, editPost);
router.get('/feed', protect, getFeed);
router.post('/:postId/like', protect, toggleLike);
router.get('/:postId/likes', protect, getPostLikes);
router.post('/:postId/comment', protect, addComment);
router.get('/:postId/comments', protect, getComments);
router.delete('/:id', protect, deletePost);
router.post('/comment/:commentId/like', protect, toggleCommentLike);
router.post('/comment/:commentId/pin', protect, pinComment);

export default router;

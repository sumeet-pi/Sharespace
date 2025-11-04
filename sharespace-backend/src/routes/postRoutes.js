import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  toggleKindness,
  addComment,
  getCommentsForPost,
} from '../controllers/postController.js';

const router = express.Router();

// Public: list all posts
router.get('/', getAllPosts);

// Authenticated routes
router.post('/', requireAuth, createPost);
router.get('/:id', requireAuth, getPostById);
router.delete('/:id', requireAuth, deletePost);
router.post('/:id/like', requireAuth, toggleKindness);
router.post('/:id/comments', requireAuth, addComment);
router.get('/:id/comments', requireAuth, getCommentsForPost);

export default router;



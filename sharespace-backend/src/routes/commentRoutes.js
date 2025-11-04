import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { deleteComment } from '../controllers/commentController.js';

const router = express.Router();

router.delete('/:id', requireAuth, deleteComment);

export default router;



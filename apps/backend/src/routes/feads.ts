import express, { type Router as RouterType } from 'express';
import {
  getFeads,
  getFead,
  createFead,
  updateFead,
  deleteFead,
  markFeadAsRead,
} from '../controllers/feadsController.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/feads - Get all feads for authenticated user
router.get('/', getFeads);

// POST /api/feads - Create a new fead
router.post('/', createFead);

// POST /api/feads/:id/mark-all-read - Mark all items in a fead as read (must be before /:id routes)
router.post('/:id/mark-all-read', markFeadAsRead);

// GET /api/feads/:id - Get a single fead
router.get('/:id', getFead);

// PUT /api/feads/:id - Update a fead
router.put('/:id', updateFead);

// DELETE /api/feads/:id - Delete a fead
router.delete('/:id', deleteFead);

export default router;

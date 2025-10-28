import express, { type Router as RouterType } from 'express';
import {
  getFeads,
  getFead,
  createFead,
  updateFead,
  deleteFead,
} from '../controllers/feadsController.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/feads - Get all feads for authenticated user
router.get('/', getFeads);

// GET /api/feads/:id - Get a single fead
router.get('/:id', getFead);

// POST /api/feads - Create a new fead
router.post('/', createFead);

// PUT /api/feads/:id - Update a fead
router.put('/:id', updateFead);

// DELETE /api/feads/:id - Delete a fead
router.delete('/:id', deleteFead);

export default router;

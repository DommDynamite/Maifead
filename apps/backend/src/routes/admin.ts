import { Router, type Router as RouterType } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getUsers,
  approveUser,
  banUser,
  unbanUser,
  getInviteCodes,
  generateInviteCode,
  deleteInviteCode,
} from '../controllers/adminController.js';

const router: RouterType = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management
router.get('/users', getUsers);
router.post('/users/:userId/approve', approveUser);
router.post('/users/:userId/ban', banUser);
router.post('/users/:userId/unban', unbanUser);

// Invite code management
router.get('/invite-codes', getInviteCodes);
router.post('/invite-codes', generateInviteCode);
router.delete('/invite-codes/:codeId', deleteInviteCode);

export default router;

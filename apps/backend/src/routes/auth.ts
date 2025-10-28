import { Router, type Router as RouterType } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.patch('/me', authenticate, AuthController.updateProfile);
router.delete('/me', authenticate, AuthController.deleteAccount);

export default router;

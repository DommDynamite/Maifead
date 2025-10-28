import { Router, type Router as RouterType } from 'express';
import { FeedItemsController } from '../controllers/feedItemsController.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();

router.use(authenticate);

router.get('/', FeedItemsController.getAll);
router.get('/:id', FeedItemsController.getOne);
router.patch('/:id/read', FeedItemsController.markRead);
router.patch('/:id/saved', FeedItemsController.markSaved);
router.post('/mark-all-read', FeedItemsController.markAllRead);

export default router;

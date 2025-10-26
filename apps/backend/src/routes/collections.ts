import { Router } from 'express';
import { CollectionsController } from '../controllers/collectionsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', CollectionsController.getAll);
router.get('/:id', CollectionsController.getOne);
router.post('/', CollectionsController.create);
router.patch('/:id', CollectionsController.update);
router.delete('/:id', CollectionsController.delete);
router.post('/:id/items/:itemId', CollectionsController.addItem);
router.delete('/:id/items/:itemId', CollectionsController.removeItem);

export default router;

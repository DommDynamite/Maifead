import { Router } from 'express';
import { SourcesController } from '../controllers/sourcesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', SourcesController.getAll);
router.post('/', SourcesController.create);
router.patch('/:id', SourcesController.update);
router.delete('/:id', SourcesController.delete);
router.post('/:id/refresh', SourcesController.refresh);
router.post('/update-icons', SourcesController.updateIcons);

export default router;

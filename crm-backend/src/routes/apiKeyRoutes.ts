import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { generateApiKey, getApiKeys, revokeApiKey } from '../controllers/apiKeyController';

const router = Router();

// Apply Enterprise Security: Only logged-in users can manage API Keys
router.use(requireAuth);

router.post('/', generateApiKey);
router.get('/', getApiKeys);
router.delete('/:id', revokeApiKey);

export default router;
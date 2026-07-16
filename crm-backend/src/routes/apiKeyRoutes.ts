import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
// 🔥 IMPORTING THE CORRECT, UPDATED FUNCTION NAMES
import { createApiKey, getApiKeys, deleteApiKey } from '../controllers/apiKeyController';

const router = Router();

// Apply Enterprise Security: Only logged-in users can manage API Keys
router.use(requireAuth);

router.post('/', createApiKey);
router.get('/', getApiKeys);
router.delete('/:id', deleteApiKey);

export default router;
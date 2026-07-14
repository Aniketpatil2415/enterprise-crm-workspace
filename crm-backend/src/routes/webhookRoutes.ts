import { Router } from 'express';
import { requireApiKey } from '../middlewares/requireApiKey';
import { injectLeadViaWebhook } from '../controllers/webhookController';
import cors from 'cors';

const router = Router();

// Allow external systems to hit this specific endpoint
router.use(cors());

// ENTERPRISE SECURITY: Enforce API Key validation before hitting the controller
router.post('/lead', requireApiKey, injectLeadViaWebhook);

export default router;
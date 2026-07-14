import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { createDeal, getDeals } from '../controllers/dealController';

const router = Router();

// Secure all deal routes with Auth Middleware
router.use(requireAuth);

router.post('/', createDeal);
router.get('/', getDeals);

export default router;
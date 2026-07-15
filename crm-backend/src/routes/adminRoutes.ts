import { Router } from 'express';
import { getPlatformStats, getWorkspaceDeepDive } from '../controllers/adminController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

// 🔥 CLASSIFIED ROUTES: God Mode Only
router.use(requireAuth);

router.get('/stats', getPlatformStats);
router.get('/workspace/:targetWorkspaceId', getWorkspaceDeepDive);

export default router;
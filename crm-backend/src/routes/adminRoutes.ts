import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { getPlatformStats, toggleWorkspaceStatus, getWorkspaceDeepDive } from '../controllers/adminController';

const router = Router();

// Secure all admin routes
router.use(requireAuth);

router.get('/platform-stats', getPlatformStats);
router.patch('/workspace/:targetWorkspaceId/status', toggleWorkspaceStatus);

// 🔥 NEW ROUTE: The deep dive data extractor
router.get('/workspace/:targetWorkspaceId/deep-dive', getWorkspaceDeepDive);

export default router;
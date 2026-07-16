import { Router } from 'express';
import { getPlatformStats, getWorkspaceDeepDive, toggleWorkspaceStatus } from '../controllers/adminController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

// 🔥 CLASSIFIED ROUTES: God Mode Only
// All requests passing through here will be intercepted by the strict middleware
router.use(requireAuth);

router.get('/stats', getPlatformStats);
router.patch('/workspace/:targetWorkspaceId/status', toggleWorkspaceStatus); // The Missing Kill Switch is now active
router.get('/workspace/:targetWorkspaceId', getWorkspaceDeepDive);

export default router;
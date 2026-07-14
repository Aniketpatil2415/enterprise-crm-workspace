import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { generateInviteLink, verifyInviteToken } from '../controllers/inviteController';

const router = Router();

// PUBLIC ROUTE: Anyone clicking the link can verify it
router.get('/verify/:token', verifyInviteToken);

// SECURE ROUTE: Only logged-in Admins/Owners can generate links
router.use(requireAuth);
router.post('/', generateInviteLink);

export default router;
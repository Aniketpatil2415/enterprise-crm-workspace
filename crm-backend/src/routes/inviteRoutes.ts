import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { generateInviteLink } from '../controllers/inviteController';

const router = Router();

// Secure route: Only logged-in users (checked further for ADMIN/OWNER in controller)
router.use(requireAuth);

router.post('/', generateInviteLink);

export default router;
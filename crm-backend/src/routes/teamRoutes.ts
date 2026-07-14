import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { getTeamMembers, updateTeamRole } from '../controllers/teamController';

const router = Router();

// Apply Enterprise Security Middleware
router.use(requireAuth);

router.get('/', getTeamMembers);
router.patch('/:id/role', updateTeamRole);

export default router;
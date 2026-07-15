import { Router } from 'express';
import { getTeamMembers } from '../controllers/teamController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', getTeamMembers);

export default router;
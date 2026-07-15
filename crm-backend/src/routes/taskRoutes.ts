import { Router } from 'express';
import { createTask, getTasks } from '../controllers/taskController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.use(requireAuth);

router.post('/', createTask);
router.get('/', getTasks);

export default router;
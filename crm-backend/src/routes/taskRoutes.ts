import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { createTask, getTasks, updateTaskStatus, deleteTask } from '../controllers/taskController';

const router = Router();

// Secure all task routes
router.use(requireAuth);

router.post('/', createTask);
router.get('/', getTasks);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;
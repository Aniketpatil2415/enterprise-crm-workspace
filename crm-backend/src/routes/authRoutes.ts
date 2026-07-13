import { Router } from 'express';
import { registerWorkspace } from '../controllers/authController';

const router = Router();

// Endpoint: POST /api/auth/register
router.post('/register', registerWorkspace);

export default router;
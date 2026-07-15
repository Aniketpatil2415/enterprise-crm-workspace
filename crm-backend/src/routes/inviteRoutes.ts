import { Router } from 'express';
import { createInvite, verifyInvite } from '../controllers/inviteController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

// PUBLIC ROUTE (No Auth Required for verification)
router.get('/verify/:token', verifyInvite); 

// PROTECTED ROUTE (Requires Auth to generate invites)
router.post('/', requireAuth, createInvite);

export default router;
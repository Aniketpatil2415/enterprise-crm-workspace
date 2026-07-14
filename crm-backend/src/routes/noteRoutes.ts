import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { createNote, getNotes } from '../controllers/noteController';

const router = Router();

router.use(requireAuth);

router.post('/', createNote);
router.get('/', getNotes);

export default router;